import { Pipe, PipeTransform } from "@angular/core";
import { DateFns } from "shared/utils/date-fns";

@Pipe({
  name: "timeHourFormat",
})
export class TimeHourFormatPipe implements PipeTransform {
  transform(locale: string) {
    return DateFns.getHourFormat(locale);
  }
}
