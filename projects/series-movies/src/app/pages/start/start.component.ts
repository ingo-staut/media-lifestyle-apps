import { AfterViewInit, Component, OnDestroy } from "@angular/core";
import { ShowInSearchKey } from "projects/series-movies/src/app/models/show-in-search.enum";
import { BehaviorSubject, Subject, combineLatest, map, switchMap, takeUntil } from "rxjs";
import { Tab } from "shared/models/tab.type";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { environment } from "../../../environments/environment";
import { CarouselItem } from "../../components/carousel/carousel.component";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { Media } from "../../models/media.class";
import { MediaSuggestionService } from "../../services/media-suggestion.service";
import { MediaApiService } from "../../services/media.api.service";
import { MediaService } from "../../services/media.service";
import { RoutingService } from "../../services/routing.service";
import { SearchQuickNavigateService } from "../search/search.quick-navigate.service";

type TabType = {
  media: Media;
  showDivider: boolean;
  date?: Date;
};

@Component({
  selector: "app-start",
  templateUrl: "./start.component.html",
  styleUrls: ["./start.component.scss"],
})
export class StartComponent implements OnDestroy, AfterViewInit {
  private readonly destroySubject = new Subject<void>();
  isProduction = environment.production;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  today = new Date();

  media$ = this.mediaApiService.media$;

  showInSearchOptions: ShowInSearchKey[] = [
    "EPISODES_IN_TELEVISION_TODAY",
    "EPISODES_IN_TELEVISION_TOMORROW",
    "EPISODES_IN_TELEVISION_NEXT_X_DAYS",
  ];

  selectedTabIndexSubject = new BehaviorSubject<number>(0);

