import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { Recipe } from "projects/recipes/src/app/models/recipe.class";
import { Action } from "shared/models/action.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { CATEGORIES } from "../../data/category.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { findCategoriesByType, findCategoryByType } from "../../models/enum/category.enum";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { RecipeDialogsService } from "../../services/recipe/recipe.dialogs.service";

@Component({
  selector: "app-recipe-chip",
  templateUrl: "./recipe-chip.component.html",
  styleUrls: ["./recipe-chip.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeChipComponent {
  @Input() recipe!: Recipe;
  @Input() showCosts = true;
  // Verlinktes Rezept
  @Input() actions: Action[];
  @Input() suggestionRecipe: boolean = false;
  @Input() searchTextHighlight?: string | null;
  @Input() showSearchResultMatchScore?: boolean;

  // Einkaufsliste
  @Input() shoppingList: boolean = false;

  @Output() onActionClick = new EventEmitter<string>();

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  CATEGORIES = CATEGORIES;
  findCategoriesByType = findCategoriesByType;
  findCategoryByType = findCategoryByType;

  constructor(
    private dialogService: DialogService,
    private recipeDialogService: RecipeDialogService,
    private recipeDialogsService: RecipeDialogsService,
    private recipeApiService: RecipeApiService,
    protected translateService: TranslateService,
    protected ingredientApiService: IngredientApiService,
    protected localeService: LocaleService
  ) {}

  onFavorite(event: Event): void {
    event.stopPropagation();
    this.recipe.favorite = !this.recipe.favorite;
    this.recipeApiService.saveAndReloadRecipe(this.recipe);
  }

  onNote(event: Event) {
    event.stopPropagation();

    this.recipeDialogsService.openAddOrEditNote(this.recipe);
  }

  onOpen(event: Event) {
    event.stopPropagation();

    this.recipeDialogService.openAndReloadData(this.recipe, {
      searchText: this.searchTextHighlight ?? undefined,
    });
  }

  onAction(event: Event, action: Action): void {
    event.stopPropagation();
    this.onActionClick.emit(action.id);
  }

  onChangeShoppingListAmountValue(event: Event): void {
    event.stopPropagation();

    const data: DialogData = {
      title: this.recipe.isOnShoppingList?.amountNumber ? "AMOUNT_EDIT" : "AMOUNT_ADD",
      icons: ["shopping-cart"],
      numberInputs: [
        {
          number: this.recipe.isOnShoppingList?.amountNumber ?? 0,
          icon: "note",
          placeholder: "AMOUNT",
        },
      ],
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
    };

    this.dialogService.open(data).subscribe((data) => {
      if (data === undefined) return;
      if (!this.recipe.isOnShoppingList) return;

      this.recipe.isOnShoppingList.amountNumber = data.numberInputs[0];
      this.recipeApiService.saveAndReloadRecipe(this.recipe);
    });
  }

  onOptionalClick(event: Event) {
    event.stopPropagation();

    if (this.recipe.isOnShoppingList) {
      this.recipe.isOnShoppingList.withOptionals = !this.recipe.isOnShoppingList.withOptionals;

      this.recipeApiService.saveAndReloadRecipe(this.recipe);
    }
  }

  onBannerPlanned(event: Event) {
    event.stopPropagation();

    this.recipeDialogsService.openRescheduleDialog(this.recipe).subscribe((result) => {
      if (!result) return;

      this.recipe = cloneDeep(result);
      this.recipeApiService.saveAndReloadRecipe(result);
    });
  }

  onBannerOnePortionLessLeft(event: Event) {
    event.stopPropagation();
    Recipe.onePortionLessLeft(this.recipe);

    this.recipeApiService.saveAndReloadRecipe(this.recipe);
  }
}
