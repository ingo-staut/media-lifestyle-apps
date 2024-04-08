import { DropdownData } from "shared/models/dropdown.type";
import { DropdownDataWithRange } from "../components/dropdown-with-input/dropdown-with-input.component";
import { Media } from "./media.class";

export type FilterDates = {
  // static
  key: string;
  groupKey: string;
  texts: [string];
  icons: [string];
  data: DropdownData<string, DropdownDataWithRange>[];
  negative: boolean;
  extraIcon?: string;
  func: (media: Media, filter: FilterDates) => boolean;
  _filterDates: string;
  // dynamic
  value: string;
  show: boolean;
};
