import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Action } from "shared/models/action.type";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { DateFns } from "shared/utils/date-fns";
import { getRandomElementsFromList } from "shared/utils/list";
import { RATINGS } from "../../../../../../shared/data/rating.data";
import { CATEGORIES } from "../../data/category.data";
import { DIFFICULTIES } from "../../data/difficulty.data";
import { SEARCHTERM_SUGGESTIONS } from "../../data/search-terms.data";
import { CategoryType } from "../../models/enum/category.enum";
import { FilterFunctions } from "../../models/filter.functions";
import { RoutingService } from "../../services/routing.service";
import { SearchFilterService } from "./search.filter.service";
import { SearchService } from "./search.service";
import { SearchUrlService } from "./search.url.service";

@Injectable({
  providedIn: "root",
})
export class SearchSuggestionService {
  readonly SUGGESTIONS: Action[] = [
    {
      id: "",
      text: "SUGGESTION.BEST_RANKED_RECIPES",
      icon: "rating",
      func: () => {
        this.suggestionTypeGroup(FilterKey.RATING, "RATING.GOOD");
      },
    },
    {
      id: "",
      text: "SUGGESTION.EASY_RECIPES",
      icon: "difficulty",
      func: () => {
        this.suggestionTypeGroup(FilterKey.DIFFICULTIES, "DIFFICULTY.EASY");
      },
    },
    {
      id: "",
      text: "HISTORY.PREPARED_NOT",
      icon: "preparationHistory-prepared-no",
      func: () => {
        this.routingService.navigateToUrl(`/search?filter=recipes&prepared=false`);
      },
    },
  ];

  readonly SUGGESTIONS_CATEGORY = CATEGORIES.flatMap((category) => category.entries).map(
    (category) => this.suggestionCategory(category)
  );

  readonly SUGGESTIONS_CATEGORY_WITHOUT_SUGAR = CATEGORIES.map((category) =>
    this.suggestionCategoryWithoutSugar(category)
  );

  private randomSuggestionsSubject = new BehaviorSubject<Action[]>([]);
  randomSuggestions$ = this.randomSuggestionsSubject.asObservable();

  constructor(
    private searchFilterService: SearchFilterService,
    private searchService: SearchService,
    private searchUrlService: SearchUrlService,
    private routingService: RoutingService
  ) {}

  nextRandomSuggestion() {
    const randomSuggestions = getRandomElementsFromList(this.SUGGESTIONS, 1);
    const randomCategorySuggestions = getRandomElementsFromList(this.SUGGESTIONS_CATEGORY, 1);
    const randomCategoryWithoutSugarSuggestions = getRandomElementsFromList(
      this.SUGGESTIONS_CATEGORY_WITHOUT_SUGAR,
      1
    );
    const randomSearchText = getRandomElementsFromList(SEARCHTERM_SUGGESTIONS, 1)[0];
    const randomSearchTextSuggestion: Action = {
      id: "search",
      text: "SEARCH.FOR_WITH_QUOTATION_MARK",
      textReplace: randomSearchText,
      tooltip: "CLICK_TO_SEARCH",
      icon: "search",
      func: () => {
        this.routingService.navigateToUrl(`/search?q=${randomSearchText}&filter=recipes`);
      },
    };

    const startDate = DateFns.addMonthsToDate(new Date(), -1);
    const endData = new Date();
    const startDateText = DateFns.formatDateByFormatString(startDate, "yyyy-MM-dd");
    const endDateText = DateFns.formatDateByFormatString(endData, "yyyy-MM-dd");
    const filterForRecipesAddedButNoIngredients: Action = {
      id: "quick-fill",
      text: "RECIPE.ADD_MORE_DETAILS",
      tooltip: "CLICK_TO_SEARCH",
      icon: "quick-add",
      func: () => {
        this.routingService.navigateToUrl(
          `/search?filter=recipes&layout=grid&created=date-range:${startDateText}_${endDateText}&ingredient-quantity=0:max:showNullValues`
        );
      },
    };

    this.randomSuggestionsSubject.next([
      ...randomSuggestions,
      ...randomCategorySuggestions,
      ...randomCategoryWithoutSugarSuggestions,
      randomSearchTextSuggestion,
      filterForRecipesAddedButNoIngredients,
    ]);
  }

  private suggestionTypeGroup(type: FilterKey, groupName: string) {
    let list: any = [];
    switch (type) {
      case FilterKey.CATEGORIES:
        list = CATEGORIES;
        break;
      case FilterKey.RATING:
        list = RATINGS;
        break;
      case FilterKey.DIFFICULTIES:
        list = DIFFICULTIES;
        break;
    }

    const types =
      list
        .find((category: any) => category.name === groupName)
        ?.entries.map((entry: any) => entry.type) ?? [];

    const data = this.searchFilterService.filtersSnapshot;
    data.forEach((filter) => {
      if (filter.key === type) {
        let filterMultiSelect = FilterFunctions.getFilterMultiSelect(filter);
        if (!filterMultiSelect) return;
        filterMultiSelect.show = true;

        filterMultiSelect.value = types;

        filter = filterMultiSelect;
      }
    });

    this.searchFilterService.setFilters(data);
    this.searchService.clearSearchValue();
    this.searchUrlService.setSearchUrl();
  }

  private suggestionCategory(category: Entry<CategoryType>) {
    const data: Action = {
      id: "",
      text: "SUGGESTION.SHOW_VEGAN_CATEGORY_VALUE",
      textReplace: category.name,
      icon: category.icon ?? "filter",
      func: () => {
        this.routingService.navigateToUrl(
          `/search?filter=recipes&categories=${category.type}&contents=vegan&ingredient-quantity=1:min:hideNullValues`
        );
      },
    };

    return data;
  }

  private suggestionCategoryWithoutSugar(category: Group<CategoryType>) {
    const types = category.entries.map((entry) => entry.type).join(",");
    const data: Action = {
      id: "",
      text: "SUGGESTION.SHOW_VEGAN_CATEGORY_WITHOUT_SUGAR",
      textReplace: category.name,
      icon: category.icon ?? "filter",
      func: () => {
        this.routingService.navigateToUrl(
          `/search?filter=recipes&categories=${types}&contents=vegan,sugar-not&ingredient-quantity=1:min:hideNullValues`
        );
      },
    };

    return data;
  }
}
