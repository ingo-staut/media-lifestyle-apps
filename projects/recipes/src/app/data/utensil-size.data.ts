import { DropdownData } from "shared/models/dropdown.type";
import { Entry } from "shared/models/type-entry.type";
import { getAllSearchTerms } from "../../utils/translation";
import { UtensilSize } from "../models/enum/utensil-size.enum";

export const UTENSIL_SIZES: Record<UtensilSize, Entry<UtensilSize>> = {
  NONE: {
    type: UtensilSize.NONE,
    name: "SIZE.NONE",
    icon: "size-none",
  },
  SMALL: {
    type: UtensilSize.SMALL,
    name: "SIZE.SMALL",
    icon: "size-small",
  },
  MEDIUM: {
    type: UtensilSize.MEDIUM,
    name: "SIZE.MEDIUM",
    icon: "size-medium",
  },
  BIG: {
    type: UtensilSize.BIG,
    name: "SIZE.BIG",
    icon: "size-big",
  },
};

export const UTENSIL_SIZE_DROPDOWN_DATA = Object.values(UTENSIL_SIZES).map((value) => {
  const { type, name, icon } = value;

  const entry: DropdownData<string, string> = {
    key: type!.toString(),
    name,
    icon,
    value: type!.toString(),
  };

  return entry;
});

export function findUtensilSize(value: string) {
  const small = getAllSearchTerms("SIZE.SMALL").some(
    (term) => term.toLowerCase() === value.toLowerCase()
  );
  const medium = getAllSearchTerms("SIZE.MEDIUM").some(
    (term) => term.toLowerCase() === value.toLowerCase()
  );
  const big = getAllSearchTerms("SIZE.BIG").some(
    (term) => term.toLowerCase() === value.toLowerCase()
  );

  if (small) return UtensilSize.SMALL;
  else if (medium) return UtensilSize.MEDIUM;
  else if (big) return UtensilSize.BIG;
  else return UtensilSize.NONE;
}
