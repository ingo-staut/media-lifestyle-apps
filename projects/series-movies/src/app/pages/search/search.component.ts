import { Platform } from "@angular/cdk/platform";
import { Location } from "@angular/common";
import { Component, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, combineLatest, debounceTime, map, startWith, take, takeUntil } from "rxjs";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { ResultListLayout } from "shared/models/enum/result-list-layout.enum";
import { SortingDirection } from "shared/models/enum/sort-direction.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { compareTextWithSearchValue } from "shared/utils/string";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import { SEARCH_SORT_TYPES_DATA } from "../../data/sort.data";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { SortKey, SortType } from "../../models/enum/sort.enum";
import { FilterFunctions } from "../../models/filter.functions";
import { Media } from "../../models/media.class";
import { ChannelApiService } from "../../services/channel.api.service";
import { MediaDialogCreateService } from "../../services/dialogs/media.dialog.create.service";
import { MediaApiService } from "../../services/media.api.service";
import { RoutingService } from "../../services/routing.service";
import { RESULTS_COUNT_APPEND, SearchFilterService } from "./search.filter.service";
import { SearchLayoutService } from "./search.layout.service";
import { SearchService } from "./search.service";
import { SearchSortingService } from "./search.sorting.service";
import { SearchSuggestionService } from "./search.suggestion.service";
import { SearchUrlService } from "./search.url.service";

