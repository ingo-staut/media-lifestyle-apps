import { Pipe, PipeTransform } from "@angular/core";
import { NumberRange } from "shared/utils/date-fns";

@Pipe({
  name: "numberInRange",
})
export class NumberInRangePipe implements PipeTransform {
  transform(value: NumberRange, range: { min?: number; max?: number }, test: boolean): boolean {
    const { min, max } = range;
    if (!test) return true;
    if (!min || !max) return false;

    return (
      (value.from ?? 0) <= (value.to || Infinity) &&
      ((!!value.from && value.from < max && value.from > min) || !value.from) &&
      ((!!value.to && value.to < max && value.to > min) || !value.to)
    );
  }
}
