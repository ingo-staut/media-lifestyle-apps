import { DropdownData } from "shared/models/dropdown.type";
import { ResultListLayout } from "../models/enum/result-list-layout.enum";

export const LAYOUT_TOGGLE: DropdownData<ResultListLayout, string>[] = [
  {
    key: ResultListLayout.GRID,
    name: "LAYOUT.GRID",
    tooltip: "LAYOUT.GRID_DESCRIPTION",
    icon: "grid",
  },
  {
    key: ResultListLayout.LIST,
    name: "LAYOUT.LIST",
    tooltip: "LAYOUT.LIST_DESCRIPTION",
    icon: "list",
  },
];
