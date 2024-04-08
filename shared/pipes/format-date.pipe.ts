import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DateFns } from "shared/utils/date-fns";

@Pipe({
  name: "formatDate",
})
export class FormatDatePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    date: Date | null,
    locale: string,
    optionals?: { onlyDate?: boolean; onlyDateDetail?: boolean; strict?: boolean }
  ): string {
    return DateFns.formatDate(date, locale, this.translateService, optionals);
  }
}

@Pipe({
  name: "weekdayNameByDayIndex",
})
export class WeekdayNameByDayIndexPipe implements PipeTransform {
  transform(
    index: number,
    date: Date | undefined,
    locale: string,
    long: boolean = false,
    innerHTML = false
  ): string {
    if (!date || !DateFns.isValid(date))
      return DateFns.getWeekdayNameByDayIndex(index, locale, long);

    const newDate = DateFns.getClosestDateInCurrentWeek(date ?? new Date(), index, locale);

    return (
      DateFns.getWeekdayNameByDayIndex(index, locale, long) +
      (innerHTML ? "&nbsp;" : " ") +
      (innerHTML ? "<i>" : "") +
      DateFns.formatDateExtraShort(newDate, locale) +
      (innerHTML ? "</i>" : "")
    );
  }
}
