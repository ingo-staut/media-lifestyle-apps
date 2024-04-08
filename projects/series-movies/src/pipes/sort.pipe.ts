import { Pipe, PipeTransform } from "@angular/core";
import { SEARCH_SORT_TYPES_DATA } from "../app/data/sort.data";
import { SortType } from "../app/models/enum/sort.enum";
import { Sort } from "../app/models/sort.type";

@Pipe({
  name: "sort",
})
export class SortPipe implements PipeTransform {
  transform(list: any[] | null, sortFunction: (a: any, b: any) => number) {
    return list?.slice()?.sort(sortFunction) ?? [];
  }
}

@Pipe({
  name: "getSortItemBySortType",
})
export class SortItemBySortTypePipe implements PipeTransform {
  transform(sortType: SortType, data: ReadonlyArray<Sort>) {
    const selectedSortObject = data.find((s) => s.type === sortType);
    return selectedSortObject ? selectedSortObject : SEARCH_SORT_TYPES_DATA[0];
  }
}
