import { Ingredient } from "./ingredient.class";

export type IngredientAvailability = {
  ratio: number;
  ingredientAvailable?: Ingredient;
};
