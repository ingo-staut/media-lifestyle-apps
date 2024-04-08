import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Media } from "./media.class";

export type FilterButtonTristate = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string, string, string];
  icons: [string, string, string];
  func: (media: Media, filter: FilterButtonTristate) => boolean;
  _filterButtonTristate: string;
  // dynamic
  value: ButtonTristate;
  show: boolean;
};
