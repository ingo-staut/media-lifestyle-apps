import { Tab, transformTabToDropdown } from "../../../../../shared/models/tab.type";

export const PLANNED_RECIPES_TABS: Tab[] = [
  {
    name: "DATE.MISSED",
    icon: "calendar-missed",
  },
  {
    name: "DATE.TODAY",
    icon: "calendar-today",
  },
  {
    name: "DATE.TOMORROW",
    icon: "calendar-tomorrow",
  },
  {
    name: "DATE.NEXT_7_DAYS",
    icon: "calendar-days",
  },
];

export const PLANNED_RECIPES_DROPDOWN_DATA = transformTabToDropdown(PLANNED_RECIPES_TABS);
