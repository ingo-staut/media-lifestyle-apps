import { Pipe, PipeTransform } from "@angular/core";
import { DateFns } from "shared/utils/date-fns";
import { TimeRange, getTimeRangeString } from "../../../../shared/models/time-range.type";
import { Media } from "../app/models/media.class";
import { Television } from "../app/models/television.class";

@Pipe({
  name: "television",
})
export class TelevisionPipe implements PipeTransform {
  transform(television: Television, locale: string): string {
    if (!television || !television.times) return "";

    return (
      television.times
        .map((day, index) =>
          // Nur Tage, an dem auch Zeiteinträge vorhanden sind
          {
            const time = day
              .map((timeRange) => getTimeRangeString(timeRange, locale, true))
              .filter((str) => !!str)
              .join(" ");

            return day.length
              ? DateFns.getWeekdayNameByDayIndex(index, locale) + (time ? " " + time : "")
              : null;
          }
        )
        //  Leere Tage filtern
        .filter((str) => str)
        .join(", ")
    );
  }
}

@Pipe({
  name: "televisionEventsDayHasError",
})
export class TelevisionEventsDayHasErrorPipe implements PipeTransform {
  transform(timeRange: TimeRange[], startTime: string): boolean {
    const startTimeAsDate = DateFns.setTimeStringToDate(new Date(), startTime);
    return (
      timeRange.length === 0 ||
      !timeRange.some(
        (time) =>
          time.start.hours === startTimeAsDate.getHours() &&
          time.start.minutes === startTimeAsDate.getMinutes()
      )
    );
  }
}

@Pipe({
  name: "nextInTelevision",
})
// ! Verändert irgendwie die Uhrzeiten in `_episodesInTelevision`
export class NextInTelevisionPipe implements PipeTransform {
  transform(media: Media) {
    return media.findNextEvent();
  }
}
