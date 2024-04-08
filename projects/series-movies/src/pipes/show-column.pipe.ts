import { Pipe, PipeTransform } from "@angular/core";
import { SortKey } from "../app/models/enum/sort.enum";

@Pipe({
  name: "showColumn",
})
export class ShowColumnPipe implements PipeTransform {
  transform(columnKey: SortKey, columns: SortKey[]): unknown {
    return columns.some((column) => column === columnKey);
  }
}
