import { AfterViewInit, Component, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject, combineLatest, map, switchMap, takeUntil } from "rxjs";
import { Tab } from "shared/models/tab.type";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { sortListIfValueTrueToFront } from "shared/utils/list";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { Channel } from "../../models/channel.class";
import { CINEMA_ID, ChannelType } from "../../models/enum/channel.enum";
import { Media } from "../../models/media.class";
import { ShowInSearchKey } from "../../models/show-in-search.enum";
import { ChannelApiService } from "../../services/channel.api.service";
import { MediaApiService } from "../../services/media.api.service";
import { RoutingService } from "../../services/routing.service";

@Component({
  selector: "app-watch",
  templateUrl: "./watch.component.html",
  styleUrls: ["./watch.component.scss"],
})
export class WatchComponent implements OnDestroy, AfterViewInit {
  private readonly destroySubject = new Subject<void>();
  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly splitMediaSeriesstartAndSeasonstartIfBiggerThan = this.isSmallScreen.matches ? 3 : 5;

  media$ = this.mediaApiService.media$.pipe(takeUntil(this.destroySubject));

  mediaEpisodesInTVAll$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList.filter(
        (media) =>
          !media.isMovie &&
          media.television?._episodesInTelevision?.length &&
          // Keine Folge ist Staffel- oder Serienstart
          !(
            media.television.onlyStart &&
            media.television._episodesInTelevision.some(
              (episodeInTv) => episodeInTv.episode.episode === 1
            )
          )
      )
    )
  );

  mediaEpisodeIsExpandedIndexes: boolean[] = [];

  showStartedWithoutLastEditedSubject = new BehaviorSubject<boolean>(false);
  showStartedWithoutLastEdited$ = this.showStartedWithoutLastEditedSubject.asObservable();
  /**
   * 1. Serien / Filme mit Zeitangabe in Notiz
   * 2. Zuletzt bearbeitete gestartete Serien
   * 3. Zuletzt bearbeitete Serien mit Serien- oder Staffelstart oder Staffelende
   * 4. Lange nicht bearbeitete gestartete Serien
   */
  mediaContinueWatching$ = combineLatest([
    this.mediaApiService.media$,
    this.showStartedWithoutLastEdited$,
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([mediaList, showStarted]) =>
      mediaList
        .map((media) => {
          const isSeries = !media.isMovie;
          const wasEditedTheLast5Days = media.wasEditedTheLast5Days;

          const isStarted =
            media.isStarted && ((wasEditedTheLast5Days && !showStarted) || showStarted);

          const isSeasonStartOrEndAndWithEpisodes =
            (media.isSeasonEnd && media.hasNextSeasonWithEpisodes) ||
            (media.isSeasonStart && !!media.currentSeasonEpisodes);

          const hasNextEpisodes =
            isSeasonStartOrEndAndWithEpisodes &&
            !media.isCurrent &&
            !media.isFuture &&
            wasEditedTheLast5Days;

          const continueWatchingNextEpisode = isSeries && (isStarted || hasNextEpisodes);

          return {
            media,
            showDivider: false,
            wasEditedTheLast5Days,
            continueWatchingNextEpisode,
            // Aktuelle Episode hat eine Notiz mit Zeitangabe
            currentEpisodeHasWatchtime: Media.getEpisodeProgressByEpisodeDetailWithDuration(
              media.currentEpisode,
              media.episodeDetails,
              media.runtime
            ),
            // Erste Episode im TV hat eine Notiz
            // (Absichtlich nicht mit `some` getestet, da man von ausgehen kann,
            // dass man nur an die erste Episode eine Zeit "30 Min." setzt
            // und nicht an irgendeine zufällige Episode im TV)
            episodeInTVWithWatchtime:
              media.television &&
              media.television._episodesInTelevision &&
              media.television._episodesInTelevision.length &&
              Media.getEpisodeProgressByEpisodeDetailWithDuration(
                media.television._episodesInTelevision[0].episode,
                media.episodeDetails,
                media.runtime
              )
                ? media.television._episodesInTelevision[0]
                : null,
          };
        })
        .filter((m) => {
          return (
            m.continueWatchingNextEpisode ||
            m.episodeInTVWithWatchtime ||
            m.currentEpisodeHasWatchtime
          );
        })
        // Nach letzter Bearbeitung sortieren
        .sort((media, other) => Media.sortByEditHistoryDescending(media.media, other.media))
        // Alle Staffelstart oder -ende nach hinten
        .sort((a, b) => Media.sortAllSeasonOrSeriesStartToEnd(a.media, b.media))
        // Alle nicht zuletzt bearbeiteten nach hinten
        .sort((a, b) =>
          sortListIfValueTrueToFront(a.wasEditedTheLast5Days, b.wasEditedTheLast5Days)
        )
        // Alle Serien mit einer Zeitangabe in der Notiz nach vorne
        .sort((a, b) =>
          sortListIfValueTrueToFront(
            !!a.currentEpisodeHasWatchtime || !!a.episodeInTVWithWatchtime,
            !!b.currentEpisodeHasWatchtime || !!b.episodeInTVWithWatchtime
          )
        )
        .map((media) => {
          if (media.episodeInTVWithWatchtime) {
            media.media._episodeInTelevision = media.episodeInTVWithWatchtime;
          }
          return media;
        })
    ),
    map((mediaList) =>
      mediaList.map((media, index) => {
        if (
          // Trennlinie zwischen Media mit Zeiten in Notiz
          (!(media.currentEpisodeHasWatchtime || media.episodeInTVWithWatchtime) &&
            index > 0 &&
            (mediaList[index - 1].currentEpisodeHasWatchtime ||
              mediaList[index - 1].episodeInTVWithWatchtime)) ||
          // Trennlinie zwischen Medien zulezt bearbeitet und Staffelstart- und ende
          ((media.media.isSeasonEnd || media.media.isSeasonStart) &&
            index > 0 &&
            !(
              mediaList[index - 1].media.isSeasonEnd || mediaList[index - 1].media.isSeasonStart
            )) ||
          // Trennlinie zwischen Staffelstart- und ende und lange nicht bearbeitet / gestarteten Status
          (!media.media.isSeasonEnd &&
            !media.media.isSeasonStart &&
            index > 0 &&
            (mediaList[index - 1].media.isSeasonEnd || mediaList[index - 1].media.isSeasonStart))
        ) {
          media.showDivider = true;
        }
        return media;
      })
    )
  );

  mediaSeriesOrSeasonStart$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => !media.isMovie && media.television && media.television.onlyStart)
        .flatMap((media) =>
          media.television?._episodesInTelevision
            ?.filter((episodeInTV) => DateFns.isBeforeOrToday(episodeInTV.date))
            // Staffel- oder Serienstart
            .filter((episodeInTV) => episodeInTV.episode.episode === 1)
            .flatMap((episodeInTV) => {
              const m = new Media(media);
              m._episodeInTelevision = episodeInTV;
              return m;
            })
        )
        .filter((filter): filter is Media => !!filter)
        // Nach Staffel sortieren:
        // Sortiert Staffelstarts nach vorne und Serienanfänge nach hinten
        .sort(
          (a, b) => b._episodeInTelevision!.episode.season - a._episodeInTelevision!.episode.season
        )
    ),
    map((mediaList) =>
      mediaList.map((media, index) => {
        if (
          media._episodeInTelevision!.episode.season <= 1 &&
          index > 0 &&
          mediaList[index - 1]._episodeInTelevision!.episode.season > 1
        ) {
          return {
            media,
            showDivider: true,
          };
        }

        return {
          media,
          showDivider: false,
        };
      })
    )
  );

  mediaSeriesStart$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => !media.isMovie && media.television && media.television.onlyStart)
        .flatMap((media) =>
          media.television?._episodesInTelevision
            ?.filter((episodeInTV) => DateFns.isBeforeOrToday(episodeInTV.date))
            .filter(
              (episodeInTV) => episodeInTV.episode.episode === 1 && episodeInTV.episode.season <= 1
            )
            .flatMap((episodeInTV) => {
              const m = new Media(media);
              m._episodeInTelevision = episodeInTV;
              return m;
            })
        )
        .filter((filter): filter is Media => !!filter)
        // Nach Staffel sortieren:
        // Sortiert Staffelstarts nach vorne und Serienanfänge nach hinten
        .sort(
          (a, b) => b._episodeInTelevision!.episode.season - a._episodeInTelevision!.episode.season
        )
    )
  );

  mediaSeasonStart$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => !media.isMovie && media.television && media.television.onlyStart)
        .flatMap((media) =>
          media.television?._episodesInTelevision
            ?.filter((episodeInTV) => DateFns.isBeforeOrToday(episodeInTV.date))
            .filter(
              (episodeInTV) => episodeInTV.episode.episode === 1 && episodeInTV.episode.season > 1
            )
            .flatMap((episodeInTV) => {
              const m = new Media(media);
              m._episodeInTelevision = episodeInTV;
              return m;
            })
        )
        .filter((filter): filter is Media => !!filter)
        // Nach Staffel sortieren:
        // Sortiert Staffelstarts nach vorne und Serienanfänge nach hinten
        .sort(
          (a, b) => b._episodeInTelevision!.episode.season - a._episodeInTelevision!.episode.season
        )
    )
  );

  mediaAvailableUntil$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .filter((media) => media.availableUntilTodayOrNext2Week)
        .sort((a, b) => a.availableUntil!.getTime() - b.availableUntil!.getTime())
    )
  );

  movies$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) => mediaList.filter((media) => media.isMovie))
  );

  // Filme-Tabs
  movieMissed$ = this.movies$.pipe(
    map((movies) => {
      return movies.filter(
        (movie) =>
          movie.hasTelevision &&
          // Vor 6 Monaten bis Heute
          DateFns.isBefore(movie.television!.date!, DateFns.addMonthsToDate(new Date(), -6))
      );
    })
  );

  movieNewInStream$ = combineLatest([this.movies$, this.channelApiService.channels$]).pipe(
    map(([movies, channels]) => {
      return movies.filter(
        (movie) =>
          movie.hasTelevision &&
          movie.television &&
          movie.television.channelId !== CINEMA_ID &&
          Channel.findChannelById(movie.television.channelId, channels)?.type !==
            ChannelType.TELEVISION_CHANNEL &&
          // Vor 2 Monate bis Heute
          DateFns.isDateBetweenDates(
            movie.television.date!,
            DateFns.addMonthsToDate(new Date(), -2),
            new Date()
          )
      );
    })
  );

  movieCurrentlyInCinema$ = this.movies$.pipe(
    map((movies) => {
      return movies.filter(
        (movie) =>
          movie.hasTelevision &&
          movie.television &&
          movie.television.channelId === CINEMA_ID &&
          // Vor 1 Monat bis Heute
          DateFns.isDateBetweenDates(
            movie.television.date!,
            DateFns.addMonthsToDate(new Date(), -1),
            new Date()
          )
      );
    })
  );

  movieNextInCinema$ = this.movies$.pipe(
    map((movies) => {
      return movies.filter(
        (movie) =>
          movie.hasTelevision &&
          movie.television &&
          movie.television.channelId === CINEMA_ID &&
          // Nächsten 3 Wochen
          DateFns.isDateBetweenDates(
            movie.television.date!,
            DateFns.getTomorrowMorning(),
            DateFns.addDaysToDate(new Date(), 21)
          )
      );
    })
  );

  movieNextInTelevision$ = combineLatest([this.movies$, this.channelApiService.channels$]).pipe(
    map(([movies, channels]) => {
      return movies.filter(
        (movie) =>
          movie.hasTelevision &&
          movie.television &&
          movie.television.channelId !== CINEMA_ID &&
          Channel.findChannelById(movie.television.channelId, channels)?.type ===
            ChannelType.TELEVISION_CHANNEL &&
          // Nächsten 7 Tage
          DateFns.isDateBetweenDates(
            movie.television.date!,
            new Date(),
            DateFns.addDaysToDate(new Date(), 7)
          )
      );
    })
  );

  movieTabs: Tab<Media, ShowInSearchKey>[] = [
    {
      name: "DATE.MISSED",
      icon: "calendar-missed",
      data: this.movieMissed$,
      showInSearch: "MOVIE_MISSED",
    },
    {
      name: "NEW_IN_STREAM",
      icon: "stream",
      data: this.movieNewInStream$,
      showInSearch: "MOVIE_NEW_IN_STREAM",
    },
    {
      name: "CINEMA.CURRENTLY_IN",
      icon: "cinema",
      data: this.movieCurrentlyInCinema$,
      showInSearch: "MOVIE_CURRENTLY_IN_THEATERS",
    },
    {
      name: "CINEMA.NEXT_IN",
      icon: "cinema",
      data: this.movieNextInCinema$,
      showInSearch: "MOVIE_COMING_SOON_TO_THEATERS",
    },
    {
      name: "NEXT_IN_TELEVISION",
      icon: "television",
      data: this.movieNextInTelevision$,
      showInSearch: "MOVIE_COMING_SOON_TO_TELEVISION",
    },
  ];

  selectedTabIndexMoviesSubject = new BehaviorSubject<number>(1);

  selectedTabIndexMovies$ = combineLatest([
    this.selectedTabIndexMoviesSubject.asObservable(),
    ...this.movieTabs.map((tab) => tab.data!),
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([selectedTabIndex, ...dataArrays]) => {
      // Bereits ausgewählt
      if (dataArrays && dataArrays[selectedTabIndex].length > 0) {
        return selectedTabIndex;
      }

      // Ersten Tab ("Verpasst") ignorieren
      const ignoreTabsCount = 1;
      const index = dataArrays.slice(ignoreTabsCount).findIndex((data) => data.length !== 0);
      if (index === -1) {
        return 0;
      }
      return index + ignoreTabsCount;
    })
  );

  noTabData$ = combineLatest([...this.movieTabs.map((tab) => tab.data!)]).pipe(
    takeUntil(this.destroySubject),
    map(([...dataArrays]) => dataArrays.every((data) => !data.length))
  );

  selectedDataMovies$ = this.selectedTabIndexMovies$.pipe(
    takeUntil(this.destroySubject),
    switchMap((selectedTabIndex) => this.movieTabs[selectedTabIndex].data!),
    map((mediaList) =>
      mediaList.map((media) => {
        media._episodeInTelevision = media.television?._episodesInTelevision![0];
        return media;
      })
    )
  );

  constructor(
    private mediaApiService: MediaApiService,
    private channelApiService: ChannelApiService,
    private routingService: RoutingService,
    private mediaDialogService: MediaDialogService
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

  onTabChange(index: number): void {
    this.selectedTabIndexMoviesSubject.next(index);
  }

  updateMarginInArray(index: number, event?: Event): void {
    event?.stopPropagation();
    this.mediaEpisodeIsExpandedIndexes[index] = !this.mediaEpisodeIsExpandedIndexes[index];
  }

  onLoadStartedSeries() {
    this.showStartedWithoutLastEditedSubject.next(true);
  }
}
