import { NumberRange } from "shared/utils/date-fns";

export type DropdownDataWithNumberRange = {
  range: NumberRange;
  showNumberInput?: boolean;
  showNumberInputs?: boolean;
  textFrom?: string;
  textTo?: string;
  min: number;
  max: number;
};
