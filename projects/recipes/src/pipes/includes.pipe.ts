import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "includes",
})
export class IncludesPipe implements PipeTransform {
  transform<ValueType>(value: ValueType, values: ValueType[]): boolean {
    return values.some((v) => v === value);
  }
}
