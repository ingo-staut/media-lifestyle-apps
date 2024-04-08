import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { IngredientConversion } from "./ingredient-conversion.class";
import { Recipe } from "./recipe.class";

export type FilterButtonTristate = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string, string, string];
  icons: [string, string, string];
  func: (
    recipe: Recipe,
    filter: FilterButtonTristate,
    ingredientsConversion?: IngredientConversion[]
  ) => boolean;
  _filterButtonTristate: string;
  // dynamic
  value: ButtonTristate;
  show: boolean;
};
