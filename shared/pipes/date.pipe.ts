import { Pipe, PipeTransform } from "@angular/core";
import { Time } from "shared/models/time.type";
import { DateFns } from "shared/utils/date-fns";

@Pipe({
  name: "date",
})
export class DatePipe implements PipeTransform {
  transform(isSunday: boolean, locale: string): number {
    return 2;
  }
}

@Pipe({
  name: "sameTime",
})
export class SameTimePipe implements PipeTransform {
  transform(timeRange: Time, compareTime: string): boolean {
    const time = DateFns.setTimeStringToDate(new Date(), compareTime);
    return timeRange.hours === time.getHours() && timeRange.minutes === time.getMinutes();
  }
}

@Pipe({
  name: "isSameDate",
})
export class IsSameDatePipe implements PipeTransform {
  transform(date: Date, compareDate: Date): boolean {
    return DateFns.isSameDate(date, compareDate);
  }
}

@Pipe({
  name: "isToday",
})
export class IsTodayPipe implements PipeTransform {
  transform(date: Date): boolean {
    return DateFns.isToday(date);
  }
}

@Pipe({
  name: "isAfterDate",
})
export class IsAfterDatePipe implements PipeTransform {
  transform(date: Date, compareDate: Date): boolean {
    return DateFns.isAfter(date, compareDate);
  }
}

@Pipe({
  name: "isBeforeDate",
})
export class IsBeforeDatePipe implements PipeTransform {
  transform(date: Date, compareDate: Date): boolean {
    return DateFns.isBefore(date, compareDate);
  }
}

@Pipe({
  name: "daysBetweenDates",
})
export class DaysBetweenDatesPipe implements PipeTransform {
  transform(date: Date, compareDate: Date): number {
    return DateFns.daysBetweenDates(date, compareDate);
  }
}
