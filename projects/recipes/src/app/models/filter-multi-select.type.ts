import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { Recipe } from "./recipe.class";

export type FilterMultiSelect<EntryType = any> = {
  // static
  key: FilterKey;
  isString: boolean;
  groupKey: string;
  texts: [string, string, string, string];
  icons: [string, string, string, string];
  extraIcons?: string[];
  groups: ReadonlyArray<Group<EntryType>>;
  noAvailable: boolean;
  findByTypes: (type: EntryType[]) => Entry<EntryType>[];
  func: (recipe: Recipe, filter: FilterMultiSelect) => boolean;
  // dynamic
  _filterMultiSelect: string;
  value: EntryType[];
  show: boolean;
};
