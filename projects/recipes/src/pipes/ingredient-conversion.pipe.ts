import { Pipe, PipeTransform } from "@angular/core";
import { IngredientConversion } from "../app/models/ingredient-conversion.class";
import { Ingredient } from "../app/models/ingredient.class";

@Pipe({
  name: "ingredientConversion",
})
export class IngredientConversionPipe implements PipeTransform {
  transform(
    ingredient: Ingredient,
    ingredientsConversion: IngredientConversion[] | null
  ): IngredientConversion | undefined {
    return IngredientConversion.findIngredientConversion(
      ingredient.name,
      ingredientsConversion ?? []
    );
  }
}

@Pipe({
  name: "hasEmoji",
})
export class HasEmojiPipe implements PipeTransform {
  transform(
    ingredients: Ingredient[] | null,
    ingredientsConversion: IngredientConversion[] | null
  ): boolean {
    if (!ingredientsConversion) return false;
    if (!ingredients) return false;

    return ingredients.some((ingredient) =>
      new Ingredient(ingredient).hasEmoji(ingredientsConversion)
    );
  }
}
