import { DropdownDataWithRange } from "shared/models/dropdown-data-with-range.type";
import { DropdownData } from "shared/models/dropdown.type";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Media } from "./media.class";

export type FilterDates = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string];
  icons: [string];
  data: DropdownData<string, DropdownDataWithRange>[];
  extraIcon?: string;
  func: (media: Media, filter: FilterDates) => boolean;
  _filterDates: string;
  // dynamic
  value: string;
  show: boolean;
  additionalTermsRequired: string[];
};