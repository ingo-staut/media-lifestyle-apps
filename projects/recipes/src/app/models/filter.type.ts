import { FilterButtonTristate } from "./filter-button-tristate.type";
import { FilterButtonValue } from "./filter-button-value.type";
import { FilterDates } from "./filter-dates.type";
import { FilterMultiSelectDynamicData } from "./filter-multi-select-dynamic-data.type";
import { FilterMultiSelectSpecific } from "./filter-multi-select-specific.type";
import { FilterMultiSelect } from "./filter-multi-select.type";

export type Filter = (
  | FilterButtonValue
  | FilterButtonTristate
  | FilterMultiSelect
  | FilterMultiSelectDynamicData
  | FilterDates
  | FilterMultiSelectSpecific
) & { favorite?: boolean };
