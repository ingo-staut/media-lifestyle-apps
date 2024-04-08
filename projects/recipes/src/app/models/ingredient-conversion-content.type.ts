import {
  IngredientConversionContentState,
  IngredientConversionContentType,
} from "./enum/ingredient-conversion-content.enum";

export type IngredientConversionContent = {
  type: IngredientConversionContentType;
  state: IngredientConversionContentState;
};
