import { Component, Input } from "@angular/core";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { LAYOUT_TOGGLE } from "../../../../../../shared/data/layout.data";
import { ResultListLayout } from "../../../../../../shared/models/enum/result-list-layout.enum";
import { SortingDirection } from "../../../../../../shared/models/enum/sort-direction.enum";
import { SEARCH_SORT_TYPES_DATA } from "../../data/sort.data";
import { SortType } from "../../models/enum/sort.enum";
import { SearchLayoutService } from "../../pages/search/search.layout.service";
import { SearchSortingService } from "../../pages/search/search.sorting.service";
import { SearchUrlService } from "../../pages/search/search.url.service";

@Component({
  selector: "app-search-sorting",
  templateUrl: "./search-sorting.component.html",
  styleUrls: ["./search-sorting.component.scss"],
})
export class SearchSortingComponent {
  @Input() results: any[] | null = [];

  LAYOUT_TOGGLE = LAYOUT_TOGGLE;
  ResultListLayout = ResultListLayout;
  SortType = SortType;
  SEARCH_SORT_TYPES_DATA = SEARCH_SORT_TYPES_DATA;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  layout$ = this.searchLayoutService.layout$;
  sortingType$ = this.searchSortingService.sortingType$;
  sortingDirection$ = this.searchSortingService.sortingDirection$;

  constructor(
    private searchLayoutService: SearchLayoutService,
    private searchSortingService: SearchSortingService,
    private searchUrlService: SearchUrlService
  ) {}

  onLayoutChanged(layout: ResultListLayout) {
    this.searchLayoutService.setLayout(layout);
  }

  onChangeSortDirection(sortingDirection: SortingDirection) {
    this.searchSortingService.setSortingDirection(sortingDirection);
    this.searchUrlService.setSearchUrl();
  }

  onChangeSortType(sortType: SortType) {
    this.searchSortingService.setSorting(sortType);
    this.searchUrlService.setSearchUrl();
  }
}