const FILTER_ALL_PARAM = "filter";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnDestroy {
  private readonly destroySubject = new Subject<void>();

  readonly SortType = SortType;
  readonly SortKey = SortKey;
  readonly ResultListLayout = ResultListLayout;
  readonly SortingDirection = SortingDirection;
  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly SEARCH_SORT_TYPES_DATA = SEARCH_SORT_TYPES_DATA;

  readonly isMobileDevice = this.platform.ANDROID || this.platform.IOS;

  @ViewChild("searchBar") searchBar: SearchBarComponent;

  filtersSet$ = this.searchFilterService.filtersSet$.pipe(takeUntil(this.destroySubject));

  searchValue$ = this.searchService.searchValue$.pipe(takeUntil(this.destroySubject));
  sortingType$ = this.searchSortingService.sortingType$.pipe(takeUntil(this.destroySubject));
  sortingDirection$ = this.searchSortingService.sortingDirection$.pipe(
    takeUntil(this.destroySubject)
  );
  layout$ = this.searchLayoutService.layout$.pipe(takeUntil(this.destroySubject));

  quickAddFilterFromSearch$ = this.searchFilterService.quickAddFilterFromSearch$.pipe(
    takeUntil(this.destroySubject)
  );

  filteredMedia$ = combineLatest([
    this.mediaApiService.media$,
    this.channelApiService.channels$,
    // StartWith dafür, dass beim Reload Daten geladen werden
    this.searchValue$.pipe(startWith(""), debounceTime(500)),
    this.sortingType$,
    this.sortingDirection$,
    this.searchFilterService.filters$,
  ]).pipe(
    debounceTime(100),
    map(([mediaList, channels, searchValue, sortType, sortingDirection, filters]) => {
      this.searchUrlService.setSearchUrl();

      searchValue = searchValue?.trim();

      const sortAsc = sortingDirection === SortingDirection.ASC;

      return mediaList
        .filter((media) => {
          const matchScoreName = compareTextWithSearchValue(media.name, searchValue);
          const matchScoreNameOriginal = compareTextWithSearchValue(
            media.nameOriginal,
            searchValue
          );
          const matchScoreNote = compareTextWithSearchValue(media.note, searchValue);
          const matchScoreTags = media.tags.reduce(
            (acc, tag) => (acc += compareTextWithSearchValue(tag, searchValue)),
            0
          );

          const matchScore =
            matchScoreName +
            matchScoreNameOriginal / 2 +
            matchScoreTags / 4 +
            (matchScoreNote === 0 ? 0 : matchScoreNote / 3);

          media._searchMatchScore = Math.round(matchScore);

          // Suchbegriff oder Filter gesetzt
          // ! Sonst werden alle Medien angezeigt
          return (
            (searchValue || this.searchFilterService.filtersSetSnapshot) &&
            // Suchbegriff
            (matchScore > 0 || !searchValue) &&
            // Filter
            filters.every((filter) => {
              if (FilterFunctions.isValueSet(filter)) {
                return FilterFunctions.triggerFunction(media, filter, channels);
              }
              return true;
            })
          );
        })
        .sort(this.searchSortingService.sortMedia(sortType, sortAsc));
    }),
    takeUntil(this.destroySubject)
  );

  results$ = combineLatest([
    this.filteredMedia$.pipe(startWith([] as Media[])),
    this.searchFilterService.resultCount$,
  ]).pipe(
    // Ersten x Ergebnisse
    map(([media, resultCount]) => media.slice(0, resultCount))
  );

  constructor(
    private location: Location,
    private mediaApiService: MediaApiService,
    private channelApiService: ChannelApiService,
    private activeRoute: ActivatedRoute,
    private routingService: RoutingService,
    private mediaDialogService: MediaDialogService,
    private mediaDialogCreateService: MediaDialogCreateService,
    private platform: Platform,
    private searchService: SearchService,
    private searchSortingService: SearchSortingService,
    private searchLayoutService: SearchLayoutService,
    private searchUrlService: SearchUrlService,
    protected searchSuggestionService: SearchSuggestionService,
    protected searchFilterService: SearchFilterService
  ) {}

  ngOnInit(): void {
    if (this.isSmallScreen.matches) {
      this.searchLayoutService.setLayout(ResultListLayout.LIST);
    }

    this.searchSuggestionService.nextRandomSuggestion();

    // Feuert jedesmal, wenn die URL geändert wird
    this.location.onUrlChange((url) => {
      // WORKAROUND, dass wenn Rezept
      // geschlossen wird Filter gesetzt werden
      if (url === "/search") {
        this.searchUrlService.setSearchUrl();
      }
    });

    // Änderungen der URL
    this.activeRoute.queryParams.pipe(takeUntil(this.destroySubject)).subscribe((params) => {
      // WORKAROUND, dass nachdem URL mit richtigen Parametern geladen wurde
      // und ein Rezept geöffnet und geschlossen wird, QueryParams leer sind
      if (Object.keys(params).length === 0) {
        this.searchUrlService.setSearchUrl();
        params = this.searchUrlService.getQueryParams();
      }

      if (params["id"]) {
        this.mediaApiService
          .getMediaById(params["id"])
          .pipe(take(1))
          .subscribe((media) => this.mediaDialogService.openAndReloadData(media));
      }

      this.searchFilterService.setFilters(FilterFunctions.getAllValuesFromParams(params));
      this.searchService.setSearchValue(this.searchUrlService.getSearchValueFromParams(params));
      this.searchSortingService.setSortingDirection(
        this.searchUrlService.getSortingDirectionFromParams(params)
      );
      this.searchSortingService.setSorting(this.searchUrlService.getSortingFromParams(params));
      this.searchLayoutService.setLayout(this.searchUrlService.getLayoutFromParams(params));
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();

    this.removeAllFilters();
    this.searchService.clearSearchValue();
  }

  onClose() {
    this.routingService.backToOneMainScreen();
  }

  onChange(value: string) {
    this.searchService.setSearchValue(value);
    this.searchUrlService.setSearchUrl();
  }

  removeAllFilters() {
    this.searchFilterService.removeAllFilters();
  }

  onEnter() {
    this.filteredMedia$.pipe(take(1)).subscribe((mediaList) => {
      // Erste Serie oder Film in den Ergebnissen öffnen
      if (mediaList.length > 0)
        this.mediaDialogService.openAndReloadData(mediaList[0], {
          searchText: this.searchService.searchValueSnapshot,
        });
      // Ersten QuickAddFilter ausführen
      else {
        this.quickAddFilterFromSearch$.pipe(take(1)).subscribe((filters) => {
          if (!filters || filters.length === 0) return;
          filters[0].func();
        });
      }
    });
  }

  searchInputFocus() {
    this.searchBar.onFocus();
  }

  onLoadMoreResults() {
    this.searchFilterService.addResultCount(RESULTS_COUNT_APPEND);
  }

  onOpenCreateDialogByKey(key: string) {
    this.mediaDialogCreateService.openCreateDialogByKey(
      key,
      this.searchService.searchValueSnapshot
    );
  }

  onAddGenre(genre: string) {
    const filterGenre = this.searchFilterService.filtersSnapshot.find(
      (f) => f.key === FilterKey.GENRES
    );

    if (!filterGenre) return;

    const filter = FilterFunctions.getFilterMultiSelect(filterGenre);
    if (!filter) return;

    // Wenn Genre bereits gesetzt, dann entfernen
    if (filter.value.includes(genre)) {
      this.searchFilterService.quickAddDropdownFilter([genre], false, true, FilterKey.GENRES);
      return;
    }

    this.searchFilterService.quickAddDropdownFilter([genre], true, false, FilterKey.GENRES);
  }
}
