import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FromWith, Ingredient } from "../../../models/ingredient.class";
import { WithInList } from "../../../pages/shopping-list/shopping-list.component";
import { IngredientChange } from "../../ingredients-list/ingredients-list.component";

@Component({
  selector: "app-from-button",
  templateUrl: "./from-button.component.html",
  styleUrls: ["./from-button.component.scss"],
})
export class FromButtonComponent {
  @Input() ingredient: Ingredient;
  @Input() fromWithItem: FromWith;
  @Input() withInList: WithInList;
  @Input() hasAtLeastOne: boolean;
  @Input() hasNotAtLeastOne: boolean;
  @Input() name: string;
  @Input() icon: string;

  @Output() withInListChange = new EventEmitter<WithInList>();
  @Output() ingredientChange = new EventEmitter<IngredientChange>();
  @Output() openById = new EventEmitter<string>();
  @Output() deleteById = new EventEmitter<void>();

  WithInList = WithInList;

  onDelete(event: Event): void {
    event.stopPropagation();

    const data: IngredientChange = { ingredient: this.ingredient, isDeleted: true };
    this.ingredientChange.emit(data);
  }

  onDeleteById(event: Event): void {
    event.stopPropagation();

    this.deleteById.emit();
  }
}
