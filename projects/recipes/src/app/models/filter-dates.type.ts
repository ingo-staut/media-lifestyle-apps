import { DropdownDataWithRange } from "shared/models/dropdown-data-with-range.type";
import { DropdownData } from "shared/models/dropdown.type";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Recipe } from "./recipe.class";

export type FilterDates = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string];
  icons: [string];
  data: DropdownData<string, DropdownDataWithRange>[];
  extraIcon?: string;
  func: (recipe: Recipe, filter: FilterDates) => boolean;
  _filterDates: string;
  // dynamic
  value: string;
  show: boolean;
  additionalTermsRequired: string[];
};
