import { Injectable } from "@angular/core";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { DateFns } from "shared/utils/date-fns";
import { FILTERS } from "../../data/filter.data";
import { FilterFunctions } from "../../models/filter.functions";
import { SearchFilterService } from "./search.filter.service";
import { SearchUrlService } from "./search.url.service";

@Injectable({
  providedIn: "root",
})
export class SearchQuickNavigateService {
  constructor(
    private searchFilterService: SearchFilterService,
    private searchUrlService: SearchUrlService
  ) {}

  openSearchWithFilterRecipeFavorite() {
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

  openSearchWithFilterRecipeWithPortionsLeft() {
    this.searchFilterService.removeAllFilters();

    FILTERS.map((f) => {
      if (f.key === "portions-left") {
        f.show = true;

        const filter = FilterFunctions.getFilterButtonValue(f);
        if (filter) {
          filter.value = 1;
          filter.min = true;
        }

        return filter;
      } else {
        return f;
      }
    });

    this.searchUrlService.navigateToSearchUrl();
  }

  openSearchWithFilterRecipeOnShoppinglist() {
    this.searchFilterService.removeAllFilters();

    FILTERS.map((f) => {
      if (f.key === "on-shoppinglist") {
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

  openSearchWithFilterRecipeLastEditedToday() {
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

  openSearchWithFilterRecipePortionsLeft() {
    this.searchFilterService.removeAllFilters();

    FILTERS.map((f) => {
      if (f.key === "portions-left") {
        f.show = true;

        const filter = FilterFunctions.getFilterButtonValue(f);
        if (filter) {
          filter.value = 1;
          filter.min = true;
          filter.hideNullValues = true;
        }

        return filter;
      } else {
        return f;
      }
    });

    this.searchUrlService.navigateToSearchUrl();
  }

  openSearchWithFilterRecipePlanned(value: string) {
    this.searchFilterService.removeAllFilters();

    FILTERS.map((f) => {
      if (f.key === "planned-dates") {
        f.show = true;

        const filter = FilterFunctions.getFilterDates(f);
        if (filter) {
          filter.value = value;

          // Ausnahme: Nächste 7 Tage
          if (value === "next-days") {
            filter.data.map((data) => {
              if (data.key === "next-days") {
                data.value = {
                  range: {
                    from: DateFns.addDaysToDate(new Date(), 0),
                    to: DateFns.addDaysToDate(new Date(), 7),
                  },
                  showDayInput: true,
                };
              }

              return data;
            });
          }
        }

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
