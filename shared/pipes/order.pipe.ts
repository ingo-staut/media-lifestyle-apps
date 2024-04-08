import { Pipe, PipeTransform } from "@angular/core";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";

@Pipe({
  name: "orderWithValue",
})
export class OrderWithValuePipe implements PipeTransform {
  transform(value: ButtonTristate | number | null, extendFilters: boolean): unknown {
    if (value === null) return 0;
    if (typeof value === "number") return value >= 0 && !extendFilters ? -1 : 0;
    return value !== ButtonTristate.NONE && !extendFilters ? -1 : 0;
  }
}

@Pipe({
  name: "orderWithValues",
})
export class OrderWithValuesPipe implements PipeTransform {
  transform<ValueType>(values: ValueType[] | null, extendFilters: boolean): unknown {
    if (values === null) return 0;
    return values.length > 0 && !values.includes(0 as ValueType) && !extendFilters ? -1 : 0;
  }
}
