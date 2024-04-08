import { DateFns } from "shared/utils/date-fns";

export type Time = {
  hours: number;
  minutes: number;
};

export function getTimeString(time: Time, locale: string): string {
  if (locale === "en") {
    return DateFns.formatTimeAsTimeString(time, locale);
  }
  return `${time.hours.toString()}:${time.minutes.toString().padStart(2, "0")}`;
}

export function compareTimes(a: Time, b: Time): number {
  if (a.hours < b.hours) {
    return -1;
  } else if (a.hours > b.hours) {
    return 1;
  } else {
    if (a.minutes < b.minutes) {
      return -1;
    } else if (a.minutes > b.minutes) {
      return 1;
    } else {
      return 0;
    }
  }
}
