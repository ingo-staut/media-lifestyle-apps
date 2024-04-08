import { FilterGroupKey } from "../models/enum/filter.enum";

export const FILTER_GROUP_NAMES_MAP = new Map<string, string>([
  [FilterGroupKey.MULTISELECT, "MULTISELECT.S"],
  [FilterGroupKey.TRISTATE, "CONTAIN"],
  [FilterGroupKey.VALUE, "WITH_SPECIFIC_VALUE"],
  [FilterGroupKey.DATES, "DATE.WITH_RANGE"],
  [FilterGroupKey.MEDIA, "SERIES_AND_MOVIES"],
]);
