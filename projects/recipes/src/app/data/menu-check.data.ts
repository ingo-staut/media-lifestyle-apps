import { MenuItem } from "../../../../../shared/models/menu-item.type";

export const MENU_CHECK_ITEMS: MenuItem<string & { favorite?: boolean }>[] = [
  {
    text: "CHECK.ALL",
    value: "check-all",
    icon: "check-checked",
  },
  {
    text: "CHECK.NONE",
    value: "check-none",
    icon: "check-unchecked",
  },
  {
    text: "CHECK.INVERT",
    value: "check-invert",
    icon: "replace",
  },
];
