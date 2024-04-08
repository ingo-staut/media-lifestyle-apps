import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "iconByFunction",
})
export class IconByFunctionPipe implements PipeTransform {
  transform<ValueType>(text: ValueType, findIconFunction: (text: string) => string): string {
    if (typeof text !== "string") return "";

    return findIconFunction(text);
  }
}
