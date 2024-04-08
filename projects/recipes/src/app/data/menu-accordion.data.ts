import { MenuDialogData } from "../bottom-sheets/menu-bottom-sheet/menu-bottom-sheet.component";

export const MENU_ACCORDION: MenuDialogData<boolean> = {
  actions: [
    {
      value: false,
      text: "COLLAPSE_ALL",
      icon: "arrow-multiple-up",
    },
    {
      value: true,
      text: "EXPAND_ALL",
      icon: "arrow-multiple-down",
    },
  ],
};
