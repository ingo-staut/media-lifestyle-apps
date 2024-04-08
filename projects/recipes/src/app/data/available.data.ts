import { DropdownData } from "shared/models/dropdown.type";
import { Available } from "../models/available.type";
import { AvailableType } from "../models/enum/available.enum";

export const AVAILABLE_STATUS: Record<AvailableType, Available> = {
  AVAILABLE: {
    type: AvailableType.AVAILABLE,
    text: "AVAILABLE.",
    icon: "available-full",
  },
  AVAILABLE_HALF: {
    type: AvailableType.AVAILABLE_HALF,
    text: "AVAILABLE.HALF",
    icon: "available-empty",
  },
  AVAILABLE_NOT: {
    type: AvailableType.AVAILABLE_NOT,
    text: "AVAILABLE.NOT",
    icon: "available-add-to",
  },
  AVAILABLE_UNDEFINED: {
    type: AvailableType.AVAILABLE_UNDEFINED,
    text: "AVAILABLE.UNDEFINED",
    icon: "available-undefined",
  },
};

export const AVAILABLE_DROPDOWN_DATA: DropdownData<string, undefined>[] = [
  {
    key: "all",
    name: "AVAILABLE.",
    icon: "available",
  },
  {
    key: AvailableType.AVAILABLE_NOT,
    name: "AVAILABLE.NOT",
    icon: "available-not",
    color: "warn",
  },
  {
    key: AvailableType.AVAILABLE_HALF,
    name: "AVAILABLE.HALF",
    icon: "available-half",
  },
  {
    key: AvailableType.AVAILABLE,
    name: "AVAILABLE.",
    icon: "available-full",
  },
  {
    key: AvailableType.AVAILABLE_UNDEFINED,
    name: "AVAILABLE.UNDEFINED",
    icon: "available-undefined",
  },
];

export function showIngredientFilterByAvailable(available: number, filterKey: string) {
  switch (filterKey) {
    case "all":
      return true;
    case AvailableType.AVAILABLE_NOT:
      return available === 0;
    case AvailableType.AVAILABLE_HALF:
      // Es werden nicht die komplett vorhandenen Zutaten angezeigt
      return available > 0 && available < 1;
    case AvailableType.AVAILABLE:
      return available >= 1;
    case AvailableType.AVAILABLE_UNDEFINED:
      return available < 0;

    default:
      return false;
  }
}
