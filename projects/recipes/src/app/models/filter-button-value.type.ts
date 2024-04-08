import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { IngredientConversion } from "./ingredient-conversion.class";
import { Recipe } from "./recipe.class";

export type FilterButtonValue = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string, string, string, string];
  icons: [string, string, string, string];
  searchTerms: string[];
  iconDialog?: string;
  suffixShort?: string;
  suffixLong?: string;
  func: (
    recipe: Recipe,
    filter: FilterButtonValue,
    ingredientsConversion: IngredientConversion[]
  ) => boolean;
  // dynamic
  value: number;
  min: boolean;
  show: boolean;
  hideNullValues: boolean;
  sliderAndValueMax?: number;
  sliderSteps?: number;
  sliderFormatAsDuration?: boolean;
};
