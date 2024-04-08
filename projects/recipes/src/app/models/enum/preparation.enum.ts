import { Entry } from "shared/models/type-entry.type";
import { findByType, findByTypes } from "../../../../../../shared/models/type.function";
import { PREPARATIONS } from "../../data/preparation.data";

export enum PreparationType {
  NONE = 0,
  TOPUNDERHEAT = 1,
  FAN = 2,
  TOPHEAT = 3,
  UNDERHEAT = 4,
  GRILL = 5,
  POT_COOK = 6,
  POT_BLANCH = 7,
  POT_COOKING = 8,
  PAN = 9,
  PAN_SAUTE = 10,
  REST = 11,
  REST_FRIDGE = 12,
  REST_FREEZER = 13,
  KITCHENMACHINE = 14,
  KITCHENMACHINE_ATTACHMENT = 15,
}

export const findPreparationByType = (type: PreparationType): Entry<PreparationType> => {
  return findByType<PreparationType>(type, PREPARATIONS, "PREPARATION.CHOOSE");
};

export const findPreparationsByType = (types: PreparationType[]): Entry<PreparationType>[] => {
  return findByTypes<PreparationType>(types, PREPARATIONS, "PREPARATION.CHOOSE");
};
