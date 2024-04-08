import { Pipe, PipeTransform } from "@angular/core";
import { DropdownData } from "shared/models/dropdown.type";
import { DateFns } from "shared/utils/date-fns";
import {
  MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL,
  findUseUntilCategoryByKey,
} from "../app/data/menu-available-ingredients.data";
import { MenuAvailableIngredientsDateUntil } from "../app/models/enum/menu-available-ingredients-date-until.enum";

@Pipe({
  name: "inDays",
})
export class InDaysPipe implements PipeTransform {
  transform(date: Date, days: number): boolean {
    const daysBetween = DateFns.daysBetweenDates(new Date(), date);
    return daysBetween <= days;
  }
}

@Pipe({
  name: "beforeTodayOrToday",
})
export class BeforeTodayOrTodayPipe implements PipeTransform {
  transform(date: Date): boolean {
    return DateFns.isBeforeOrToday(date);
  }
}

@Pipe({
  name: "predefinedDateRangeItem",
})
export class PredefinedDateRangeItemPipe implements PipeTransform {
  transform(date: Date): DropdownData<string, undefined> {
    return findItems(date)[0];
  }
}

export function findItems(date: Date) {
  const in3Days = DateFns.addDaysToDate(new Date(), 3);
  const in7Days = DateFns.addDaysToDate(new Date(), 7);
  const in1Month = DateFns.addMonthsToDate(new Date(), 1);

  const defaultValue = MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL[0];

  let list = [];

  if (DateFns.isBeforeToday(date)) {
    const value = findUseUntilCategoryByKey(MenuAvailableIngredientsDateUntil.MISSED);
    if (value) list.push(value);
  }
  if (DateFns.isDateBetweenDates(date, new Date(), in3Days)) {
    const value = findUseUntilCategoryByKey(MenuAvailableIngredientsDateUntil.NEXT_3_DAYS);
    if (value) list.push(value);
  }
  if (DateFns.isDateBetweenDates(date, new Date(), in7Days)) {
    const value = findUseUntilCategoryByKey(MenuAvailableIngredientsDateUntil.NEXT_7_DAYS);
    if (value) list.push(value);
  }
  if (DateFns.isDateBetweenDates(date, new Date(), in1Month)) {
    const value = findUseUntilCategoryByKey(MenuAvailableIngredientsDateUntil.NEXT_31_DAYS);
    if (value) list.push(value);
  }
  if (DateFns.isAfter(date, in1Month)) {
    const value = findUseUntilCategoryByKey(MenuAvailableIngredientsDateUntil.FUTURE);
    if (value) list.push(value);
  }

  // Mit Datum
  list.push(MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL[1]);

  return list.length > 1 ? list : [defaultValue];
}

export function findUseUntilCategory(date: Date | null) {
  if (!date) return MenuAvailableIngredientsDateUntil.USE_UNTIL;

  const in3Days = DateFns.addDaysToDate(new Date(), 3);
  const in7Days = DateFns.addDaysToDate(new Date(), 7);
  const in1Month = DateFns.addMonthsToDate(new Date(), 1);

  if (DateFns.isBeforeToday(date)) {
    return MenuAvailableIngredientsDateUntil.MISSED;
  }
  if (DateFns.isDateBetweenDates(date, new Date(), in3Days)) {
    return MenuAvailableIngredientsDateUntil.NEXT_3_DAYS;
  }
  if (DateFns.isDateBetweenDates(date, new Date(), in7Days)) {
    return MenuAvailableIngredientsDateUntil.NEXT_7_DAYS;
  }
  if (DateFns.isDateBetweenDates(date, new Date(), in1Month)) {
    return MenuAvailableIngredientsDateUntil.NEXT_31_DAYS;
  }
  if (DateFns.isAfter(date, in1Month)) {
    return MenuAvailableIngredientsDateUntil.FUTURE;
  }

  return MenuAvailableIngredientsDateUntil.WITH;
}
