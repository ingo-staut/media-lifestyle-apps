import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
})
export class FilterPipe implements PipeTransform {
  transform(list: any[] | undefined | null, func: (item: any) => boolean, triggerPipe: any): any[] {
    if (!list) return [];
    return list.filter(func);
  }
}
