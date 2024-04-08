import { GroupType } from "shared/models/enum/type-group.enum";
import { Entry } from "./type-entry.type";

/**
 * Hauptkategorien, die nicht an Rezepte vergeben werden
 */
export type Group<EntryType> = {
  name: string;
  disabled?: boolean;
  entries: Entry<EntryType>[];
  icon?: string;
  additionalSearchTerms?: string[];
  type?: GroupType;
  hide?: boolean;
};
