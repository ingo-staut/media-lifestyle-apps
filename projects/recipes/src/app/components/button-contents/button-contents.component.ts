import { Component, Input } from "@angular/core";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { IngredientConversionDialogsService } from "../../services/ingredient/ingredient-conversion.dialogs.service";

@Component({
  selector: "app-button-contents[name][ingredientsConversion]",
  templateUrl: "./button-contents.component.html",
  styleUrls: ["./button-contents.component.scss"],
})
export class ButtonContentsComponent {
  @Input() name: string;
  @Input() show: boolean = true;
  @Input() showAddConversionButton: boolean = true;
  @Input() ingredientsConversion?: IngredientConversion[] | null = null;

  constructor(private ingredientConversionDialogsService: IngredientConversionDialogsService) {}

  openEditIngredientConversionDialog(event: Event, name: string) {
    event.stopPropagation();

    const conversion = IngredientConversion.findIngredientConversion(
      name,
      this.ingredientsConversion ?? []
    );

    if (conversion) {
      this.ingredientConversionDialogsService.openEditIngredientConversionDialog(conversion);
    } else {
      this.ingredientConversionDialogsService.openAddIngredientConversionDialog(name);
    }
  }
}
