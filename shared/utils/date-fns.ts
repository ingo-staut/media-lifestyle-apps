import { TranslateService } from "@ngx-translate/core";
import {
  addDays,
  addMinutes,
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  hoursToMinutes,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  isTomorrow,
  isValid,
  isWithinInterval,
  isYesterday,
  lastDayOfMonth,
  minutesToMilliseconds,
  parse,
  setDefaultOptions,
  setHours,
  setMinutes,
  setSeconds,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { de, enUS, es, fr } from "date-fns/locale";
import { Time } from "shared/models/time.type";
import { roundToNextNumber } from "./number";
import { cleanString, firstCharToTitleCase, joinTextWithComma } from "./string";
setDefaultOptions({ locale: de });

export interface DurationRange {
  min?: number;
  max?: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface NumberRange {
  from: number | null;
  to: number | null;
}

export class DateFns {
  static readonly lastDate = new Date(9999, 0, 1);
  static readonly firstDate = new Date(-1);
  static readonly separatorInParams = "_";
  static readonly HOURS_IN_DAY = 24;
  static readonly MINUTES_IN_HOUR = 60;
  static readonly MINUTES_IN_DAY = DateFns.HOURS_IN_DAY * DateFns.MINUTES_IN_HOUR;
  static readonly shortMinutes = ["Min.", "m", "min.", "min."];
  static readonly longMinutes = ["Minute(n)", "minute(s)", "minute(s)", "minuto(s)"];
  static readonly shortHours = ["Std.", "h", "h", "hr."];
  static readonly longHours = ["Stunde(n)", "hour(s)", "heure(s)", "hora(s)"];
  static readonly shortDays = ["Tg.", "d", "j", "d"];
  static readonly longDays = ["Tag(e)", "day(s)", "jour(s)", "día(s)"];
  static readonly timeString = ["Uhr", null, null, null];
  static readonly hourFormat = [24, 12, 24, 24];

  private static getLocale(locale: string): Locale {
    switch (locale) {
      case "de":
        return de;
      case "en":
        return enUS;
      case "es":
        return es;
      case "fr":
        return fr;
      default:
        return de;
    }
  }

  static getLocaleIndex(locale: string): number {
    switch (locale) {
      case "de":
        return 0;
      case "en":
        return 1;
      case "fr":
        return 2;
      case "es":
        return 3;
      default:
        return 0;
    }
  }

  static getCompleteLocale(locale: string): string {
    switch (locale) {
      case "de":
        return "de-DE";
      case "en":
        return "en-US";
      case "es":
        return "es-ES";
      case "fr":
        return "fr-FR";
      default:
        return locale;
    }
  }

  static daysToMinutes(days: number): number {
    return hoursToMinutes(days) * DateFns.HOURS_IN_DAY;
  }

  static daysBetweenDates(date1: Date, date2: Date): number {
    return Math.abs(differenceInCalendarDays(date1, date2));
    // return differenceInDays(date1, date2);
  }

  /**
   * Uhrzeit als String formatieren
   * @param date Datum
   * @returns Formatierte Uhrzeit
   */
  static formatDateAsTimeString(date: Date, locale: string): string {
    return format(date, locale === "en" ? "h:mm a" : "H:mm", { locale: this.getLocale(locale) });
  }

  static formatTimeAsTimeString(time: Time, locale: string): string {
    const date = new Date();
    date.setHours(time.hours, time.minutes, 0, 0);
    return format(date, locale === "en" ? "h:mm a" : "H:mm", { locale: this.getLocale(locale) });
  }

  static roundDateTimeToMinutes(date: Date, minutes: number) {
    const miliseconds = minutesToMilliseconds(minutes);
    return new Date(Math.round(date.getTime() / miliseconds) * miliseconds);
  }

  /**
   * Minuten zu Datum addieren
   * @param date Datum
   * @param minutes Minuten die addiert werden sollen
   * @returns Datum mit addierten Minuten
   */
  static addMinutesToDate(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  /**
   * Auf aktuelle Uhrzeit Minuten addieren
   * @param minutes Minuten
   * @returns Datum mit addierten Minuten
   */
  static addMinutesToCurrentDate(minutes: number): Date {
    return addMinutes(new Date(), minutes);
  }

  static addDaysToDate(date: Date, days: number): Date {
    return addDays(date, days);
  }

  static addMonthsToDate(date: Date, months: number): Date {
    return addMonths(date, months);
  }

  static addYearsToDate(date: Date, years: number): Date {
    return addYears(date, years);
  }

  static getStartDateOfWeek(date: Date): Date {
    return startOfWeek(date, { weekStartsOn: 1 });
  }

  static getEndDateOfWeek(date: Date): Date {
    return endOfWeek(date, { weekStartsOn: 1 });
  }

  static getStartDateOfMonth(date: Date): Date {
    return startOfMonth(date);
  }

  static getEndDateOfMonth(date: Date): Date {
    return endOfMonth(date);
  }

  static lastDayOfMonth(date: Date): Date {
    return lastDayOfMonth(date);
  }

  static isThisYear(year: number): boolean {
    return year === new Date().getFullYear();
  }

  static isLastYear(year: number): boolean {
    return year === new Date().getFullYear() - 1;
  }

  static isFutureYear(year: number): boolean {
    return year > new Date().getFullYear();
  }

  static isThisOrLastYear(year: number): boolean {
    return this.isThisYear(year) || this.isLastYear(year);
  }

  static isBeforeLastYear(year: number): boolean {
    return year < new Date().getFullYear() - 1;
  }

  static getTodayMorning(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  static getTomorrowMorning(): Date {
    const tomorrow = DateFns.addDaysToDate(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  static getDayAfterTomorrowMorning(): Date {
    const tomorrow = DateFns.addDaysToDate(new Date(), 2);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Datum aus String parsen
   * @param dateString Datum als String
   * @param formatString Format des Datums
   * @param baseDate Datum für die Orientierung
   * @returns
   */
  static getDateFromString(
    dateString: string,
    formatString: string,
    baseDate: Date = new Date()
  ): Date | null {
    const date = parse(dateString, formatString, baseDate);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  /**
   *
   * @param time z.B.: _05:03 AM_, _23:55_
   * @returns
   */
  static getHoursAndMinutesOfTimeString(time: string) {
    const match = time.match(/(\d?\d):(\d\d) (AM|PM)/);
    if (match) {
      let hours = +match[1];
      const minutes = +match[2];
      hours += match[3] === "PM" ? 12 : 0;
      hours = hours === 24 || hours === 12 ? 0 : hours;
      return { hours, minutes };
    } else {
      const hours = +time.split(":")[0];
      const minutes = +time.split(":")[1];

      return { hours, minutes };
    }
  }

  // static getTimeStringForPicker(time: string, locale: string) {
  //   const hours = +time.split(":")[0];
  //   const minutes = +time.split(":")[1];

  //   const newHours = locale === "en" && hours >= 12 ? hours - 12 : hours;

  //   const period = locale === "en" ? (hours >= 12 ? "PM" : "AM") : "";

  //   const str = `${newHours.toString().padStart(2, "0")}:${minutes
  //     .toString()
  //     .padStart(2, "0")} ${period}`;
  //   return str;
  // }

  static setTimeStringToDate(date: Date, time: string) {
    const { hours, minutes } = this.getHoursAndMinutesOfTimeString(time);
    date = setHours(date, hours);
    date = setMinutes(date, minutes);
    date = setSeconds(date, 0);
    return date;
  }

  static setTimeRangeToDate(date: Date, hours: number, minutes: number) {
    date = setHours(date, hours);
    date = setMinutes(date, minutes);
    date = setSeconds(date, 0);
    return date;
  }

  static getTimeFromTimeString(timeString: string): Time {
    const date = DateFns.setTimeStringToDate(new Date(), timeString);
    return { hours: date.getHours(), minutes: date.getMinutes() };
  }

  static isSameDate(date: Date, otherDate: Date): boolean {
    return isSameDay(date, otherDate);
  }

  static isBefore(date: Date, dateBefore: Date): boolean {
    return isBefore(date, dateBefore);
  }

  static isAfter(date: Date, dateAfter: Date): boolean {
    return isAfter(date, dateAfter);
  }

  static isAfterCurrent(date: Date): boolean {
    return isAfter(date, new Date());
  }

  static isAfterToday(date: Date): boolean {
    return isAfter(date, new Date()) && !isToday(date);
  }

  static isAfterOrToday(date: Date): boolean {
    return isAfter(date, new Date()) || isToday(date);
  }

  static isYesterday(date: Date): boolean {
    return isYesterday(date);
  }

  static isDayBeforeYesterday(date: Date): boolean {
    return this.isSameDate(this.addDaysToDate(new Date(), -2), date);
  }

  static isToday(date: Date): boolean {
    return isToday(date);
  }

  static isTomorrow(date: Date): boolean {
    return isTomorrow(date);
  }

  static isDayAfterTomorrow(date: Date): boolean {
    return this.isSameDate(this.addDaysToDate(new Date(), 2), date);
  }

  static isBeforeToday(date: Date): boolean {
    return isBefore(date, new Date()) && !isToday(date);
  }

  static isBeforeOrToday(date: Date): boolean {
    return isBefore(date, new Date()) || isToday(date);
  }

  static isBeforeOrSameDate(date: Date, dateBefore: Date): boolean {
    return isBefore(date, dateBefore) || this.isSameDate(date, dateBefore);
  }

  static isLastDay(date: Date): boolean {
    return isSameDay(date, this.lastDate);
  }

  static isFirstDay(date: Date): boolean {
    return isSameDay(date, this.firstDate);
  }

  static isDateBetweenDates(date: Date, dateBefore: Date, dateAfter: Date): boolean {
    const d = new Date(date).setHours(0, 0, 0, 0);
    const before = new Date(dateBefore).setHours(0, 0, 0, 0);
    const after = new Date(dateAfter).setHours(23, 59, 59, 0);
    return isWithinInterval(d, { start: before, end: after });
  }

  static isDateTimeBetweenDates(date: Date, dateBefore: Date, dateAfter: Date): boolean {
    return isWithinInterval(date, { start: dateBefore, end: dateAfter });
  }

  static roundToNextMinutes(date: Date, roundToMinutes: number): Date {
    return new Date(roundToNextNumber(date.getTime(), minutesToMilliseconds(roundToMinutes)));
  }

  /**
   * @param date1 Späteres Datum
   * @param date2 Früheres Datum
   */
  static getDurationBetweenDatesInMinutes(date1: Date, date2: Date): number {
    return differenceInMinutes(date1, date2);
  }

  static formatDateShort(date: Date, locale: string): string {
    return format(date, "d.M.yy", { locale: this.getLocale(locale) });
  }

  static formatDateExtraShort(date: Date, locale: string): string {
    return format(date, "d.M.", { locale: this.getLocale(locale) });
  }

  static formatDateExtraShortWithShortDay(date: Date, locale: string): string {
    return format(date, "EEE, d.M.", { locale: this.getLocale(locale) });
  }

  static formatDateByFormatString(date: Date, formatString: string): string {
    return format(date, formatString);
  }

  static formatDate(
    date: Date | null,
    locale: string,
    translateService: TranslateService,
    optionals?: { onlyDate?: boolean; onlyDateDetail?: boolean; strict?: boolean }
  ) {
    const { onlyDate, onlyDateDetail, strict } = optionals ?? {};

    if (!date || isNaN(+date)) return "";

    const dateCopy = new Date(date);

    if (onlyDate && DateFns.isToday(dateCopy)) return translateService.instant("DATE.TODAY");
    if (onlyDate && onlyDateDetail && DateFns.isDayBeforeYesterday(dateCopy))
      return translateService.instant("DATE.BEFORE_YESTERDAY");
    if (onlyDate && DateFns.isYesterday(dateCopy))
      return translateService.instant("DATE.YESTERDAY");
    if (onlyDate && DateFns.isTomorrow(dateCopy)) return translateService.instant("DATE.TOMORROW");
    if (onlyDate && onlyDateDetail && DateFns.isDayAfterTomorrow(dateCopy))
      return translateService.instant("DATE.AFTER_TOMORROW");

    // Sorgt dafür, dass Datumsangaben mit Uhrzet 0:00 richtig gezählt werden
    if (onlyDate) dateCopy.setHours(new Date().getHours(), new Date().getMinutes());
    return DateFns.getDurationFromDateToToday(dateCopy, locale, strict);
  }

  static sameDate(date: Date, sameDate: Date): boolean {
    return isSameDay(date, sameDate);
  }

  static getDateOfStringWithFormatting(text: string, format: string): Date | null {
    return DateFns.getDateFromString(text, format, new Date());
  }

  static getDateOfString(text: string, translateService: TranslateService): Date | null {
    let date =
      DateFns.getDateFromString(text, "d.M.yy", new Date()) ??
      DateFns.getDateFromString(text, "d.M.yyyy", new Date()) ??
      DateFns.getDateFromString(text, "d.M.", new Date());

    if (
      !date &&
      translateService.instant("DATE.BEFORE_YESTERDAY").toLowerCase() === text.toLowerCase()
    ) {
      date = DateFns.addDaysToDate(new Date(), -2);
    } else if (
      !date &&
      translateService.instant("DATE.YESTERDAY").toLowerCase() === text.toLowerCase()
    ) {
      date = DateFns.addDaysToDate(new Date(), -1);
    } else if (
      !date &&
      translateService.instant("DATE.TODAY").toLowerCase() === text.toLowerCase()
    ) {
      date = new Date();
    } else if (
      !date &&
      translateService.instant("DATE.TOMORROW").toLowerCase() === text.toLowerCase()
    ) {
      date = DateFns.addDaysToDate(new Date(), 1);
    } else if (
      !date &&
      translateService.instant("DATE.AFTER_TOMORROW").toLowerCase() === text.toLowerCase()
    ) {
      date = DateFns.addDaysToDate(new Date(), 2);
    }

    return date;
  }

  static findDatesInString(text: string): Date[] {
    const monthsGer = [
      "jan",
      "feb",
      "mär",
      "apr",
      "mai",
      "jun",
      "jul",
      "aug",
      "sep",
      "okt",
      "nov",
      "dez",
    ];
    const monthsEng = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const regexGer = new RegExp(
      `([0-9]{1,2})\\.? (${monthsGer.join("|")})\\.? ?((?:\\d\\d)?\\d\\d|)?`,
      "gi"
    );
    const regexEng = new RegExp(
      `(${monthsEng.join("|")}) ?([0-3][0-9]|[0-9])\\,? ?((?:\\d\\d)?\\d\\d|)?`,
      "gi"
    );

    const currentDate = new Date();
    const datesList: Date[] = [];

    function processMatch(day: number, month: number, year: number): void {
      const date = new Date(
        year || currentDate.getFullYear() + (month < currentDate.getMonth() - 2 ? 1 : 0),
        month - 1,
        day
      );
      if (
        !datesList.some((existingDate) => existingDate.getTime() === date.getTime()) &&
        !isNaN(date.getTime())
      ) {
        datesList.push(date);
      }
    }

    let match;
    while ((match = regexGer.exec(text.toLowerCase())) !== null) {
      processMatch(
        parseInt(match[1]),
        monthsGer.indexOf(match[2].toLowerCase()) + 1,
        parseInt(match[3])
      );
    }

    while ((match = regexEng.exec(text.toLowerCase())) !== null) {
      processMatch(
        parseInt(match[2]),
        monthsEng.indexOf(match[1].toLowerCase()) + 1,
        parseInt(match[3])
      );
    }

    const matchesGermanDates = [...text.matchAll(/\d\d\.\d\d\.\d\d(?:\d\d)?/gi)];
    matchesGermanDates.forEach((match) => {
      let date = DateFns.getDateOfStringWithFormatting(match[0], "dd.MM.yyyy");
      if (date) datesList.push(date);
      date = DateFns.getDateOfStringWithFormatting(match[0], "dd.MM.yy");
      if (date) datesList.push(date);
    });

    const matchesEnglishDates = [...text.matchAll(/\d\d\/\d\d\/\d\d(?:\d\d)?/gi)];
    matchesEnglishDates.forEach((match) => {
      let date = DateFns.getDateOfStringWithFormatting(match[0], "MM/dd/yyyy");
      if (date) datesList.push(date);
      date = DateFns.getDateOfStringWithFormatting(match[0], "MM/dd/yy");
      if (date) datesList.push(date);
    });

    return datesList;
  }

  static getDurationRangeOfString(text: string): DurationRange | undefined {
    let duration: DurationRange = { min: 0, max: 0 };

    // Tage
    const matchDays = text.match(
      /(\d+)(?: ?- ?(\d+))? ?(?:tage?|t(?:$| )|tg\.|days?|día|dia|d(?:$| )|jours?|j(?:$| ))\.?/i
    );
    if (matchDays) {
      if (matchDays[1]) {
        const minDays = parseInt(matchDays[1]);
        duration.min = this.daysToMinutes(minDays);
        if (matchDays[2]) {
          const maxDays = parseInt(matchDays[2]);
          duration.max = this.daysToMinutes(maxDays);
        }
      }
    }

    // Stunden
    const matchHours = text.match(
      /(\d+)(?: ?- ?(\d+))? ?(?:std|hrs|hours?|heures?|horas?|hr?(?:$| )|stunden)\.?/i
    );
    if (matchHours) {
      if (matchHours[1]) {
        const minHours = parseInt(matchHours[1]);
        duration.min = (duration.min ?? 0) + hoursToMinutes(minHours);
        if (matchHours[2]) {
          const maxHours = parseInt(matchHours[2]);
          duration.max = (duration.max ?? 0) + hoursToMinutes(maxHours);
        }
      }
    }

    // Minuten
    // Regex: "m(?:$| )" = Entweder "m" am Ende oder danach ein Leerzeichen
    const matchMinutes = text.match(/(\d+)(?: ?- ?(\d+))? ?(m(?:$| )|min|minute|minutes)\.?/i);
    if (matchMinutes) {
      if (matchMinutes[1]) {
        const minMinutes = parseInt(matchMinutes[1]);
        duration.min = (duration.min ?? 0) + minMinutes;
        if (matchMinutes[2]) {
          const maxMinutes = parseInt(matchMinutes[2]);
          duration.max = (duration.max ?? 0) + maxMinutes;
        }
      }
    }

    // replace min or max with null if 0
    if (duration.min === 0) {
      duration.min = undefined;
    }
    if (duration.max === 0) {
      duration.max = undefined;
    }

    return !duration.min && !duration.max ? undefined : duration;
  }

  static formatDurationRange(timeRange: DurationRange, locale: string, long?: boolean): string {
    const min = this.minutesToHoursAndMinutes(timeRange.min ?? 0);
    const max = this.minutesToHoursAndMinutes(timeRange.max ?? 0);

    const minUnit = this.getMinutesUnit(locale, long);
    const hourUnit = this.getHoursUnit(locale, long);
    const dayUnit = this.getDaysUnit(locale, long);

    if (min.days === 0 && max.days === 0) {
      if (min.hours === 0 && min.minutes === 0 && max.hours === 0 && max.minutes === 0) {
        return "";
      }
      // 30-40 Min.
      if (min.hours === 0 && max.hours === 0 && min.minutes > 0 && max.minutes > 0) {
        return `${min.minutes}-${max.minutes} ${minUnit}`;
      }
      // 1-2 Std.
      if (min.minutes === 0 && max.minutes === 0 && min.hours > 0 && max.hours > 0) {
        return `${min.hours}-${max.hours} ${hourUnit}`;
      }
    }

    // 1-2 Tage
    if (
      min.days > 0 &&
      max.days > 0 &&
      min.hours === 0 &&
      max.hours === 0 &&
      min.minutes === 0 &&
      max.minutes === 0
    ) {
      return `${min.days}-${max.days} ${dayUnit}`;
    }
    // 1 Tag
    else if (
      min.days > 0 &&
      min.hours === 0 &&
      max.hours === 0 &&
      min.minutes === 0 &&
      max.minutes === 0
    ) {
      return `${min.days} ${dayUnit}`;
    }

    let str = "";
    if (min.days > 0) {
      str += `${min.days} ${dayUnit}`;
    }
    if (min.hours > 0) {
      str += ` ${min.hours} ${hourUnit}`;
    }
    if (min.minutes > 0) {
      str += ` ${min.minutes} ${minUnit}`;
    }

    if (max.days > 0 || max.hours > 0 || max.minutes > 0) {
      str += " - ";
    }

    if (max.days > 0) {
      str += ` ${max.days} ${dayUnit}`;
    }
    if (max.hours > 0) {
      str += ` ${max.hours} ${hourUnit}`;
    }
    if (max.minutes > 0) {
      str += ` ${max.minutes} ${minUnit}`;
    }
    return str.trim();
  }

  private static minutesToHoursAndMinutes(totalMinutes: number): {
    days: number;
    hours: number;
    minutes: number;
  } {
    // get days hours and minutes from minutes with readonly members from above
    const days = Math.floor(totalMinutes / this.MINUTES_IN_DAY);
    const hours = Math.floor((totalMinutes - days * this.MINUTES_IN_DAY) / this.MINUTES_IN_HOUR);
    const minutes = totalMinutes - days * this.MINUTES_IN_DAY - hours * this.MINUTES_IN_HOUR;

    return { days, hours, minutes };
  }

  static formatDuration(totalMinutes: number, long: boolean, locale: string): string {
    const daysTexts = long ? this.longDays : this.shortDays;
    const hoursTexts = long ? this.longHours : this.shortHours;
    const minutesTexts = long ? this.longMinutes : this.shortMinutes;

    const { days, hours, minutes } = this.minutesToHoursAndMinutes(totalMinutes);

    const daysString = days ? `${days} ${daysTexts[DateFns.getLocaleIndex(locale)]}` : "";
    const hoursString = hours ? `${hours} ${hoursTexts[DateFns.getLocaleIndex(locale)]}` : "";
    const minutesString = minutes
      ? `${minutes} ${minutesTexts[DateFns.getLocaleIndex(locale)]}`
      : "";

    return cleanString(`${daysString} ${hoursString} ${minutesString}`);
  }

  private static getMinutesUnit(locale: string, long?: boolean) {
    return long
      ? DateFns.longMinutes[this.getLocaleIndex(locale)]
      : DateFns.shortMinutes[this.getLocaleIndex(locale)];
  }

  private static getHoursUnit(locale: string, long?: boolean) {
    return long
      ? DateFns.longHours[this.getLocaleIndex(locale)]
      : DateFns.shortHours[this.getLocaleIndex(locale)];
  }

  private static getDaysUnit(locale: string, long?: boolean) {
    return long
      ? DateFns.longDays[this.getLocaleIndex(locale)]
      : DateFns.shortDays[this.getLocaleIndex(locale)];
  }

  private static getTimeString(locale: string) {
    return DateFns.timeString[this.getLocaleIndex(locale)];
  }

  /**
   * @param locale Aktuelle Sprache
   * @returns z.B.: _" Uhr"_, _" heures"_, ...
   */
  static getTimeStringToAppend(locale: string) {
    const timeString = DateFns.getTimeString(locale);
    return timeString ? ` ${timeString}` : "";
  }

  static getHourFormat(locale: string) {
    return DateFns.hourFormat[this.getLocaleIndex(locale)];
  }

  /**
   * @param date Datum
   * @param locale Aktuelle Sprache
   * @param suffix `"vor"` wenn Datum vor Heute liegt
   * oder `"in"` wenn Datum nach Heute liegt
   * @param firstCharTitleCase Erster Buchstabe wird großgeschrieben
   * @returns z.B.: _"Vor 3 Tagen"_, _"In 2 Monaten"_
   */
  static getDurationFromDateToToday(
    date: Date,
    locale: string,
    strict: boolean = false,
    suffix: boolean = true,
    firstCharTitleCase: boolean = true
  ) {
    if (strict) {
      const text = formatDistanceToNowStrict(date, {
        locale: this.getLocale(locale),
        addSuffix: suffix,
      });
      if (firstCharTitleCase) return firstCharToTitleCase(text);
      return text;
    } else {
      const text = formatDistanceToNow(date, { locale: this.getLocale(locale), addSuffix: suffix });
      if (firstCharTitleCase) return firstCharToTitleCase(text);
      return text;
    }
  }

  static isValid(date: Date) {
    return isValid(date);
  }

  static getWeekdayNameByDayIndex(day: number, locale: string, long: boolean = false): string {
    let date = new Date();
    switch (day) {
      case 0:
        date = new Date(2023, 8, 17);
        break;
      case 7:
        date = new Date(2023, 8, 17);
        break;
      case 1:
        date = new Date(2023, 8, 11);
        break;
      case 2:
        date = new Date(2023, 8, 12);
        break;
      case 3:
        date = new Date(2023, 8, 13);
        break;
      case 4:
        date = new Date(2023, 8, 14);
        break;
      case 5:
        date = new Date(2023, 8, 15);
        break;
      case 6:
        date = new Date(2023, 8, 16);
        break;
    }

    return format(date, long ? "EEEE" : "EEE", { locale: this.getLocale(locale) });
  }

  static rearrangeWeekdayIndexesWithLocale(dayIndexes: number[], locale: string) {
    return dayIndexes.map((value) => (locale !== "en" && value === 0 ? 7 : value));
  }

  /**
   * @deprecated
   * Wochentage werden zusammengefasst
   * z.B.: "Mo-Fr" oder "Mo-Di"
   * @param dayIndexes 0 = Sonntag, 1 = Montag, ...
   * @param locale "de", "en", ...
   * @returns Zusammengefasste Tage als Liste: ["Mo-Fr", "So"]
   */
  static formatWeekdayRangesToStringList(dayIndexes: number[], locale: string): string[] {
    dayIndexes.sort((a, b) => a - b);

    const ranges = [];
    let startRange = dayIndexes[0];
    for (let i = 1; i < dayIndexes.length; i++) {
      if (dayIndexes[i] !== dayIndexes[i - 1] + 1) {
        if (startRange === dayIndexes[i - 1]) {
          ranges.push(DateFns.getWeekdayNameByDayIndex(startRange, locale));
        } else {
          ranges.push(
            `${DateFns.getWeekdayNameByDayIndex(
              startRange,
              locale
            )}-${DateFns.getWeekdayNameByDayIndex(dayIndexes[i - 1], locale)}`
          );
        }
        startRange = dayIndexes[i];
      }
    }

    if (startRange === dayIndexes[dayIndexes.length - 1]) {
      ranges.push(DateFns.getWeekdayNameByDayIndex(startRange, locale));
    } else {
      ranges.push(
        `${DateFns.getWeekdayNameByDayIndex(startRange, locale)}-${DateFns.getWeekdayNameByDayIndex(
          dayIndexes[dayIndexes.length - 1],
          locale
        )}`
      );
    }

    return ranges;
  }

  /**
   * Wochentage werden zusammengefasst
   * z.B.: "Mo-Fr", nicht aber "Mo-Di"
   * @param dayIndexes 0 = Sonntag, 1 = Montag, ...
   * @param locale "de", "en", ...
   * @returns Zusammengefasste Tage als Liste: ["Mo-Fr", "So"]
   */
  static formatWeekdayRanges(dayIndexes: number[], locale: string): string[] {
    dayIndexes.sort((a, b) => a - b);
    const ranges = [];
    let startRange = dayIndexes[0];
    let endRange = dayIndexes[0];

    for (let i = 1; i < dayIndexes.length; i++) {
      if (dayIndexes[i] === dayIndexes[i - 1] + 1) {
        endRange = dayIndexes[i];
      } else {
        if (startRange === endRange) {
          ranges.push(DateFns.getWeekdayNameByDayIndex(startRange, locale));
        } else {
          if (endRange - startRange === 1) {
            ranges.push(DateFns.getWeekdayNameByDayIndex(startRange, locale));
            ranges.push(DateFns.getWeekdayNameByDayIndex(endRange, locale));
          } else {
            ranges.push(
              `${DateFns.getWeekdayNameByDayIndex(
                startRange,
                locale
              )}-${DateFns.getWeekdayNameByDayIndex(endRange, locale)}`
            );
          }
        }
        startRange = endRange = dayIndexes[i];
      }
    }

    if (startRange === endRange) {
      ranges.push(DateFns.getWeekdayNameByDayIndex(startRange, locale));
    } else {
      if (endRange - startRange === 1) {
        ranges.push(DateFns.getWeekdayNameByDayIndex(startRange, locale));
        ranges.push(DateFns.getWeekdayNameByDayIndex(endRange, locale));
      } else {
        ranges.push(
          `${DateFns.getWeekdayNameByDayIndex(
            startRange,
            locale
          )}-${DateFns.getWeekdayNameByDayIndex(endRange, locale)}`
        );
      }
    }

    return ranges;
  }

  static formatWeekdayRangesAsString(
    dayIndices: number[],
    locale: string,
    andText: string
  ): string {
    return joinTextWithComma(
      DateFns.formatWeekdayRanges(
        DateFns.rearrangeWeekdayIndexesWithLocale(dayIndices, locale),
        locale
      ),
      andText
    );
  }

  static getClosestDateInCurrentWeek(
    currentDate: Date,
    weekdayIndex: number,
    locale: string
  ): Date {
    const changeSunday = locale !== "en";
    const currentWeekday = currentDate.getDay() === 0 && changeSunday ? 7 : currentDate.getDay();
    weekdayIndex = weekdayIndex === 0 && changeSunday ? 7 : weekdayIndex;

    if (currentWeekday > weekdayIndex) {
      const daysUntilSelectedWeekday = (currentWeekday + 7 - weekdayIndex) % 7;

      const closestDate = new Date(currentDate);
      closestDate.setDate(currentDate.getDate() - daysUntilSelectedWeekday);

      return closestDate;
    }

    const daysUntilSelectedWeekday = (weekdayIndex + 7 - currentWeekday) % 7;

    const closestDate = new Date(currentDate);
    closestDate.setDate(currentDate.getDate() + daysUntilSelectedWeekday);

    return closestDate;
  }

  static hoursToMinutes(hours: number): number {
    return hoursToMinutes(hours);
  }
}
