import { getDigitAsString } from "shared/utils/string";

export type Conversion = {
  factor: number;
  amount: number;
  unit: string;
  costs: number[];
};

export function getConversionString(conversion: Conversion, locale: string): string {
  return (
    (conversion.amount === 0
      ? ""
      : getDigitAsString(conversion.amount, locale) + (conversion.unit ? " " : "")) +
    conversion.unit
  );
}
