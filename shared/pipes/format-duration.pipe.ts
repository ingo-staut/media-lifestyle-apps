import { Pipe, PipeTransform } from "@angular/core";
import { DateFns } from "shared/utils/date-fns";

@Pipe({
  name: "formatDuration",
})
export class FormatDurationPipe implements PipeTransform {
  transform(totalMinutes: number, longText: boolean, locale: string) {
    return DateFns.formatDuration(totalMinutes, longText, locale);
  }
}
