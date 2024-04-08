import { Injectable } from "@angular/core";
import { tap } from "rxjs";
import { Ingredient } from "../../models/ingredient.class";
import { IngredientApiService } from "./ingredient.api.service";
import { IngredientDialogsService } from "./ingredient.dialogs.service";

@Injectable({
  providedIn: "root",
})
export class IngredientAdditionalDialogsService {
  constructor(
    private ingredientDialogsService: IngredientDialogsService,
    private ingredientApiService: IngredientApiService
  ) {}

  /**
   * Zusätzliche Zutat zur Einkaufslite hinzufügen
   * @returns Observable, welches subscribed werden soll
   */
  openAddOrEditIngredientsAdditionalDialog(parameters?: {
    ingredientsAdditional?: Ingredient[] | null;
    ingredient?: Ingredient;
    index?: number;
  }) {
    let { ingredientsAdditional, ingredient, index } = parameters ?? {};

    if (!ingredientsAdditional)
      ingredientsAdditional = this.ingredientApiService.ingredientsAdditionalSubject.value;

    return this.ingredientDialogsService
      .openAddOrEditIngredientDialogWithIngredientsList(ingredientsAdditional ?? [], {
        ingredient,
        index,
      })
      .pipe(
        tap((ingredients) => {
          this.ingredientApiService.addOrUpdateIngredientsAdditional(ingredients);
        })
      );
  }
}
