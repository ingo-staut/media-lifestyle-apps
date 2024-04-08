import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { FILTERS } from "../../data/filter.data";
import { FilterFunctions } from "../../models/filter.functions";
import { SearchFilterService } from "./search.filter.service";
import { SearchUrlService } from "./search.url.service";

@Injectable({
  providedIn: "root",
})
export class SearchQuickNavigateService {
  constructor(
    @Inject(Router) private router: Router,
    private searchFilterService: SearchFilterService,
    private searchUrlService: SearchUrlService
  ) {}

  openSearchWithFilterMediaFavorite() {
    this.searchFilterService.removeAllFilters();

    FILTERS.map((f) => {
      if (f.key === "favorite") {
        f.show = true;

        const filter = FilterFunctions.getFilterButtonTristate(f);
        if (filter) filter.value = ButtonTristate.TRUE;

        return filter;
      } else {
        return f;
      }
    });

    this.searchUrlService.navigateToSearchUrl();
  }

  openSearchWithFilterMediaLastEditedToday() {
    this.searchFilterService.removeAllFilters();

    FILTERS.map((f) => {
      if (f.key === "edited-dates") {
        f.show = true;

        const filter = FilterFunctions.getFilterDates(f);
        if (filter) filter.value = "today";

        return filter;
      } else {
        return f;
      }
    });

    this.searchUrlService.navigateToSearchUrl();
  }

  openSearchWithSearchText(text: string) {
    this.searchFilterService.removeAllFilters();

    this.searchUrlService.navigateToSearchUrl(text);
  }
}
