import { DateRange } from "shared/utils/date-fns";

export type DropdownDataWithRange = {
  range: DateRange;
  showDayInput?: boolean;
  showDateInputs?: boolean;
};
