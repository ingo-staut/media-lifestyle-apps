import { Location } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Params, Router } from "@angular/router";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { ResultListLayout } from "../../../../../../shared/models/enum/result-list-layout.enum";
import { SortingDirection } from "../../../../../../shared/models/enum/sort-direction.enum";
import { SEARCH_SORT_TYPES_DATA } from "../../data/sort.data";
import { SortType } from "../../models/enum/sort.enum";
import { FilterFunctions } from "../../models/filter.functions";
import { SearchLayoutService } from "./search.layout.service";
import { SearchService } from "./search.service";
import { SearchSortingService } from "./search.sorting.service";

const FILTER_ALL_PARAM = "filter";
const SEARCH_PARAM = "q";
const SORTING = "sort";
const LAYOUT = "layout";
const SORTING_DIRECTION = "asc";

@Injectable({
  providedIn: "root",
})
export class SearchUrlService {
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(
    @Inject(Router) private router: Router,
    private location: Location,
    private searchService: SearchService,
    private searchSortingService: SearchSortingService,
    private searchLayoutService: SearchLayoutService
  ) {}

  setSearchUrl() {
    const url = this.router
      .createUrlTree([], {
        queryParams: this.getQueryParams(),
      })
      .toString();
    this.location.replaceState(url);
  }

  navigateToSearchUrl(searchText?: string) {
    const queryParams = this.getQueryParams();
    if (searchText) queryParams[SEARCH_PARAM] = searchText;

    const url = this.router
      .createUrlTree(["/search"], {
        queryParams,
      })
      .toString();
    this.router.navigateByUrl(url);
  }

  getQueryParams() {
    var queryParams: { [k: string]: any } = {};

    if (this.searchService.searchValueSnapshot)
      queryParams[SEARCH_PARAM] = this.searchService.searchValueSnapshot;
    // ! Hier muss dynamisch der Wert gesetzt werden von dem ersten DropdownFilter
    queryParams[FILTER_ALL_PARAM] = "recipes";

    if (this.searchSortingService.sortingDirectionSnapshot === SortingDirection.ASC) {
      queryParams[SORTING_DIRECTION] = "true";
    }

    if (this.searchSortingService.sortingTypeSnapshot !== SortType.SORT_SEARCH_RESULTS) {
      queryParams[SORTING] = SEARCH_SORT_TYPES_DATA.find(
        (sort) => sort.type === this.searchSortingService.sortingTypeSnapshot
      )?.key;
    }

    queryParams[LAYOUT] = this.searchLayoutService.layoutSnapshot.toLocaleLowerCase();

    FilterFunctions.setAllValuesToParams(queryParams);

    return queryParams;
  }

  getSearchValueFromParams(params: Params) {
    return params[SEARCH_PARAM];
  }

  getSortingDirectionFromParams(params: Params) {
    return params[SORTING_DIRECTION] === "true" ? SortingDirection.ASC : SortingDirection.DESC;
  }

  getSortingFromParams(params: Params) {
    const sortType = SEARCH_SORT_TYPES_DATA.find((sort) => sort.key === params[SORTING]);
    return sortType ? sortType.type : SortType.SORT_SEARCH_RESULTS;

    // params[SORTING] !== SortType.SORT_SEARCH_RESULTS
    // ? SORT_TYPES.find((type) => type.key === params[SORTING])?.type ??
    //     SortType.SORT_SEARCH_RESULTS
    // : SortType.SORT_SEARCH_RESULTS
  }

  getLayoutFromParams(params: Params): ResultListLayout {
    return (
      params[LAYOUT]?.toUpperCase() ??
      (this.isSmallScreen.matches ? ResultListLayout.LIST : ResultListLayout.GRID)
    );
  }
}
