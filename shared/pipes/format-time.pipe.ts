import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import { TimeRange, getTimeRangeString } from "shared/models/time-range.type";
import { Time } from "shared/models/time.type";
import { DateFns } from "shared/utils/date-fns";
import { firstCharToTitleCase } from "shared/utils/string";

@Pipe({
  name: "time",
})
export class TimePipe implements PipeTransform {
  transform(date: Date, locale: string, suffix = true) {
    return (
      new DatePipe(locale).transform(date, "shortTime", undefined, locale) +
      (suffix ? DateFns.getTimeStringToAppend(locale) : "")
    );
  }
}

@Pipe({
  name: "formatTime",
})
export class FormatTimePipe implements PipeTransform {
  transform(time: Time, locale: string): string {
    return DateFns.formatTimeAsTimeString(time, locale);
  }
}

@Pipe({
  name: "formatTimeOfDay",
})
export class FormatTimeOfDayPipe implements PipeTransform {
  transform(date: Date, locale: string): unknown {
    return firstCharToTitleCase(new DatePipe(locale).transform(date, "bbbb", "", locale) ?? "");
  }
}

@Pipe({
  name: "formatTimeOfDate",
})
export class FormatTimeOfDatePipe implements PipeTransform {
  transform(date: Date, locale: string): string {
    return DateFns.formatDateAsTimeString(date, locale);
  }
}

@Pipe({
  name: "formatTimeRange",
})
export class FormatTimeRangePipe implements PipeTransform {
  transform(timeRange: TimeRange, locale: string, withTimeString: boolean = false): string {
    return (
      getTimeRangeString(timeRange, locale) +
      (withTimeString ? DateFns.getTimeStringToAppend(locale) : "")
    );
  }
}
