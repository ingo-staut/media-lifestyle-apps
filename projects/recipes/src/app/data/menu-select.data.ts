import { MenuItem } from "../../../../../shared/models/menu-item.type";

export const MENU_SELECT_ITEMS: MenuItem<string & { favorite?: boolean }>[] = [
  {
    text: "SELECT.ALL",
    value: "select-all",
    icon: "select-all",
  },
  {
    text: "SELECT.DESELECT_ALL",
    value: "select-none",
    icon: "select-none",
  },
  {
    text: "SELECT.INVERT",
    value: "select-invert",
    icon: "replace",
  },
];
