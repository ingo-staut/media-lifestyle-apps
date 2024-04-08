import { DropdownData } from "shared/models/dropdown.type";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Media } from "./media.class";

export const DEFAULT_KEY = "none";

export type FilterSelect = {
  // static
  key: FilterKey;
  show: boolean;
  groupKey: string;
  data: DropdownData<string, string>[];
  texts: [string];
  icons: [string];
  value: string;
  alsoSingular?: boolean;
  func: (media: Media, filter: FilterSelect) => boolean;
  _filterSelect: string;
};
