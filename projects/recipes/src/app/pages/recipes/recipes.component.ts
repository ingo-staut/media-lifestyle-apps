import { AfterViewInit, Component, OnDestroy, ViewChild } from "@angular/core";
import { MatAccordion } from "@angular/material/expansion";
import { MatMenuTrigger } from "@angular/material/menu";
import { BehaviorSubject, Subject, combineLatest, map, switchMap, take, takeUntil } from "rxjs";
import { Tab } from "shared/models/tab.type";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { CarouselItem } from "../../components/carousel/carousel.component";
import { PLANNED_RECIPES_TABS } from "../../data/planned-recipes.tabs.data";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { IngredientAvailableDialogsService } from "../../services/ingredient/ingredient-available.dialogs.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { RecipeSuggestionService } from "../../services/recipe/recipe-suggestion.service";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { RecipeService } from "../../services/recipe/recipe.service";
import { RoutingService } from "../../services/routing.service";
import { SettingsService } from "../../services/settings/settings.service";
import { SearchQuickNavigateService } from "../search/search.quick-navigate.service";

@Component({
  selector: "app-recipes",
  templateUrl: "./recipes.component.html",
  styleUrls: ["./recipes.component.scss"],
})
export class RecipesComponent implements OnDestroy, AfterViewInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  private readonly destroySubject = new Subject<void>();

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  plannedRecipesTabs = PLANNED_RECIPES_TABS;
  today = new Date();

  useUntilIngredientIndex: number | null = null;

  selectedTabIndexSubject = new BehaviorSubject<number>(1);

  ingredientsAvailable$ = this.ingredientApiService.ingredientsAvailable$.pipe(
    takeUntil(this.destroySubject)
  );

  recipesMissed$ = this.recipeApiService.recipes$.pipe(
    takeUntil(this.destroySubject),
    map((recipes) =>
      recipes.filter((recipe) => recipe.plannedDates.some((date) => DateFns.isBeforeToday(date)))
    )
  );

  recipesToday$ = this.recipeApiService.recipes$.pipe(
    takeUntil(this.destroySubject),
    map((recipes) =>
      recipes.filter((recipe) => recipe.plannedDates.some((date) => DateFns.isToday(date)))
    )
  );

  recipesTomorrow$ = this.recipeApiService.recipes$.pipe(
    takeUntil(this.destroySubject),
    map((recipes) =>
      recipes.filter((recipe) => recipe.plannedDates.some((date) => DateFns.isTomorrow(date)))
    )
  );

  recipesNext7Days$ =
    // Alle Rezepte
    this.recipeApiService.recipes$.pipe(
      takeUntil(this.destroySubject),
      map((recipes) =>
        recipes.filter((recipe) =>
          recipe.plannedDates.some((date) =>
            DateFns.isDateBetweenDates(
              date,
              DateFns.addDaysToDate(new Date(), 1),
              DateFns.addDaysToDate(new Date(), 7)
            )
          )
        )
      )
    );

  tabs: Tab[] = [
    {
      name: "DATE.MISSED",
      icon: "calendar-missed",
      data: this.recipesMissed$,
    },
    {
      name: "DATE.TODAY",
      icon: "calendar-today",
      data: this.recipesToday$,
    },
    {
      name: "DATE.TOMORROW",
      icon: "calendar-tomorrow",
      data: this.recipesTomorrow$,
    },
    {
      name: "DATE.NEXT_7_DAYS",
      icon: "calendar-week",
      data: this.recipesNext7Days$,
    },
  ];

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

      const ignoreTabsCount = 1;
      // Ersten Tab ("Verpasst") ignorieren
      const index = dataArrays.slice(ignoreTabsCount).findIndex((data) => data.length !== 0);
      if (index === -1) {
        return 0;
      }
      return index + ignoreTabsCount;
    })
  );

  tabData$ = this.selectedTabIndex$.pipe(
    takeUntil(this.destroySubject),
    switchMap((selectedTabIndex) => this.tabs[selectedTabIndex].data!)
  );

  noTabData$ = combineLatest([...this.tabs.map((tab) => tab.data!)]).pipe(
    takeUntil(this.destroySubject),
    map(([...dataArrays]) => dataArrays.every((data) => !data.length))
  );

  favoriteRecipes$ = this.recipeApiService.recipes$.pipe(
    takeUntil(this.destroySubject),
    map((recipes) => recipes.filter((recipe) => recipe.favorite))
  );

  recipesWithPortionsLeft$ = this.recipeApiService.recipes$.pipe(
    takeUntil(this.destroySubject),
    map((recipes) => recipes.filter((recipe) => recipe.oncePortionsLeft))
  );

  lastEditedRecipes$ = this.recipeService.lastEditedRecipes$.pipe(takeUntil(this.destroySubject));

  contextMenuPosition = { x: "0px", y: "0px" };

  constructor(
    protected recipeService: RecipeService,
    protected recipeApiService: RecipeApiService,
    protected ingredientApiService: IngredientApiService,
    protected recipeSuggestionService: RecipeSuggestionService,
    private routingService: RoutingService,
    private recipeDialogService: RecipeDialogService,
    protected settingsService: SettingsService,
    protected localeService: LocaleService,
    private localStorageService: LocalStorageService,
    private searchQuickNavigateService: SearchQuickNavigateService,
    private ingredientAvailableDialogsService: IngredientAvailableDialogsService
  ) {}

  ngAfterViewInit(): void {
    this.routingService.getRecipeFromRoute().subscribe((recipe) => {
      this.recipeDialogService.openAndReloadData(recipe);
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  stopPropagation(event: any): void {
    event.stopPropagation();
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + "px";
    this.contextMenuPosition.y = event.clientY + "px";
    // this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu!.focusFirstItem("mouse");
    this.contextMenu.openMenu();
  }

  onTabChange(index: number): void {
    this.selectedTabIndexSubject.next(index);
  }

  onUseUntilIngredientsTabChange(index: number): void {
    this.useUntilIngredientIndex = index;
  }

  onNavigateToAvailableIngredients() {
    this.localStorageService.setShoppingListTabIndex(2);
    this.routingService.navigateToShoppingList();
  }

  onAddToAvailableIngredients() {
    this.ingredientAvailableDialogsService.openAddOrEditIngredientAvailableDialog();
  }

  accordionChange(expandAll: boolean) {
    if (expandAll) {
      this.accordion.openAll();
    } else {
      this.accordion.closeAll();
    }
  }

  onPlannedActionClicked(actionId: string) {
    const keys = ["missed", "today", "tomorrow", "next-days"];
    if (actionId === "search") {
      this.selectedTabIndex$.pipe(take(1)).subscribe((index) => {
        this.searchQuickNavigateService.openSearchWithFilterRecipePlanned(keys[index]);
      });
    }
  }

  onPortionsLeftActionClicked(actionId: string) {
    if (actionId === "search") {
      this.searchQuickNavigateService.openSearchWithFilterRecipeWithPortionsLeft();
    }
  }

  onFavoriteActionClicked(actionId: string) {
    if (actionId === "search") {
      this.searchQuickNavigateService.openSearchWithFilterRecipeFavorite();
    }
  }

  onSelectedTabIndexChange(selectedTabIndex: number) {
    this.selectedTabIndexSubject.next(selectedTabIndex);
    this.localStorageService.setRecipesPlannedIndex(selectedTabIndex);
  }

  onActionClickInCarousel(result: { item: CarouselItem; actionId: string }) {
    const { item, actionId } = result;
    item.func(actionId);
  }

  onActionSearchClickInCarousel(result: { item: CarouselItem }) {
    const { item } = result;
    if (item.funcOpenSearch) item.funcOpenSearch();
  }
}
