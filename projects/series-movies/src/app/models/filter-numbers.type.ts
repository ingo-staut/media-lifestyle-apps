import { DropdownDataWithNumberRange } from "shared/models/dropdown-data-with-number-range.type";
import { DropdownData } from "shared/models/dropdown.type";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Media } from "./media.class";

export type FilterNumbers = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string];
  icons: [string];
  data: DropdownData<string, DropdownDataWithNumberRange>[];
  extraIcon?: string;
  valueDefault: string;
  func: (media: Media, filter: FilterNumbers) => boolean;
  _filterNumbers: string;
  // dynamic
  value: string;
  show: boolean;
  additionalTermsRequired: string[];
};
