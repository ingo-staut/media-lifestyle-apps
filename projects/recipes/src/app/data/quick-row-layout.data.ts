import { DropdownData } from "shared/models/dropdown.type";
import { QuickRowLayoutType } from "../models/enum/quick-row-layout.enum";

export const QUICK_ROW_DATA: DropdownData<QuickRowLayoutType, string>[] = [
  {
    key: QuickRowLayoutType.WITH_ROW,
    name: "QUICK_ACCESS.WITH",
    icon: "quick-row-with",
  },
  {
    key: QuickRowLayoutType.WITHOUT_ROW,
    name: "QUICK_ACCESS.WITHOUT",
    icon: "quick-row-without",
  },
];
