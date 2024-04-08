import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocaleService } from "shared/services/locale.service";
import { IngredientConversionContentType } from "../../models/enum/ingredient-conversion-content.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Instruction } from "../../models/instruction.class";
import { Recipe } from "../../models/recipe.class";

@Component({
  selector: "app-ingredients-contents-details",
  templateUrl: "./ingredients-contents-details.component.html",
  styleUrls: ["./ingredients-contents-details.component.scss"],
})
export class IngredientsContentsDetailsComponent {
  @Input() recipe: Recipe;
  @Input() instructions?: (Instruction | null)[] | null;
  @Input() ingredientsConversion?: IngredientConversion[] | null;
  @Input() noBackground?: boolean = false;

  @Output() buttonClick = new EventEmitter<string>();

  IngredientConversionContentType = IngredientConversionContentType;

  constructor(protected localeService: LocaleService) {}

  onButtonClicked(key: string) {
    this.buttonClick.emit(key);
  }
}
