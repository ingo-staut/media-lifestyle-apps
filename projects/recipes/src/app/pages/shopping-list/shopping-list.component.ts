import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { findItems } from "projects/recipes/src/pipes/date.pipe";
import { BehaviorSubject, Subject, combineLatest, map, startWith, take, takeUntil } from "rxjs";
import { DropdownData } from "shared/models/dropdown.type";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import {
  MEDIA_QUERY_BIG_SCREEN,
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_NORMAL_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { stickyPinned } from "shared/utils/css-sticky-pinned";
import { SortingDirection } from "../../../../../../shared/models/enum/sort-direction.enum";
import { MenuItem } from "../../../../../../shared/models/menu-item.type";
import { IngredientChange } from "../../components/ingredients-list/ingredients-list.component";
import {
  AVAILABLE_DROPDOWN_DATA,
  showIngredientFilterByAvailable,
} from "../../data/available.data";
import {
  MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL,
  MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL_SELECTED,
} from "../../data/menu-available-ingredients.data";
import { MENU_CHECK_ITEMS } from "../../data/menu-check.data";
import { QUICK_ROW_DATA } from "../../data/quick-row-layout.data";
import {
  SORT_INGREDIENTS_SHOPPING_LIST,
  SORT_INGREDIENTS_SHOPPING_LIST_AVAILABLE,
  SORT_INGREDIENTS_SHOPPING_LIST_BUY,
} from "../../data/sort.data";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { ItemType } from "../../models/enum/item.enum";
import { QuickRowLayoutType } from "../../models/enum/quick-row-layout.enum";
import { SortType } from "../../models/enum/sort.enum";
import { IngredientFilterListSelectedKeys } from "../../models/filter-ingredients-selected-keys.type";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { Item } from "../../models/item.class";
import { Purchase } from "../../models/purchase.class";
import { Recipe } from "../../models/recipe.class";
import { IngredientAdditionalDialogsService } from "../../services/ingredient/ingredient-additional.dialogs.service";
import { IngredientAvailableDialogsService } from "../../services/ingredient/ingredient-available.dialogs.service";
import { IngredientConversionCompleterService } from "../../services/ingredient/ingredient-conversion.completer.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { PurchaseCompleterService } from "../../services/purchase/purchase.completer.service";
import { PurchaseDialogsService } from "../../services/purchase/purchase.dialogs.service";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { RecipeCompleterService } from "../../services/recipe/recipe.completer.service";
import { RecipeService } from "../../services/recipe/recipe.service";
import { RoutingService } from "../../services/routing.service";
import { StoreApiService } from "../../services/store/store.api.service";
import { SearchQuickNavigateService } from "../search/search.quick-navigate.service";

export enum ChooseRecipeViewMode {
  RECIPES = "RECIPES",
  INGREDIENTS = "INGREDIENTS",
  ALL_INGREDIENTS = "ALL_INGREDIENTS",
}

export enum WithInList {
  WITH = "WITH",
  WITH_MEDIUM = "WITH_MEDIUM",
  WITHOUT = "WITHOUT",
}

export enum ColumnType {
  BUY = "BUY",
  LIST = "LIST",
  AVAILABLE = "AVAILABLE",
}

@Component({
  selector: "app-shopping-list",
  templateUrl: "./shopping-list.component.html",
  styleUrls: ["./shopping-list.component.scss"],
})
export class ShoppingListComponent implements OnInit, AfterViewInit, OnDestroy {
  ColumnType = ColumnType;
  ChooseRecipeViewMode = ChooseRecipeViewMode;
  WithRecipesInList = WithInList;
  isBigScreen = MEDIA_QUERY_BIG_SCREEN;
  QUICK_ROW_DATA = QUICK_ROW_DATA;
  QuickRowLayoutType = QuickRowLayoutType;
  SortType = SortType;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isNormalScreen = MEDIA_QUERY_NORMAL_SCREEN;
  MENU_CHECK_ITEMS = MENU_CHECK_ITEMS;
  MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL = MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL;
  MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL_SELECTED = MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL_SELECTED;
  SORT_INGREDIENTS_SHOPPING_LIST_BUY = SORT_INGREDIENTS_SHOPPING_LIST_BUY;
  SORT_INGREDIENTS_SHOPPING_LIST_LIST = SORT_INGREDIENTS_SHOPPING_LIST;
  SORT_INGREDIENTS_SHOPPING_LIST_AVAILABLE = SORT_INGREDIENTS_SHOPPING_LIST_AVAILABLE;
  AVAILABLE_DROPDOWN_DATA = AVAILABLE_DROPDOWN_DATA;

  private readonly destroySubject = new Subject<void>();

  formGroup: ReturnType<typeof this.initializeFormGroup>;

  filterListSelectedKeys: IngredientFilterListSelectedKeys = { available: "all", useUntil: "all" };
  searchText = "";
  sortType = SortType.SORT_CUSTOM;
  sortingDirection = SortingDirection.DESC;

  inputInfoText = "";

  tabIndex = this.localStorageService.getShoppingListTabIndex();
  recipes$ = this.recipeApiService.recipes$.pipe(takeUntil(this.destroySubject));
  completerListRecipes$ = this.recipeCompleterService.completerListRecipes$.pipe(
    takeUntil(this.destroySubject)
  );
  onShoppingListRecipes$ = this.recipeService.onShoppingListRecipes$.pipe(
    takeUntil(this.destroySubject)
  );

  recipeViewModeSubject = new BehaviorSubject<ChooseRecipeViewMode>(
    this.localStorageService.getShoppingListRecipesModeDropdown()
  );

  recipeViewMode$ = combineLatest([
    this.recipeViewModeSubject.asObservable(),
    this.onShoppingListRecipes$,
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([recipeViewMode, onShoppingListRecipes]) => {
      // Wenn "Alle Zutaten gesetzt ist, aber keine Rezepte auf der Einkaufsliste sind, einen anderen Modus wählen"
      return recipeViewMode === ChooseRecipeViewMode.ALL_INGREDIENTS &&
        !onShoppingListRecipes.length
        ? ChooseRecipeViewMode.RECIPES
        : recipeViewMode;
    })
  );

  chooseRecipeViewModeDropdownData: DropdownData<ChooseRecipeViewMode, null>[] = [
    { key: ChooseRecipeViewMode.RECIPES, name: "MENU.RECIPES", icon: "recipe" },
    {
      key: ChooseRecipeViewMode.INGREDIENTS,
      name: "INGREDIENT.RECIPE",
      icon: "separated-horizontal",
    },
    { key: ChooseRecipeViewMode.ALL_INGREDIENTS, name: "INGREDIENT.ALL", icon: "ingredient" },
  ];

  withRecipesInListSelected = this.localStorageService.getShoppingListRecipesInListDropdown();
  withRecipesInList: DropdownData<WithInList, null>[] = [
    { key: WithInList.WITH, name: "WITH_RECIPES", icon: "recipe" },
    { key: WithInList.WITH_MEDIUM, name: "WITH_SHORT_RECIPE_INFOS", icon: "info" },
    { key: WithInList.WITHOUT, name: "WITHOUT_RECIPES", icon: "recipe-not" },
  ];

  deleteMenuItems: MenuItem<string & { favorite?: boolean }>[] = [
    {
      text: "CHECK.DELETE_ALL",
      value: "check-delete-all",
      icon: "check-checked",
    },
    {
      text: "REMOVE_ALL",
      value: "delete-all",
      icon: "delete",
    },
  ];

  columns = [
    {
      icon: "shopping-cart",
      text: "BUY",
      type: ColumnType.BUY,
    },
    {
      icon: "shopping-list",
      text: "LIST",
      type: ColumnType.LIST,
    },
    {
      icon: "available",
      text: "AVAILABLE.",
      type: ColumnType.AVAILABLE,
    },
  ];

  _quickRowLayout = this.localStorageService.getPurchasesQuickRowLayout();

  set quickRowLayout(value: QuickRowLayoutType) {
    this.localStorageService.setPurchasesQuickRowLayout(value);
    this._quickRowLayout = value;
  }

  get quickRowLayout() {
    return this._quickRowLayout;
  }

  showIngredient = (
    ingredient: Ingredient,
    parameters: {
      ingredientsConversion?: IngredientConversion[] | null;
      ingredientsAvailable?: Ingredient[] | null;
      filterKey?: IngredientFilterListSelectedKeys;
    }
  ) => {
    const { ingredientsConversion } = parameters;
    return !new Ingredient(ingredient).hasEmoji(ingredientsConversion ?? []);
  };

  showIngredientFilterUseUntil = (
    ingredient: Ingredient,
    parameters: {
      ingredientsConversion?: IngredientConversion[] | null;
      ingredientsAvailable?: Ingredient[] | null;
      filterKey?: IngredientFilterListSelectedKeys;
    }
  ) => {
    const { filterKey } = parameters;
    return (
      (ingredient.useUntil &&
        this.showIngredientFilterFindByKey(ingredient.useUntil, filterKey?.useUntil ?? "")) ||
      filterKey?.useUntil === "all"
    );
  };

  showIngredientFilterAvailability = (
    ingredient: Ingredient,
    parameters: {
      ingredientsConversion?: IngredientConversion[] | null;
      ingredientsAvailable?: Ingredient[] | null;
      filterKey?: IngredientFilterListSelectedKeys;
    }
  ) => {
    const { filterKey, ingredientsConversion, ingredientsAvailable } = parameters;

    return (
      showIngredientFilterByAvailable(
        new Ingredient(ingredient).isAvailable(
          ingredientsAvailable ?? [],
          ingredientsConversion ?? []
        ).ratio,
        filterKey?.available ?? ""
      ) || filterKey?.available === "all"
    );
  };

  constructor(
    private readonly formBuilder: FormBuilder,
    protected ingredientApiService: IngredientApiService,
    private recipeService: RecipeService,
    private recipeApiService: RecipeApiService,
    private storeApiService: StoreApiService,
    private recipeCompleterService: RecipeCompleterService,
    private ingredientAdditionalDialogsService: IngredientAdditionalDialogsService,
    private localStorageService: LocalStorageService,
    private routingService: RoutingService,
    private recipeDialogService: RecipeDialogService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    protected localeService: LocaleService,
    private searchQuickNavigateService: SearchQuickNavigateService,
    protected ingredientConversionCompleterService: IngredientConversionCompleterService,
    private purchaseDialogsService: PurchaseDialogsService,
    private purchaseCompleterService: PurchaseCompleterService,
    protected ingredientAvailableDialogsService: IngredientAvailableDialogsService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.initializeFormGroup();

    combineLatest([
      this.ingredientApiService.ingredientsConversion$.pipe(startWith([])),
      this.ingredientApiService.ingredientsAvailable$.pipe(startWith([])),
      this.ingredientApiService.ingredientsAdditional$.pipe(startWith([])),
      this.ingredientApiService.ingredientsChecked$.pipe(startWith([])),
      this.onShoppingListRecipes$.pipe(startWith([])),
      this.translateService.onLangChange
        .asObservable()
        .pipe(startWith({ lang: this.translateService.currentLang } as LangChangeEvent)),
    ])
      .pipe(takeUntil(this.destroySubject))
      .subscribe(
        ([
          ingredientsConversion,
          ingredientsAvailable,
          ingredientsAdditional,
          ingredientsChecked,
          recipes,
          locale,
        ]) => {
          const ingredients = Ingredient.setIngredientsChecked(
            IngredientConversion.filterIngredientsWithAdditionalMinusAvailable(
              ingredientsAdditional?.map((ingredient) => {
                const ingr = new Ingredient(ingredient);
                ingr.fromWithRecipe = [{ notes: [ingr.getIngredientString(locale.lang)] }];
                return ingr;
              })!,
              Ingredient.getIngredientsFromRecipes(recipes, locale.lang),
              ingredientsAvailable?.map((ingredient) => new Ingredient(ingredient))!,
              ingredientsConversion
            ),
            ingredientsChecked?.map((ingredient) => new Ingredient(ingredient))!
          );

          this.formGroup.controls.ingredients.patchValue(ingredients, {
            emitEvent: false,
            onlySelf: true,
          });

          const ingredientsFromRecipes = Ingredient.getIngredientsFromRecipes(recipes, locale.lang);

          this.calcAll(
            ingredientsFromRecipes,
            ingredientsAvailable,
            ingredientsAdditional,
            ingredientsChecked,
            true
          );
        }
      );

    // Wenn zwischen BigScreen und anderen Ansichten gewechselt wird
    this.isBigScreen.onchange = () => {
      stickyPinned();
    };
  }

  async ngAfterViewInit() {
    this.routingService.getRecipeFromRoute().subscribe((recipe) => {
      this.recipeDialogService.openAndReloadData(recipe);
    });

    await stickyPinned();
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  initializeFormGroup() {
    return this.formBuilder.group({
      ingredients: [[] as Ingredient[]],
      ingredientsFromRecipes: [[] as Ingredient[]],
      ingredientsAvailable: [[] as Ingredient[]],
      ingredientsAdditional: [[] as Ingredient[]],
      ingredientsChecked: [[] as Ingredient[]],
      ingredientsList: [[] as Ingredient[]],
    });
  }

  calcAll(
    ingredientsFromRecipes: Ingredient[],
    ingredientsAvailable: Ingredient[],
    ingredientsAdditional: Ingredient[],
    ingredientsChecked: Ingredient[],
    update = false
  ): void {
    const ingredientsListAdditional = cloneDeep(ingredientsAdditional).map((ingredient) => {
      const ingr = new Ingredient(ingredient);
      ingr.fromWithRecipe = [
        { notes: [ingr.getIngredientString(this.translateService.currentLang)] },
      ];
      return ingr;
    });

    const ingredientsList = [
      ...Ingredient.combineIngredients(
        cloneDeep(ingredientsFromRecipes).concat(ingredientsListAdditional)
      ),
    ];

    this.formGroup.patchValue(
      {
        ingredientsFromRecipes,
        ingredientsList,
        ingredientsAvailable: [...ingredientsAvailable],
        ingredientsChecked: [...ingredientsChecked],
        ingredientsAdditional,
      },
      update ? {} : { emitEvent: false, onlySelf: true }
    );
  }

  onIngredientsAdditionalChanged(ingredients: Ingredient[]) {
    this.ingredientApiService.addOrUpdateIngredientsAdditional(ingredients);
    this.formGroup.patchValue({ ingredientsAdditional: [...ingredients] });
    this.formGroup.markAsDirty();
  }

  /**
   * Löschen einer Zutat aus der Einkaufsliste
   * löscht diese auch aus der Liste der zusätzlichen Zutaten
   */
  onIngredientChanged(ingredient: IngredientChange) {
    const ingredientsAdditional = this.formGroup.controls.ingredientsAdditional.value ?? [];

    if (!ingredient.isDeleted) return;

    const index = ingredientsAdditional.findIndex((ingr) =>
      ingredient.ingredient.equalNameAndUnit(ingr)
    );

    if (index === -1) return;

    ingredientsAdditional.splice(index, 1);

    // Zusätzlich auch noch aus den "Checked" Zutaten entfernen
    this.ingredientApiService.removeIngredientChecked(ingredient.ingredient);

    this.ingredientApiService.addOrUpdateIngredientsAdditional(ingredientsAdditional);
    this.formGroup.patchValue({ ingredientsAdditional });
    this.formGroup.markAsDirty();
  }

  onIngredientsAvailableChanged(ingredients: Ingredient[]) {
    this.ingredientApiService.updateIngredientsAvailable(ingredients);
    this.formGroup.patchValue({ ingredientsAvailable: [...ingredients] });
    this.formGroup.markAsDirty();
  }

  /**
   * Zutat hinzufügen
   */
  onIngredientAdd(ingredient: Ingredient, type: string) {
    const ingredients = this.formGroup.get(type)?.value;
    ingredients.push(ingredient);
    this.formGroup.patchValue({ [type]: [...ingredients] });
    this.formGroup.markAsDirty();
  }

  async tabIndexChanged(index: number) {
    this.localStorageService.setShoppingListTabIndex(index);
    await stickyPinned();
  }

  onNextTab() {
    // this.tabIndex = (this.tabIndex + 1) % 3;
    this.tabIndex = Math.min(this.tabIndex + 1, 2);
    this.tabIndexChanged(this.tabIndex);
  }

  onPreviousTab() {
    // this.tabIndex = (this.tabIndex - 1 + 3) % 3;
    this.tabIndex = Math.max(this.tabIndex - 1, 0);
    this.tabIndexChanged(this.tabIndex);
  }

  onAddRecipeToShoppingList(name: string) {
    name = name.trim();
    if (name) {
      this.recipeApiService.findRecipeByName(name).subscribe((recipe) => {
        if (recipe) {
          recipe.isOnShoppingList = {
            withOptionals: false,
            amountNumber: recipe.amountNumber,
          };
          this.recipeApiService.saveAndReloadRecipe(recipe);
        }
      });
    }
  }

  onRemoveRecipeFromShoppingList(recipe: Recipe) {
    recipe.isOnShoppingList = null;
    this.recipeApiService.saveAndReloadRecipe(recipe);
  }

  onRemoveAllRecipes() {
    this.onShoppingListRecipes$.pipe(take(1)).subscribe((recipes) => {
      const recipesCopy = cloneDeep(recipes);

      recipes.forEach((recipe) => {
        recipe.isOnShoppingList = null;
        this.recipeApiService.saveAndReloadRecipe(recipe, false);
      });

      this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
        recipes.forEach((recipe, index) => {
          recipe.isOnShoppingList = recipesCopy[index].isOnShoppingList;
          this.recipeApiService.saveAndReloadRecipe(recipe, false);
        });
      });
    });
  }

  onChooseRecipeViewModeChanged(mode: ChooseRecipeViewMode) {
    this.recipeViewModeSubject.next(mode);
    this.localStorageService.setShoppingListRecipesModeDropdown(mode);
  }

  onWithRecipesInListChanged(mode: WithInList) {
    this.withRecipesInListSelected = mode;
    this.localStorageService.setShoppingListRecipesInListDropdown(mode);
  }

  onCheckMenuItemClick(value: string) {
    const ingredients = this.formGroup.controls.ingredients.value;

    switch (value) {
      case "check-all":
        this.ingredientApiService.addOrUpdateIngredientsChecked(
          ingredients
            ?.map((ingr) => {
              ingr._checked = true;
              return ingr;
            })
            .filter((ingr) => ingr._checked) ?? []
        );
        break;

      case "check-none":
        this.ingredientApiService.addOrUpdateIngredientsChecked(
          ingredients
            ?.map((ingr) => {
              ingr._checked = false;
              return ingr;
            })
            .filter((ingr) => ingr._checked) ?? []
        );
        break;

      case "check-invert":
        this.ingredientApiService.addOrUpdateIngredientsChecked(
          ingredients
            ?.map((ingr) => {
              ingr._checked = !ingr._checked;
              return ingr;
            })
            .filter((ingr) => ingr._checked) ?? []
        );
        break;

      default:
        break;
    }
  }

  onDeleteMenuItemClick(value: string) {
    // WORKAROUND: Warten bis Overlay weg ist
    // (z.B.: Benachrichtigung nachdem auf Menü-Item geklickt wurde)
    setTimeout(() => {
      switch (value) {
        case "check-delete-all":
          // Alle zusätzlichen Zutaten, die nicht abgehakt sind,
          // somit werden die abgehakten zusätzlichen Zutaten ausgefiltert
          const ingredientsAdditionalUnchecked =
            this.formGroup.controls.ingredientsAdditional.value?.filter(
              (ingr) =>
                !this.formGroup.controls.ingredientsChecked.value?.some((i) =>
                  new Ingredient(i).equalAll(ingr)
                )
            ) ?? [];

          // Alle zusätzlichen Zutaten, die nicht abgehakt sind, speichern
          this.ingredientApiService.addOrUpdateIngredientsAdditional(
            ingredientsAdditionalUnchecked
          );

          // Nur alle Häkchen bei zusätzlichen Zutaten entfernen,
          // nicht bei den Zutaten der Rezepte
          const stillCheckedIngredients =
            this.formGroup.controls.ingredients.value?.filter((ingr) =>
              this.formGroup.controls.ingredientsChecked.value?.some((i) =>
                new Ingredient(i).equalAll(ingr)
              )
            ) ?? [];

          this.ingredientApiService.addOrUpdateIngredientsChecked(stillCheckedIngredients);

          // Falls Zutaten von Rezepten übrig bleiben,
          // fragen ob noch alle Rezepte entfernt werden sollen
          if (stillCheckedIngredients.length) {
            this.notificationService
              .show(NotificationTemplateType.INGREDIENTS_OF_RECIPES_NOT_REMOVED)
              ?.subscribe(() => {
                this.onRemoveAllRecipes();
              });
          }
          break;

        case "delete-all":
          this.ingredientApiService.addOrUpdateIngredientsAdditional([]);

          // Nur alle Häkchen bei zusätzlichen Zutaten entfernen,
          // nicht bei den Zutaten der Rezepte
          const stillCheckedIngredients_2 =
            this.formGroup.controls.ingredients.value?.filter((ingr) =>
              this.formGroup.controls.ingredientsChecked.value?.some((i) =>
                new Ingredient(i).equalAll(ingr)
              )
            ) ?? [];

          this.ingredientApiService.addOrUpdateIngredientsChecked(stillCheckedIngredients_2);

          if (this.formGroup.controls.ingredients.value?.length) {
            this.notificationService
              .show(NotificationTemplateType.INGREDIENTS_OF_RECIPES_NOT_REMOVED)
              ?.subscribe(() => {
                this.onRemoveAllRecipes();
              });
          }
          break;

        default:
          break;
      }
    }, 0);
  }

  onQuickBuyItemsMenuItemClicked(value: any, ingredient: Ingredient, index: number) {
    switch (value) {
      case "edit":
        this.ingredientAdditionalDialogsService
          .openAddOrEditIngredientsAdditionalDialog({
            ingredientsAdditional: this.formGroup.controls.ingredientsAdditional.value,
            ingredient,
            index,
          })
          .subscribe((ingredients) => {
            this.formGroup.patchValue({ ingredientsAdditional: [...ingredients] });
            this.formGroup.markAsDirty();
          });
        break;

      case "checked":
        this.ingredientApiService.addIngredientChecked(ingredient);
        ingredient._checked = !ingredient._checked;
        break;

      case "unchecked":
        this.ingredientApiService.removeIngredientChecked(ingredient);
        ingredient._checked = !ingredient._checked;
        break;

      case "delete":
        const data: IngredientChange = { ingredient, isDeleted: true };
        this.onIngredientChanged(data);
        break;

      default:
        break;
    }
  }

  onQuickBuyItemsMenuContextMenu(ingredient: Ingredient) {
    if (ingredient._checked) {
      this.ingredientApiService.removeIngredientChecked(ingredient);
      ingredient._checked = !ingredient._checked;
    } else {
      this.ingredientApiService.addIngredientChecked(ingredient);
      ingredient._checked = !ingredient._checked;
    }
  }

  onAddIngredientAdditional(value: string) {
    const ingredientsAdditional = this.formGroup.controls.ingredientsAdditional.value!;

    const ingredients = Ingredient.parseAll(value);
    if (!ingredients.length) return;
    const newIngredientsAdditional = [...ingredients, ...ingredientsAdditional];

    this.ingredientApiService.addOrUpdateIngredientsAdditional(newIngredientsAdditional);
    this.formGroup.patchValue({ ingredientsAdditional: [...newIngredientsAdditional] });
    this.formGroup.markAsDirty();

    this.showNotificationAfterAddIngredientToBuyIngredientList(ingredients);
  }

  onOpenAddAdditionalDialog() {
    this.ingredientAdditionalDialogsService.openAddOrEditIngredientsAdditionalDialog();
  }

  onOpenSearchWithIngredientsSelected(selectedIngredients: Ingredient[]) {
    let text = "";
    selectedIngredients.forEach((ingredient, index, array) => {
      text += ingredient.name;
      if (index < array.length - 1) text += ", ";
    });
    this.searchQuickNavigateService.openSearchWithSearchText(text);
  }

  onActionSearchClick() {
    this.searchQuickNavigateService.openSearchWithFilterRecipeOnShoppinglist();
  }

  showIngredientFilterFindByKey(date: Date, filterKey: string) {
    return findItems(date).some((item) => item.key === filterKey);
  }

  onAddPurchaseDialog() {
    const ingredientsAdditional =
      cloneDeep(this.formGroup.controls.ingredientsAdditional.value) ?? [];
    const ingredientsChecked = cloneDeep(this.formGroup.controls.ingredientsChecked.value) ?? [];

    const recipeIds: string[] = [];
    const recipesList: Recipe[] = [];

    // Zusätzliche und abgehakte Zutaten vorverarbeiten,
    // als wären die Checkboxen im Dialog bereits gecheckt
    this.formGroup.controls.ingredients.value?.forEach((ingredient) => {
      // Falls abgehakt, dann aus den zusätzlichen Zutaten entfernen
      if (ingredient._checked) {
        const index = ingredientsAdditional.findIndex((ingr) => ingredient.equalNameAndUnit(ingr));
        if (index !== -1) {
          ingredientsAdditional.splice(index, 1);

          // Nur das Abhaken entfernen, wenn es in den zusätzlichen Zutaten vorkommt
          const indexChecked = ingredientsChecked.findIndex((ingr) =>
            ingredient.equalNameAndUnit(ingr)
          );
          if (indexChecked !== -1) ingredientsChecked.splice(indexChecked, 1);
        }
        // Zutat nicht in den zusätzlichen Zutaten gefunden -> RezeptId speichern
        else if (ingredient.fromWithRecipe.length) {
          const recipeId = ingredient.fromWithRecipe[0].id;
          if (recipeId && !recipeIds.includes(recipeId)) recipeIds.push(recipeId);
        }
      }
    });

    // Rezepte, die entfernt werden müssten,
    // damit am Ende alle abgehakten Zutaten entfernt wären
    this.recipeApiService.recipes$.pipe(take(1)).subscribe((recipes) => {
      recipeIds.forEach((recipeId) => {
        const recipe = recipes.find((recipe) => recipe.id === recipeId);
        if (!recipe) return;
        recipe.isOnShoppingList = null;
        recipesList.push(recipe);
      });
    });

    // Abgehakte Zutaten
    const items = this.formGroup.controls.ingredients.value
      ?.filter((ingredient) => ingredient._checked)
      .map((ingredient) => new Item({ name: ingredient.name, quantity: 1 }));

    // Text für die Rezepte-Checkbox
    const checkBoxText = recipesList.length
      ? this.translateService.instant("REMOVE_FOLLOWING_RECIPES_FROM_SHOPPINGLIST") +
        ": " +
        recipesList.map((recipe) => `"${recipe.name}"`).join(", ")
      : undefined;

    // Daten zusammensammeln für den Dialog
    combineLatest([
      this.ingredientApiService.ingredientsConversion$,
      this.storeApiService.completerListStores$,
      this.purchaseCompleterService.completerListItems$,
    ])
      .pipe(take(1))
      .subscribe(([ingredientsConversion, completerListStores, completerList]) => {
        // Dialog
        this.purchaseDialogsService
          .openAddOrEditPurchaseDialog({
            add: true,
            addFromShoppingList: {
              checkBoxText,
            },
            purchase: new Purchase({ date: new Date(), type: ItemType.FOOD, items }),
            ingredientsConversion,
            completerListStores,
            completerList,
          })
          .subscribe((result) => {
            if (!result) return;

            if (result.checkBoxes[0].checked) {
              const removeRecipes = result.checkBoxes.length > 1 && result.checkBoxes[1].checked;
              if (removeRecipes) {
                recipesList.forEach((recipe) => {
                  this.recipeApiService.saveAndReloadRecipe(recipe);
                });
              }

              this.ingredientApiService.addOrUpdateIngredientsAdditional(ingredientsAdditional);
              this.ingredientApiService.addOrUpdateIngredientsChecked(
                removeRecipes ? [] : ingredientsChecked
              );
            }
          });
      });
  }

  filterUseUntilChanged(useUntil?: string) {
    this.filterListSelectedKeys = { ...this.filterListSelectedKeys, useUntil };
  }

  filterAvailableChanged(available?: string) {
    this.filterListSelectedKeys = { ...this.filterListSelectedKeys, available };
  }

  onAddValueChanged(searchText: string) {
    this.ingredientApiService.ingredientsConversion$
      .pipe(take(1))
      .subscribe((ingredientsConversion) => {
        this.inputInfoText = Ingredient.findIngredientWithNameBySearchText(
          searchText,
          this.formGroup.controls.ingredients.value ?? [],
          ingredientsConversion,
          this.translateService.currentLang
        );
      });
  }

  showNotificationAfterAddIngredientToBuyIngredientList(ingredients: Ingredient[]) {
    if (ingredients.length === 1) {
      const ingredient = ingredients[0];
      setTimeout(() => {
        const foundIngredientInBuyList = new Ingredient(
          ingredient
        ).findSameIngredientInListByNameAndUnit(
          this.formGroup.controls.ingredients.value ?? [],
          true
          // Hier keine Separatoren, da genaue Zutat gesucht wird
        );

        if (!foundIngredientInBuyList) {
          combineLatest([
            this.ingredientApiService.ingredientsConversion$,
            this.localeService.locale$,
          ])
            .pipe(take(1))
            .subscribe(([ingredientsConversion, locale]) => {
              const availability = new Ingredient(ingredient).isAvailable(
                this.formGroup.controls.ingredientsAvailable.value ?? [],
                ingredientsConversion
              );

              if (availability.ingredientAvailable) {
                this.notificationService
                  .show(NotificationTemplateType.INGREDIENT_IS_ALREADY_AVAILABLE, {
                    snackbarPosition: this.isSmallScreen.matches ? "top" : undefined,
                    messageReplace: {
                      name: ingredient.name,
                      available: new Ingredient(
                        availability.ingredientAvailable
                      ).getIngredientString(locale, ingredientsConversion, {
                        onlyAmountAndUnitAndNote:
                          availability.ingredientAvailable.name === ingredient.name &&
                          !!availability.ingredientAvailable.amount,
                      }),
                    },
                  })
                  ?.subscribe(() => {
                    this.ingredientApiService.editOrDeleteIngredientAndUpdateIngredientAvailable(
                      availability.ingredientAvailable!,
                      true
                    );
                  });
              }
            });
        }
      }, 500);
    }
  }
}
