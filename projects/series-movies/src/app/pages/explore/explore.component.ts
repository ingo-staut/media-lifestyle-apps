import { AfterViewInit, Component, OnDestroy } from "@angular/core";
import { environment } from "projects/series-movies/src/environments/environment";
import { Subject, map, takeUntil } from "rxjs";
import { findSourceByText } from "shared/data/discovery-source.data";
import { DiscoverySource } from "shared/models/enum/discovery-source.enum";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { Media } from "../../models/media.class";
import { MediaApiService } from "../../services/media.api.service";
import { RoutingService } from "../../services/routing.service";

type TabType = {
  media: Media;
  showDivider: boolean;
  text: string;
  icon?: string;
  searchValue?: string;
};

@Component({
  selector: "app-explore",
  templateUrl: "./explore.component.html",
  styleUrls: ["./explore.component.scss"],
})
export class ExploreComponent implements OnDestroy, AfterViewInit {
  private readonly destroySubject = new Subject<void>();
  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly COUNT_MORE = environment.production ? 5 : 1;
  readonly COUNT_INITIAL = environment.production ? (this.isSmallScreen.matches ? 5 : 10) : 1;

  topSeriesInThisAndLastYearCount: number = this.COUNT_INITIAL;
  topSeriesInThisAndLastYear$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => !media.isMovie && media.topInThisAndLastYear && media.showInExplore)
        .sort(Media.sortByImdbRatingDescending)
    )
  );

  topMoviesInThisAndLastYearCount: number = this.COUNT_INITIAL;
  topMoviesInThisAndLastYear$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => media.isMovie && media.topInThisAndLastYear && media.showInExplore)
        .sort(Media.sortByImdbRatingDescending)
    )
  );

  topMetascoreRatingCount: number = this.COUNT_INITIAL;
  topMetascoreRating$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => media.ratingMetascore && media.showInExplore)
        .sort(Media.sortByMetascoreRatingDescending)
    )
  );

  kinoPlusCount: number = this.COUNT_INITIAL;
  kinoPlus$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter(
          (media) => media.showInExplore && media.hasDiscoverySourceByKey(DiscoverySource.KINO_PLUS)
        )
        .sort(Media.sortByMetascoreRatingDescending)
    )
  );

  csbCount: number = this.COUNT_INITIAL;
  csb$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter(
          (media) => media.showInExplore && media.hasDiscoverySourceByKey(DiscoverySource.CSB)
        )
        .sort(Media.sortByMetascoreRatingDescending)
    )
  );

  redditCount: number = this.COUNT_INITIAL;
  reddit$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter(
          (media) => media.showInExplore && media.hasDiscoverySourceByKey(DiscoverySource.REDDIT)
        )
        .sort(Media.sortByImdbRatingDescending)
    )
  );

  otherSourcesCount: number = this.COUNT_INITIAL;
  otherSources$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter(
          (media) =>
            media.showInExplore &&
            media.sources.length &&
            !(
              media.hasDiscoverySourceByKey(DiscoverySource.REDDIT) ||
              media.hasDiscoverySourceByKey(DiscoverySource.CSB) ||
              media.hasDiscoverySourceByKey(DiscoverySource.KINO_PLUS)
            )
        )
        .sort(Media.sortByImdbRatingDescending)
        .sort(Media.sortByFirstSourceDescending)
        .map((media, index, array) => this.groupMediaBySources(media, index, array))
    )
  );

  otherSourcesIcons$ = this.otherSources$.pipe(
    map((sources) => [
      ...new Set(sources.map((source) => source.icon).filter((icon): icon is string => !!icon)),
    ])
  );

  otherSourcesNoIcon$ = this.otherSources$.pipe(
    map((sources) => [
      ...new Set(sources.filter((source) => !source.icon).map((source) => source.text)),
    ])
  );

  germanMoviesCount: number = this.COUNT_INITIAL;
  germanMovies$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => media.isMovie && media.showInExplore && media.isGerman)
        .sort(Media.sortByYearDescendingAndImdbRatingDescending)
    )
  );

  germanSeriesCount: number = this.COUNT_INITIAL;
  germanSeries$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => !media.isMovie && media.showInExplore && media.isGerman)
        .sort(Media.sortByYearDescendingAndImdbRatingDescending)
    )
  );

  mediaInternationalCount: number = this.COUNT_INITIAL;
  mediaInternational$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        // Alle Deutschen und Englischen Filme, die Entdecken oder In Zukunft ist, herausfiltern
        .filter((media) => media.showInExplore && media.isInternational)
        .sort(Media.sortByYearDescendingAndImdbRatingDescending)
    )
  );

  seriesOldButGoldCount: number = this.COUNT_INITIAL;
  seriesOldButGold$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => !media.isMovie && media.oldButGold)
        .sort(Media.sortByImdbRatingDescending)
    )
  );

  moviesOldButGoldCount: number = this.COUNT_INITIAL;
  moviesOldButGold$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => media.isMovie && media.oldButGold)
        .sort(Media.sortByImdbRatingDescending)
    )
  );

  mediaLGBTQCount: number = this.COUNT_INITIAL;
  mediaLGBTQ$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => media.genreIds.includes(11) && media.isExplore)
        .sort(Media.sortByYearDescendingAndImdbRatingDescending)
    )
  );

  mediaWithGoodWatchabilityCount: number = this.COUNT_INITIAL;
  mediaWithGoodWatchability$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter(
          (media) =>
            // Lässt sich nicht als Suchfilter darstellen
            (media.isExplore || (media.isCurrent && media.isMovie)) &&
            !!media.ratingWatchability &&
            media.ratingWatchability >= 6
        )
        .sort(Media.sortByWatchabilityRatingAndImdbRatingDescending)
    )
  );

  constructor(
    private mediaApiService: MediaApiService,
    private routingService: RoutingService,
    private mediaDialogService: MediaDialogService,
    protected localeService: LocaleService
  ) {}

  ngAfterViewInit(): void {
    this.routingService.getMediaFromRoute().subscribe((media) => {
      this.mediaDialogService.openAndReloadData(media);
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  groupMediaBySources(media: Media, index: number, mediaList: Media[]): TabType {
    const firstSource = media.firstDiscoverySource;
    const isFirstItem = index === 0;
    const text = findSourceByText(firstSource)?.name ?? firstSource;
    const icon = findSourceByText(firstSource)?.icon;
    const searchValue = findSourceByText(firstSource)?.key ?? firstSource;
    const data: TabType = {
      media,
      showDivider: false,
      text,
      icon,
      searchValue,
    };

    if (isFirstItem || firstSource !== mediaList[index - 1].sources[0]) {
      return {
        ...data,
        showDivider: true,
      };
    }

    return data;
  }

  onLoadMoreTopMetascore() {
    this.topMetascoreRatingCount += this.COUNT_MORE;
  }

  onLoadMoreTopSeriesInThisAndLastYear() {
    this.topSeriesInThisAndLastYearCount += this.COUNT_MORE;
  }

  onLoadMoreTopMoviesInThisAndLastYear() {
    this.topMoviesInThisAndLastYearCount += this.COUNT_MORE;
  }

  onLoadMoreGermanMovies() {
    this.germanMoviesCount += this.COUNT_MORE;
  }

  onLoadMoreGermanSeries() {
    this.germanSeriesCount += this.COUNT_MORE;
  }

  onLoadMoreInternational() {
    this.mediaInternationalCount += this.COUNT_MORE;
  }

  onLoadMoreSeriesOldButGold() {
    this.seriesOldButGoldCount += this.COUNT_MORE;
  }

  onLoadMoreMoviesOldButGold() {
    this.moviesOldButGoldCount += this.COUNT_MORE;
  }

  onLoadMoreLGBTQ() {
    this.mediaLGBTQCount += this.COUNT_MORE;
  }

  onLoadMoreKinoPlus() {
    this.kinoPlusCount += this.COUNT_MORE;
  }

  onLoadMoreCSB() {
    this.csbCount += this.COUNT_MORE;
  }

  onLoadMoreReddit() {
    this.redditCount += this.COUNT_MORE;
  }

  onLoadMoreWithGoodWatchability() {
    this.mediaWithGoodWatchabilityCount += this.COUNT_MORE;
  }
}
