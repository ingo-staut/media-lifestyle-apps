import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Group } from "shared/models/type-group.type";
import { Media } from "./media.class";

export type FilterMultiSelectSpecific = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string, string, string, string];
  icons: [string, string, string, string];
  extraIcons?: string[];
  groups: ReadonlyArray<Group<string>>;
  specialOppositeValues: [string, string][];
  func: (media: Media, filter: FilterMultiSelectSpecific) => boolean;
  _filterMultiSelectSpecific: string;
  // dynamic
  value: string[];
  show: boolean;
};
