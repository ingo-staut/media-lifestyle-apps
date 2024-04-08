import { DropdownData } from "shared/models/dropdown.type";
import { Entry } from "shared/models/type-entry.type";
import { PreparationHistoryType } from "../models/enum/preparation-history.enum";

export const PREPARATION_HISTORY_TYPES: Record<
  PreparationHistoryType,
  Entry<PreparationHistoryType>
> = {
  PREPARED: {
    type: PreparationHistoryType.PREPARED,
    name: "HISTORY.PREPARED",
    icon: "prepared",
  },
  PLANNED: {
    type: PreparationHistoryType.PLANNED,
    name: "HISTORY.PLANNED",
    icon: "planned",
  },
  PREPARE_UNTIL: {
    type: PreparationHistoryType.PREPARE_UNTIL,
    name: "HISTORY.PREPARE_UNTIL",
    icon: "prepare-until",
  },
};

// ? INFO: Hier ist der Typ "<string, string>",
// da im Dialog nur so ein Typ erlaubt ist
export const PREPARATION_HISTORY_DATA: DropdownData<string, string>[] = [
  {
    key: PreparationHistoryType.PREPARED,
    name: "HISTORY.PREPARED",
    icon: "preparationHistory-prepared",
  },
  {
    key: PreparationHistoryType.PLANNED,
    name: "HISTORY.PLANNED",
    icon: "preparationHistory-planned",
  },
  {
    key: PreparationHistoryType.PREPARE_UNTIL,
    name: "HISTORY.PREPARE_UNTIL",
    icon: "preparationHistory-prepare-until",
  },
];