  mediaEpisodesInTVToday$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .flatMap((media) => {
          if (media.availableUntil && DateFns.isToday(media.availableUntil)) return media;

          return media.television?._episodesInTelevision
            ?.filter((episodeInTV) => DateFns.isToday(episodeInTV.date))
            .flatMap((episodeInTV) => {
              const m = new Media(media);
              m._episodeInTelevision = episodeInTV;
              return m;
            });
        })
        .filter((filter): filter is Media => !!filter)
        .sort((a, b) =>
          a.television?.date && DateFns.isAfter(a.television?.date, new Date()) ? -1 : 1
        )
        .sort(Media.sortByIsLiveAtStart)
    ),
    map((mediaList) => this.getMediaListWithAvailableUntilDivider(mediaList))
  );

  mediaEpisodesInTVTomorrow$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .flatMap((media) => {
          if (media.availableUntil && DateFns.isTomorrow(media.availableUntil)) return media;

          return media.television?._episodesInTelevision
            ?.filter((episodeInTV) =>
              DateFns.isSameDate(episodeInTV.date, DateFns.getTomorrowMorning())
            )
            .flatMap((episodeInTV) => {
              const m = new Media(media);
              m._episodeInTelevision = episodeInTV;
              return m;
            });
        })
        .filter((filter): filter is Media => !!filter)
    ),
    map((mediaList) => this.getMediaListWithAvailableUntilDivider(mediaList))
  );

  mediaEpisodesInTVNext7Days$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((mediaList) =>
      mediaList
        .flatMap((media) => {
          if (
            media.availableUntil &&
            DateFns.isDateBetweenDates(
              media.availableUntil,
              DateFns.getTomorrowMorning(),
              DateFns.addDaysToDate(DateFns.getTomorrowMorning(), 6)
            )
          )
            return media;

          return media.television?._episodesInTelevision
            ?.filter((episodeInTV) =>
              DateFns.isDateBetweenDates(
                episodeInTV.date,
                DateFns.getTomorrowMorning(),
                DateFns.addDaysToDate(DateFns.getTomorrowMorning(), 6)
              )
            )
            .flatMap((episodeInTV) => {
              const m = new Media(media);
              m._episodeInTelevision = episodeInTV;
              return m;
            });
        })
        .filter((filter): filter is Media => !!filter)
        .sort(
          (a, b) =>
            (a._episodeInTelevision?.date.getTime() ?? a.availableUntil?.getTime() ?? 0) -
            (b._episodeInTelevision?.date.getTime() ?? b.availableUntil?.getTime() ?? 0)
        )
    ),
    map((mediaList) => this.getMediaListWithAvailableUntilDivider(mediaList, true))
  );

  tabs: Tab<TabType>[] = [
    {
      name: "DATE.TODAY",
      icon: "calendar-today",
      data: this.mediaEpisodesInTVToday$,
    },
    {
      name: "DATE.TOMORROW",
      icon: "calendar-tomorrow",
      data: this.mediaEpisodesInTVTomorrow$,
    },
    {
      name: "DATE.NEXT_7_DAYS",
      icon: "calendar-week",
      data: this.mediaEpisodesInTVNext7Days$,
    },
  ];

  tabDates: (Date | null)[] = [new Date(), DateFns.addDaysToDate(new Date(), 1), null];

  selectedTabIndex$ = combineLatest([
    this.selectedTabIndexSubject.asObservable(),
    ...this.tabs.map((tab) => tab.data!),
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([selectedTabIndex, ...dataArrays]) => {
      // Bereits ausgewählt
      if (dataArrays && dataArrays[selectedTabIndex].length > 0) {
        return selectedTabIndex;
      }

      const index = dataArrays.findIndex((data) => data.length !== 0);
      if (index === -1) {
        return 0;
      }
      return index;
    })
  );

  noTabData$ = combineLatest([...this.tabs.map((tab) => tab.data!)]).pipe(
    takeUntil(this.destroySubject),
    map(([...dataArrays]) => dataArrays.every((data) => !data.length))
  );

  mediaInTelevision$ = this.selectedTabIndex$.pipe(
    takeUntil(this.destroySubject),
    switchMap((selectedTabIndex) => this.tabs[selectedTabIndex].data!)
  );

  favoriteMedia$ = this.mediaApiService.media$.pipe(
    takeUntil(this.destroySubject),
    map((media: Media[]) => media.filter((m) => m.favorite))
  );

  lastEditedMedia$ = this.mediaService.lastEditedMedia$.pipe(takeUntil(this.destroySubject));

  constructor(
    private mediaApiService: MediaApiService,
    private mediaService: MediaService,
    protected mediaSuggestionService: MediaSuggestionService,
    private searchQuickNavigateService: SearchQuickNavigateService,
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

  onTabChange(index: number): void {
    this.selectedTabIndexSubject.next(index);
  }

  onActionClickInCarousel(result: { item: CarouselItem; actionId: string; event: MouseEvent }) {
    const { item, actionId, event } = result;
    item.func(actionId, event);
  }

  onActionSearchClickInCarousel(result: { item: CarouselItem }) {
    const { item } = result;
    if (item.funcOpenSearch) item.funcOpenSearch();
  }

  onFavoriteActionClicked(actionId: string) {
    if (actionId === "search") {
      this.searchQuickNavigateService.openSearchWithFilterMediaFavorite();
    }
  }

  onEditedActionClicked(actionId: string) {
    if (actionId === "search") {
      this.searchQuickNavigateService.openSearchWithFilterMediaLastEditedToday();
    }
  }

  getMediaListWithAvailableUntilDivider(
    mediaList: Media[],
    extraDividerAtBeginning: boolean = false
  ) {
    return mediaList.map((media, index) => {
      const date = media._episodeInTelevision?.date ?? media.availableUntil ?? undefined;
      const data: TabType = {
        media,
        date,
        showDivider: false,
      };

      // Erstes Element
      if (index === 0) {
        data.showDivider = extraDividerAtBeginning;
        return data;
      }

      const previousDate = mediaList[index - 1]._episodeInTelevision?.date ?? media.availableUntil;

      data.showDivider = !!date && !!previousDate && !DateFns.isSameDate(date, previousDate);

      return data;
    });
  }
}
