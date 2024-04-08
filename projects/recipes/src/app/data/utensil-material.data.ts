import { DropdownData } from "shared/models/dropdown.type";
import { Entry } from "shared/models/type-entry.type";
import { getAllSearchTerms } from "../../utils/translation";
import { UtensilMaterial } from "../models/enum/utensil-material.enum";

export const UTENSIL_MATERIALS: Record<UtensilMaterial, Entry<UtensilMaterial>> = {
  NONE: {
    type: UtensilMaterial.NONE,
    name: "MATERIAL.NONE",
    icon: "none",
  },
  GLASS: {
    type: UtensilMaterial.GLASS,
    name: "MATERIAL.GLASS",
    icon: "glass",
  },
  SILICONE: {
    type: UtensilMaterial.SILICONE,
    name: "MATERIAL.SILICONE",
    icon: "silicone",
  },
  PLASTIC: {
    type: UtensilMaterial.PLASTIC,
    name: "MATERIAL.PLASTIC", // + Plastik
    icon: "plastic",
  },
  PORCELAIN: {
    type: UtensilMaterial.PORCELAIN,
    name: "MATERIAL.PORCELAIN", // + Keramik
    icon: "porcelain",
  },
  STEEL: {
    type: UtensilMaterial.STEEL,
    name: "MATERIAL.STEEL",
    icon: "steel",
  },
  TEFLON: {
    type: UtensilMaterial.TEFLON,
    name: "MATERIAL.TEFLON", // + beschichtet
    icon: "teflon",
  },
  METAL: {
    type: UtensilMaterial.METAL,
    name: "MATERIAL.METAL",
    icon: "metal",
  },
};

export const UTENSIL_MATERIAL_DROPDOWN_DATA = Object.values(UTENSIL_MATERIALS).map((value) => {
  const { type, name, icon } = value;

  const entry: DropdownData<string, string> = {
    key: type!.toString(),
    name,
    // ! Wenn Icons, hier den Wert setzen !
    icon: "",
    value: type!.toString(),
  };

  return entry;
});

export function findUtensilMaterial(value: string) {
  let material: UtensilMaterial = UtensilMaterial.NONE;

  Object.values(UTENSIL_MATERIALS).forEach((utensilMaterial) => {
    // Erstes Element in der Liste überpringen
    if (utensilMaterial.type === UtensilMaterial.NONE) return;
    // Wenn Material bereits gefunden
    if (material !== UtensilMaterial.NONE) return;

    const found = getAllSearchTerms(utensilMaterial.name).some(
      (term) => term.toLowerCase() === value.toLowerCase()
    );
    if (found) material = utensilMaterial.type!;
  });

  return material;
}
