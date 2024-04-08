import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Media } from "./media.class";

export type FilterMultiSelectDynamicData = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string, string, string, string];
  icons: [string, string, string, string];
  extraIcons?: string[];
  noAvailable: boolean;
  dynamicDataIndex: number;
  func: (media: Media, filter: FilterMultiSelectDynamicData) => boolean;
  // dynamic
  value: string[];
  show: boolean;
};
