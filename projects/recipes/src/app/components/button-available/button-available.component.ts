import { Component, Input } from "@angular/core";
import { LocaleService } from "shared/services/locale.service";
import { AvailableType } from "../../models/enum/available.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { IngredientAvailableDialogsService } from "../../services/ingredient/ingredient-available.dialogs.service";

@Component({
  selector: "app-button-available",
  templateUrl: "./button-available.component.html",
  styleUrls: ["./button-available.component.scss"],
})
export class ButtonAvailableComponent {
  @Input() ingredient: Ingredient;
  @Input() showAddAvailabilityButton?: boolean = true;
  @Input() ingredientsAvailable?: Ingredient[] | null = null;
  @Input() ingredientsConversion?: IngredientConversion[] | null = null;
  @Input() buttonTextWithIngredientAvailable: boolean = true;

  AvailableType = AvailableType;

  constructor(
    private ingredientAvailableDialogsService: IngredientAvailableDialogsService,
    protected localeService: LocaleService
  ) {}

  onClickAddOrEditIngredientAvailable(
    ingredient: Ingredient,
    add: boolean,
    unitsAreNotTheSame: boolean
  ): void {
    const availableIngredient = new Ingredient(ingredient).findSameIngredientInListByNameAndUnit(
      this.ingredientsAvailable ?? [],
      !unitsAreNotTheSame
    );
    this.ingredientAvailableDialogsService.openAddOrEditIngredientAvailableDialog({
      ingredient: availableIngredient ?? ingredient,
      add,
      ingredientsConversion: this.ingredientsConversion,
    });
  }
}
