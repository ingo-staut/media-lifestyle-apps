import { Platform } from "@angular/cdk/platform";
import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, combineLatest, debounceTime, map, startWith, take, takeUntil } from "rxjs";

import { DropdownData } from "shared/models/dropdown.type";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { compareTextWithSearchValue } from "shared/utils/string";
import { ResultListLayout } from "../../../../../../shared/models/enum/result-list-layout.enum";
import { SortingDirection } from "../../../../../../shared/models/enum/sort-direction.enum";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import { PageIndex } from "../../data/sidenav.menu.data";
import { SEARCH_SORT_TYPES_DATA } from "../../data/sort.data";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { SortKey, SortType } from "../../models/enum/sort.enum";
import { FilterFunctions } from "../../models/filter.functions";
import { Recipe } from "../../models/recipe.class";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { RecipeDialogsService } from "../../services/recipe/recipe.dialogs.service";
import { RoutingService } from "../../services/routing.service";
import { SearchFilterService } from "./search.filter.service";
import { SearchLayoutService } from "./search.layout.service";
import { SearchService } from "./search.service";
import { SearchSortingService } from "./search.sorting.service";
import { SearchSuggestionService } from "./search.suggestion.service";
import { SearchUrlService } from "./search.url.service";

const FILTER_ALL_PARAM = "filter";

export enum AreaToSearchDropdown {
  RECIPES = "recipes",
  SHOPPING = "shopping",
}

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit, OnDestroy {
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

  // Dropdown
  dropdownSelected: AreaToSearchDropdown;
  dropdown: DropdownData<AreaToSearchDropdown, null>[] = [
    { key: AreaToSearchDropdown.RECIPES, name: "MENU.RECIPES", icon: "recipe" },
    { key: AreaToSearchDropdown.SHOPPING, name: "MENU.PURCHASES", icon: "shopping-cart" },
  ];

  searchValue$ = this.searchService.searchValue$.pipe(takeUntil(this.destroySubject));
  sortingType$ = this.searchSortingService.sortingType$.pipe(takeUntil(this.destroySubject));
  sortingDirection$ = this.searchSortingService.sortingDirection$.pipe(
    takeUntil(this.destroySubject)
  );
  layout$ = this.searchLayoutService.layout$.pipe(takeUntil(this.destroySubject));

  quickAddFilterFromSearch$ = this.searchFilterService.quickAddFilterFromSearch$.pipe(
    takeUntil(this.destroySubject)
  );

  filteredRecipes$ = combineLatest([
    this.recipeApiService.recipes$,
    // StartWith dafür, dass beim Reload Daten geladen werden
    this.searchValue$.pipe(startWith(""), debounceTime(500)),
    this.sortingType$,
    this.sortingDirection$,
    this.searchFilterService.filters$,
    this.ingredientApiService.ingredientsConversion$.pipe(startWith([])),
  ]).pipe(
    debounceTime(100),
    map(([recipes, searchValue, sortType, sortingDirection, filters, ingredientsConversion]) => {
      this.searchUrlService.setSearchUrl();

      searchValue = searchValue?.trim();

      const sortAsc = sortingDirection === SortingDirection.ASC;

      return recipes
        .filter((recipe) => {
          const ingredients = recipe.ingredients;
          const utensils = recipe.utensils;

          const matchScoreIngredients = ingredients.reduce(
            (acc, ingredient) => (acc += compareTextWithSearchValue(ingredient.name, searchValue)),
            0
          );
          const matchScoreUtensils = utensils.reduce(
            (acc, ingredient) => (acc += compareTextWithSearchValue(ingredient.name, searchValue)),
            0
          );
          const matchScoreName = compareTextWithSearchValue(recipe.name, searchValue);
          const matchScoreNote = compareTextWithSearchValue(recipe.note, searchValue);
          const matchScoreTags = recipe.tags.reduce(
            (acc, tag) => (acc += compareTextWithSearchValue(tag, searchValue)),
            0
          );

          const matchScore =
            matchScoreName +
            matchScoreTags / 2 +
            (matchScoreNote === 0 ? 0 : matchScoreNote / 3) +
            (matchScoreIngredients === 0 ? 0 : matchScoreIngredients / ingredients.length / 3) +
            (matchScoreUtensils === 0 ? 0 : matchScoreUtensils / utensils.length / 3);

          recipe._searchMatchScore = matchScore;

          // Suchbegriff oder Filter gesetzt
          // ! Sonst werden alle Rezepte angezeigt
          return (
            (searchValue || this.searchFilterService.filtersSetSnapshot) &&
            // Suchbegriff
            (matchScore > 0 || !searchValue) &&
            // Filter
            filters.every((filter) => {
              if (FilterFunctions.isValueSet(filter)) {
                return FilterFunctions.triggerFunction(recipe, filter, ingredientsConversion);
              }
              return true;
            })
          );
        })
        .sort(this.searchSortingService.sortRecipes(sortType, sortAsc, ingredientsConversion));
    }),
    takeUntil(this.destroySubject)
  );

  results$ = combineLatest([
    this.filteredRecipes$.pipe(startWith([] as Recipe[])),
    this.searchFilterService.resultCount$,
  ]).pipe(
    // Ersten x Ergebnisse
    map(([recipes, resultCount]) => recipes.slice(0, resultCount))
  );

  constructor(
    private location: Location,
    private recipeApiService: RecipeApiService,
    private activeRoute: ActivatedRoute,
    private routingService: RoutingService,
    private recipeDialogService: RecipeDialogService,
    private platform: Platform,
    private searchService: SearchService,
    private searchSortingService: SearchSortingService,
    private searchLayoutService: SearchLayoutService,
    private searchUrlService: SearchUrlService,
    private recipeDialogsService: RecipeDialogsService,
    protected searchSuggestionService: SearchSuggestionService,
    protected ingredientApiService: IngredientApiService,
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

      this.dropdownSelected = params[FILTER_ALL_PARAM] ?? this.dropdown[0].key;

      if (params["id"]) {
        this.recipeApiService
          .getRecipeById(params["id"])
          .pipe(take(1))
          .subscribe((recipe) => this.recipeDialogService.openAndReloadData(recipe));
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

  onDropdownChange(value: DropdownData<AreaToSearchDropdown, null>) {
    this.dropdownSelected = value.key;
    this.searchUrlService.setSearchUrl();
  }

  removeAllFilters() {
    this.searchFilterService.removeAllFilters();
  }

  onEnter() {
    this.filteredRecipes$.pipe(take(1)).subscribe((recipes) => {
      // Erstes Rezept in den Ergebnissen öffnen
      if (recipes.length > 0)
        this.recipeDialogService.openAndReloadData(recipes[0], {
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
    this.searchFilterService.addResultCount(50);
  }

  onOpenCreateDialogByKey(key: string) {
    this.recipeDialogsService.openCreateDialogByKey(
      key,
      this.searchService.searchValueSnapshot,
      PageIndex.SEARCH
    );
  }
}
