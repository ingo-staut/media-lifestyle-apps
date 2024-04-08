import { EventEmitter, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { combineLatest, map, take } from "rxjs";
import { DialogAction } from "shared/models/dialog-action.type";
import { ActionButton } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { SearchEngine } from "shared/models/search-engine.type";
import { Url } from "shared/models/url.class";
import { UrlService } from "shared/services/url.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { URL_FAVICON, getTitleOfUrl, isValidHttpUrl } from "shared/utils/url";
import { PREPARATION_HISTORY_DATA } from "../../data/preparation-history.data";
import { PageIndex } from "../../data/sidenav.menu.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { FunctionsDialogService } from "../../dialogs/functions-dialog/functions-dialog.service";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { PreparationHistoryType } from "../../models/enum/preparation-history.enum";
import { Nutrition } from "../../models/nutrition.type";
import { PreparationHistoryEntry } from "../../models/preparation-history.class";
import { RecipeOnShoppingList } from "../../models/recipe-shoppinglist.type";
import { Recipe } from "../../models/recipe.class";
import { IngredientAdditionalDialogsService } from "../ingredient/ingredient-additional.dialogs.service";
import { IngredientAvailableDialogsService } from "../ingredient/ingredient-available.dialogs.service";
import { IngredientConversionDialogsService } from "../ingredient/ingredient-conversion.dialogs.service";
import { IngredientApiService } from "../ingredient/ingredient.api.service";
import { LocalStorageService } from "../local-storage.service";
import { PurchaseCompleterService } from "../purchase/purchase.completer.service";
import { PurchaseDialogsService } from "../purchase/purchase.dialogs.service";
import { StoreApiService } from "../store/store.api.service";
import { StoreService } from "../store/store.service";
import { RecipeApiService } from "./recipe.api.service";
import { RecipeImportService } from "./recipe.import.service";

@Injectable({
  providedIn: "root",
})
export class RecipeDialogsService {
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(
    private dialogService: DialogService,
    private recipeApiService: RecipeApiService,
    private translateService: TranslateService,
    private recipeDialogService: RecipeDialogService,
    private recipeImportService: RecipeImportService,
    private functionsDialogService: FunctionsDialogService,
    private ingredientApiService: IngredientApiService,
    private storeApiService: StoreApiService,
    private purchaseCompleterService: PurchaseCompleterService,
    private localStorageService: LocalStorageService,
    private purchaseDialogsService: PurchaseDialogsService,
    private ingredientAdditionalDialogsService: IngredientAdditionalDialogsService,
    private ingredientAvailableDialogsService: IngredientAvailableDialogsService,
    private ingredientConversionDialogsService: IngredientConversionDialogsService,
    private storeService: StoreService
  ) {}

  openAddToShoppingListDialog(isOnShoppingList: RecipeOnShoppingList | null, amountNumber: number) {
    const add = isOnShoppingList === null;

    const data: DialogData = {
      title: add ? "SHOPPING_LIST.ADD" : "SHOPPING_LIST.EDIT",
      icons: ["shopping-cart"],
      numberInputs: [
        {
          number: isOnShoppingList?.amountNumber ?? amountNumber ?? 1,
          icon: "portion",
          placeholder: "AMOUNT",
          showSlider: true,
          required: true,
        },
      ],
      buttonInputs: [
        {
          state: isOnShoppingList?.withOptionals ?? false,
          icons: ["optional", "optional-not"],
          texts: ["STEPS.WITH_OPTIONALS", "STEPS.WITHOUT_OPTIONALS"],
          placeholder: "STEPS.OPTIONALS",
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          if (result.actionDelete) {
            return null;
          }

          isOnShoppingList = {
            withOptionals: result.buttonInputs[0].state,
            amountNumber: result.numberInputs[0],
          };
          return isOnShoppingList;
        } else {
          return isOnShoppingList;
        }
      })
    );
  }

  openPreparedTodayDialog(recipe: Recipe) {
    const lastPlannedIndex = recipe.lastPlannedIndex;
    const { date, amount } = recipe.preparationHistory[lastPlannedIndex];

    // Wenn geplant für Morgen,
    // aber auf "Heute zubereitet" geklickt,
    // dann das heutige Datum
    const preparationDate = DateFns.isBeforeToday(date) ? date : new Date();

    // Wenn drei Auflaufformen zubereitet werden
    // und im Rezept zwei Auflaufformen sind,
    // dann muss man 3 / 2,
    // also die 1.5-fache Menge an Portionen, nehmen.
    const portionsEaten = 1;
    const portionsLeft = (amount / recipe.amountNumber) * recipe.portions - portionsEaten;

    const data: DialogData = {
      title: "HISTORY.PREPARED_RECIPE",
      icons: ["preparationHistory-prepared"],
      numberInputs: [
        {
          number: amount,
          placeholder: "AMOUNT",
          icon: "portion",
          order: 2,
          suffixShort: recipe.amountText,
          suffixLong: recipe.amountText,
          showSlider: true,
          required: true,
        },
        {
          number: portionsLeft,
          placeholder: "PORTION.LEFT.",
          icon: "portion-eat",
          order: 3,
          suffixLong: "PORTION.LEFT.",
          suffixShort: "PORTION.LEFT.SHORT",
          showSlider: true,
        },
      ],
      dateInputs: [
        {
          date: preparationDate,
          max: new Date(),
          placeholder: "DATE.",
          required: true,
          order: 1,
        },
      ],
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
    };

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      const date = result.dateInputs[0]!;
      const amount = result.numberInputs[0];
      const portionsAvailable = result.numberInputs[1];

      const newData: PreparationHistoryEntry = new PreparationHistoryEntry({
        ...recipe.preparationHistory[lastPlannedIndex],
        date,
        amount,
        portionsAvailable,
        type: PreparationHistoryType.PREPARED,
      });

      recipe.preparationHistory[lastPlannedIndex] = newData;

      this.recipeApiService.saveAndReloadRecipe(recipe);
    });
  }

  openRescheduleDialog(recipe: Recipe) {
    const lastPlannedIndex = recipe.lastPlannedIndex;
    const { date } = recipe.preparationHistory[lastPlannedIndex];

    const data: DialogData = {
      title: "HISTORY.RESCHEDULE_RECIPE",
      icons: ["calendar-future"],
      dateInputs: [
        {
          date,
          placeholder: "DATE.",
          required: true,
          order: 1,
        },
      ],
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
      actionDelete: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return;

        // Löschen
        if (result.actionDelete) {
          recipe.preparationHistory.splice(lastPlannedIndex, 1);
        }

        // Bearbeiten / Hinzufügen
        else if (result.actionAddOrApply) {
          const newData: PreparationHistoryEntry = new PreparationHistoryEntry({
            ...recipe.preparationHistory[lastPlannedIndex],
            date: result.dateInputs[0]!,
          });

          recipe.preparationHistory[lastPlannedIndex] = newData;
        }

        return recipe;
      })
    );
  }

  openAddToShoppingListAndAddPreparationHistoryDialog(recipe: Recipe) {
    const data: DialogData = {
      title: "HISTORY.PLAN_RECIPE",
      icons: ["preparationHistory-planned"],
      numberInputs: [
        {
          number: recipe.amountNumber,
          icon: "portion",
          placeholder: "AMOUNT",
          showSlider: true,
          required: true,
        },
      ],
      dateInputs: [
        {
          date: new Date(),
          min: new Date(),
          placeholder: "DATE.",
          required: true,
        },
      ],
      buttonInputs: [
        {
          key: "shoppingList",
          state: false,
          icons: ["shopping-cart-filled", "shopping-cart"],
          texts: ["SHOPPING_LIST.ADD", "SHOPPING_LIST."],
          placeholder: "SHOPPING_LIST.",
        },
        {
          key: "withOptionals",
          state: false,
          icons: ["optional", "optional-not"],
          texts: ["STEPS.WITH_OPTIONALS", "STEPS.WITHOUT_OPTIONALS"],
          placeholder: "STEPS.OPTIONALS",
        },
      ],
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
    };

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      if (result.actionApply) {
        const addToShoppingList = result.buttonInputs[0].state ?? false;
        const withOptionals = result.buttonInputs[1].state ?? false;
        const amountNumber = result.numberInputs[0];
        const date = result.dateInputs[0] ?? undefined;

        if (addToShoppingList) {
          recipe.isOnShoppingList = {
            amountNumber,
            withOptionals,
          };
        }

        recipe.preparationHistory.unshift(
          new PreparationHistoryEntry({
            type: PreparationHistoryType.PLANNED,
            date,
            amount: amountNumber,
          })
        );

        this.recipeApiService.saveAndReloadRecipe(recipe);
      }
    });
  }

  openAddOrEditPreparationHistoryEntryDialog(parameters?: {
    preparationHistoryEntry: PreparationHistoryEntry;
    amountText: string;
    edit: EventEmitter<PreparationHistoryEntry>;
    remove: EventEmitter<undefined>;
  }) {
    const { preparationHistoryEntry, amountText, edit, remove } = parameters ?? {};
    const { date, amount, note, type, portionsAvailable } = preparationHistoryEntry ?? {};

    const add = !preparationHistoryEntry;

    const data: DialogData = {
      title: add ? "HISTORY.ADD" : "HISTORY.EDIT",
      icons: ["history"],
      textInputs: [
        {
          text: note ?? "",
          placeholder: "NOTE.",
          icon: "note",
          order: 6,
        },
      ],
      numberInputs: [
        {
          number: amount || null,
          placeholder: "AMOUNT",
          icon: "portion",
          order: 1,
          suffixShort: amountText,
          suffixLong: amountText,
          showSlider: true,
          required: true,
        },
        {
          number: portionsAvailable || null,
          placeholder: "PORTION.LEFT.",
          icon: "portion-eat",
          order: 2,
          suffixLong: "PORTION.LEFT.",
          suffixShort: "PORTION.LEFT.SHORT",
          showSlider: true,
        },
      ],
      dateInputs: [
        {
          date: date ?? new Date(),
          placeholder: "DATE.",
          required: true,
          order: 3,
        },
      ],
      timeInputs: [
        {
          time: DateFns.formatDateAsTimeString(
            date ?? new Date(),
            this.translateService.currentLang
          ),
          placeholder: "TIME.CLOCK",
          minutesSteps: 5,
          order: 4,
        },
      ],
      toggleGroupInputs: [
        {
          data: PREPARATION_HISTORY_DATA,
          selectedKey: type ?? PreparationHistoryType.PREPARED,
          showText: !this.isSmallScreen.matches,
          showTextOnlySelected: this.isSmallScreen.matches,
          placeholder: "TYPE",
          order: 5,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      take(1),
      map((result) => {
        if (!result) return;

        const onlyDate = result.dateInputs[0]!;
        const date = DateFns.setTimeStringToDate(onlyDate, result.timeInputs[0]!);

        const data = new PreparationHistoryEntry({
          ...preparationHistoryEntry,
          amount: result.numberInputs[0],
          portionsAvailable: result.numberInputs[1],
          date,
          type: result.toggleGroupInputs[0] as PreparationHistoryType,
          note: result.textInputs[0],
        });

        // Bearbeiten
        if (result.actionApply) {
          edit?.emit(data);
        }

        // Löschen
        else if (result.actionDelete) {
          remove?.emit();
        }

        // Hinzufügen
        else if (result.actionAdd) {
          return data;
        }

        return;
      })
    );
  }

  openAddOrEditNote(recipe: Recipe) {
    const add = !recipe.note;

    const data: DialogData = {
      title: add ? "NOTE.ADD" : "NOTE.EDIT",
      text: recipe.note ? "NOTE.EDIT_TEXT" : undefined,
      icons: ["note"],
      textInputs: [
        {
          text: recipe.note,
          icon: "note",
          placeholder: "NOTE.",
          required: add,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      if (result.actionAddOrApply) {
        recipe.note = result.textInputs[0];
      }

      if (result.actionDelete) {
        recipe.note = "";
      }

      this.recipeApiService.saveAndReloadRecipe(recipe);
    });
  }

  openTitlesDialog(recipe: Recipe) {
    const { name } = recipe;

    const data: DialogData = {
      title: "TITLE",
      icons: ["rename"],
      textInputs: [
        {
          text: name,
          icon: "rename",
          placeholder: "TITLE",
          required: true,
        },
      ],
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          return result.textInputs[0];
        } else {
          return undefined;
        }
      })
    );
  }

  openNoteDialog(recipe: Recipe) {
    const { note } = recipe;

    const add = !note;
    const data: DialogData = {
      title: "NOTE.",
      icons: ["note"],
      textInputs: [
        {
          text: note,
          icon: "note",
          placeholder: "NOTE.",
          required: true,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          if (result.actionDelete) {
            return "";
          }
          return result.textInputs[0];
        } else {
          return undefined;
        }
      })
    );
  }

  openPortionDialog(recipe: Recipe) {
    const { amountNumber, amountText, portions } = cloneDeep(recipe);

    const add = amountNumber === 0 || amountText === "" || portions === 0;
    const data: DialogData = {
      title: "PORTION.S",
      icons: ["portion"],
      numberInputs: [
        {
          number: amountNumber,
          icon: "portion",
          placeholder: "AMOUNT",
          required: true,
          showSlider: true,
          sliderMin: 1,
          sliderMax: 10,
          order: 1,
        },
        {
          number: portions,
          icon: "portion-eat",
          placeholder: "PORTION.S",
          required: true,
          suffixLong: "PORTION.SHORT",
          suffixShort: "PORTION.SHORT",
          showSlider: true,
          sliderMin: 1,
          sliderMax: 10,
          order: 3,
        },
      ],
      textInputs: [
        {
          text: amountText,
          placeholder: "UNIT",
          icon: "unit",
          required: true,
          order: 2,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          return {
            amountText: result.textInputs[0],
            amountNumber: result.numberInputs[0],
            portions: result.numberInputs[1],
          };
        } else {
          return undefined;
        }
      })
    );
  }

  openImagesDialog(recipe: Recipe, searchEngines: SearchEngine[], title: string) {
    const images = cloneDeep(recipe.images);
    const add = images.length === 0;
    const searchEnginesFilteredImage = searchEngines.filter(
      (searchEngine) =>
        searchEngine.type === SearchEngineType.IMAGE_PREVIEW_IMAGE ||
        searchEngine.type === SearchEngineType.IMAGE_HEADER_IMAGE
    );

    const buttons: ActionButton[] = searchEnginesFilteredImage.map((searchEngine) => {
      const data: ActionButton = {
        action: {
          id: "",
          text: searchEngine.name,
          icon: "",
          image: searchEngine.image || URL_FAVICON + searchEngine.url,
        },
        searchEngine: searchEngine,
        func: (event: MouseEvent, urlService: UrlService) => {
          urlService.openOrCopyUrl({ event, searchEngine, title });
        },
      };

      return data;
    });

    // Suchmaschinen anzeigen, wenn Titel gesetzt
    const actionButtons = title
      ? [
          {
            placeholder:
              this.translateService.instant("QUICKADD.") +
              ": " +
              this.translateService.instant("IMAGE."),
            buttons,
          },
        ]
      : [];

    const data: DialogData = {
      title: "IMAGE.S",
      icons: ["image"],
      itemsInputs: [
        {
          placeholder: "IMAGE.S",
          items: images,
          firstCharToTitleCase: false,
          showDeleteButton: true,
          showAddFromClipboardButton: true,
          showDeleteAllExceptFirst: true,
          showDeleteAllExceptFirstTwo: true,
        },
      ],
      actionButtons,
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          if (result.actionDelete) {
            return [];
          }
          return result.itemsInputs[0];
        } else {
          return undefined;
        }
      })
    );
  }

  openNutritionsDialog(nutritionDetails: Nutrition) {
    const add = !nutritionDetails;

    const detailsGram = {
      suffixShort: "g",
      suffixLong: "g",
    };
    const detailsMilligram = {
      suffixShort: "mg",
      suffixLong: "mg",
    };

    const data: DialogData = {
      title: "NUTRITION.S",
      icons: ["nutrition"],
      textInputs: [
        {
          text: nutritionDetails?.servingSize ?? "",
          placeholder: "NUTRITION.SERVING_SIZE",
          icon: "portion-eat",
        },
      ],
      numberInputs: [
        {
          number: nutritionDetails?.calories ?? null,
          placeholder: "NUTRITION.CALORIES",
          icon: "nutrition-calories",
          suffixShort: "kcal",
          suffixLong: "kcal",
        },

        {
          number: nutritionDetails?.fat ?? null,
          placeholder: "NUTRITION.FAT",
          icon: "nutrition-fat",
          ...detailsGram,
        },
        {
          number: nutritionDetails?.saturatedFat ?? null,
          placeholder: "NUTRITION.SATURATED_FAT",
          icon: "nutrition-saturated-fat",
          ...detailsGram,
        },

        {
          number: nutritionDetails?.carbohydrate ?? null,
          placeholder: "NUTRITION.CARBOHYDRATE",
          icon: "nutrition-carbohydrate",
          ...detailsGram,
        },
        {
          number: nutritionDetails?.fiber ?? null,
          placeholder: "NUTRITION.FIBER",
          icon: "nutrition-fiber",
          ...detailsGram,
        },
        {
          number: nutritionDetails?.sugar ?? null,
          placeholder: "NUTRITION.SUGAR",
          icon: "nutrition-sugar",
          ...detailsGram,
        },

        {
          number: nutritionDetails?.protein ?? null,
          placeholder: "NUTRITION.PROTEIN",
          icon: "nutrition-protein",
          ...detailsGram,
        },

        {
          number: nutritionDetails?.sodium ?? null,
          placeholder: "NUTRITION.SODIUM",
          icon: "nutrition-sodium",
          ...detailsMilligram,
        },
        {
          number: nutritionDetails?.potassium ?? null,
          placeholder: "NUTRITION.POTASSIUM",
          icon: "nutrition",
          ...detailsMilligram,
        },
        {
          number: nutritionDetails?.calcium ?? null,
          placeholder: "NUTRITION.CALCIUM",
          icon: "nutrition",
          ...detailsMilligram,
        },
        {
          number: nutritionDetails?.iron ?? null,
          placeholder: "NUTRITION.IRON",
          icon: "nutrition",
          ...detailsMilligram,
        },

        {
          number: nutritionDetails?.cholesterol ?? null,
          placeholder: "NUTRITION.CHOLESTEROL",
          icon: "nutrition",
          ...detailsGram,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return;

        if (result.actionDelete) {
          return [];
        }

        const nutrition: Nutrition = {
          servingSize: result.textInputs[0] ?? "",
          calories: result.numberInputs[0] || null,
          fat: result.numberInputs[1] || null,
          saturatedFat: result.numberInputs[2] || null,
          carbohydrate: result.numberInputs[3] || null,
          fiber: result.numberInputs[4] || null,
          sugar: result.numberInputs[5] || null,
          protein: result.numberInputs[6] || null,
          sodium: result.numberInputs[7] || null,
          potassium: result.numberInputs[8] || null,
          calcium: result.numberInputs[9] || null,
          iron: result.numberInputs[10] || null,
          cholesterol: result.numberInputs[11] || null,
        };

        return [nutrition];
      })
    );
  }

  async openCreateDialog(searchText: string, selectedIndex: number) {
    const textFromClipboard = await navigator.clipboard.readText();
    const recipe = this.recipeImportService.readInRecipe(textFromClipboard);

    const url = isValidHttpUrl(textFromClipboard) ? textFromClipboard : undefined;

    const focusOnRecipe =
      selectedIndex === PageIndex.RECIPES ||
      selectedIndex === PageIndex.EXPLORE ||
      selectedIndex === PageIndex.SEARCH;

    const actions: DialogAction[] = [
      {
        key: "create-recipe",
        text: "RECIPE.",
        icon: "recipe",
        autoFocus: focusOnRecipe && !recipe && !url,
      },
      {
        key: "create-purchase",
        text: "PURCHASE.",
        icon: "shopping-cart",
        autoFocus: selectedIndex === PageIndex.PURCHASES,
      },
      {
        key: "create-ingredient-shopping-list",
        text: "INGREDIENT.",
        subText: "MENU.SHOPPING_LIST",
        icon: "shopping-list",
        autoFocus: selectedIndex === PageIndex.SHOPPING_LIST,
      },
      {
        key: "create-ingredient-available",
        text: "INGREDIENT.",
        subText: "AVAILABLE.",
        icon: "available",
      },
      {
        key: "create-conversion",
        text: "INGREDIENT.",
        subText: "CONVERSION.SHORT",
        icon: "ingredient-conversion",
      },
      {
        key: "create-store",
        text: "STORE.",
        icon: "store",
      },
    ];

    if (recipe) {
      actions.unshift({
        key: "create-recipe-quickfill",
        text: "RECIPE.",
        subText: recipe.name,
        icon: "quick-add",
        autoFocus: focusOnRecipe,
      });
    }

    if (url) {
      actions.unshift({
        key: "create-recipe-by-url",
        text: "RECIPE.",
        subText: getTitleOfUrl(url),
        subImage: URL_FAVICON + url,
        icon: "quick-add",
        autoFocus: focusOnRecipe,
      });
    }

    this.functionsDialogService
      .open({
        title: "CREATE",
        actions,
      })
      .subscribe((result) => {
        if (result) {
          this.openCreateDialogByKey(result, searchText, selectedIndex, recipe, url);
        }
      });
  }

  openCreateDialogByKey(
    key: string,
    searchText: string,
    selectedIndex: number,
    recipe?: Recipe,
    url?: string
  ) {
    switch (key) {
      case "more":
        this.openCreateDialog(searchText, selectedIndex);
        break;
      case "create-recipe":
        this.onOpenCreateRecipeDialog();
        break;
      case "create-purchase":
        this.onOpenCreatePurchaseDialog();
        break;
      case "create-ingredient-shopping-list":
        this.ingredientAdditionalDialogsService
          .openAddOrEditIngredientsAdditionalDialog()
          .subscribe();
        break;
      case "create-ingredient-available":
        this.ingredientAvailableDialogsService.openAddOrEditIngredientAvailableDialog();
        break;
      case "create-store":
        this.storeService.openAddOrEditDialog();
        break;
      case "create-conversion":
        this.ingredientConversionDialogsService.openAddIngredientConversionDialog();
        break;
      case "create-recipe-quickfill":
        if (recipe) {
          recipe.id = "";
          this.recipeDialogService.openAndReloadData(recipe);
        }
        break;
      case "create-recipe-by-url":
        if (url)
          this.recipeDialogService.openAndReloadData(new Recipe({ urls: [new Url({ url })] }), {
            triggerQuickAdd: true,
          });
        break;

      default:
        break;
    }
  }

  onOpenCreateRecipeDialog() {
    this.recipeDialogService.openAndReloadData(new Recipe({}), { openEditTitle: true });
  }

  onOpenCreatePurchaseDialog() {
    combineLatest([
      this.ingredientApiService.ingredientsConversion$,
      this.storeApiService.completerListStores$,
      this.purchaseCompleterService.completerListItems$,
    ])
      .pipe(take(1))
      .subscribe(([ingredientsConversion, completerListStores, completerList]) => {
        const defaultType = this.localStorageService.getPurchasesFilterType();
        this.purchaseDialogsService
          .openAddOrEditPurchaseDialog({
            ingredientsConversion,
            completerListStores,
            completerList,
            defaultType,
          })
          .subscribe();
      });
  }
}
