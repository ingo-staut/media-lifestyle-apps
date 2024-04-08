import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Media } from "./media.class";

export type FilterButtonValue = {
  // static
  key: FilterKey;
  groupKey: string;
  texts: [string, string, string, string];
  icons: [string, string, string, string];
  searchTerms: string[];
  iconDialog?: string;
  suffixShort?: string;
  suffixLong?: string;
  func: (media: Media, filter: FilterButtonValue) => boolean;
  // dynamic
  value: number;
  min: boolean;
  show: boolean;
  hideNullValues: boolean;
  sliderAndValueMax?: number;
  sliderSteps?: number;
  sliderFormatAsDuration?: boolean;
};
