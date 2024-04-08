import { Time, getTimeString } from "./time.type";

export type TimeRange = {
  start: Time;
  end: Time | null;
};

export function getTimeRangeString(
  timeRange: TimeRange,
  locale: string,
  emptyStringIfMidnight: boolean = false
): string {
  const start = timeRange.start;
  const end = timeRange.end;

  if (start.hours === 0 && start.minutes === 0 && emptyStringIfMidnight) return "";
  if (start.hours === end?.hours && start.minutes === end?.minutes)
    return getTimeString(start, locale);

  const startDateString =
    end && locale === "en"
      ? getTimeString(start, locale)
          .replaceAll(/ ?(a|p)m/gi, "")
          ?.trim()
      : getTimeString(start, locale);

  const endDateString = end ? "-" + getTimeString(end, locale) : "";

  return startDateString + endDateString;
}
