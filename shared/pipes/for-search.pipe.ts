import { Pipe, PipeTransform } from "@angular/core";
import { forSearch } from "shared/utils/string";

@Pipe({
  name: "forSearch",
})
export class ForSearchPipe implements PipeTransform {
  transform(value: string | null): string | null {
    if (!value) return null;
    return forSearch(value);
  }
}
