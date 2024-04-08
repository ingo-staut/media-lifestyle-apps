import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Recipe } from "./recipe.class";

export type FilterMultiSelectDynamicData = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string, string, string, string];
  icons: [string, string, string, string];
  extraIcons?: string[];
  noAvailable: boolean;
  dynamicDataIndex: number;
  func: (recipe: Recipe, filter: FilterMultiSelectDynamicData) => boolean;
  // dynamic
  value: string[];
  show: boolean;
};
