import { DropdownData } from "shared/models/dropdown.type";
import { MenuAvailableIngredientsDateUntil } from "../models/enum/menu-available-ingredients-date-until.enum";

export const MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL: DropdownData<
  MenuAvailableIngredientsDateUntil,
  undefined
>[] = [
  {
    name: "DATE.USE_UNTIL.",
    key: MenuAvailableIngredientsDateUntil.USE_UNTIL,
    icon: "calendar-until",
  },
  {
    name: "DATE.WITH",
    key: MenuAvailableIngredientsDateUntil.WITH,
    icon: "calendar-until",
  },
  {
    name: "DATE.MISSED",
    key: MenuAvailableIngredientsDateUntil.MISSED,
    icon: "calendar-missed",
    color: "warn",
  },
  {
    name: "DATE.NEXT_3_DAYS",
    key: MenuAvailableIngredientsDateUntil.NEXT_3_DAYS,
    icon: "calendar-3-days",
    color: "primary",
  },
  {
    name: "DATE.NEXT_7_DAYS",
    key: MenuAvailableIngredientsDateUntil.NEXT_7_DAYS,
    icon: "calendar-week",
    color: "primary",
  },
  {
    name: "DATE.NEXT_31_DAYS",
    key: MenuAvailableIngredientsDateUntil.NEXT_31_DAYS,
    icon: "calendar-month",
    color: "primary",
  },
  {
    name: "DATE.FAR_FUTURE",
    key: MenuAvailableIngredientsDateUntil.FUTURE,
    icon: "calendar-future",
  },
];

export const MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL_SELECTED: DropdownData<
  MenuAvailableIngredientsDateUntil,
  undefined
>[] = [0, 1, 2, 4].map((index) => MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL[index]);

export function findUseUntilCategoryByKey(key: string) {
  return MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL.find((data) => data.key === key);
}
