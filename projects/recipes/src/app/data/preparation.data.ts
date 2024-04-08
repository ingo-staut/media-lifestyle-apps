import { Group } from "shared/models/type-group.type";
import { rx_bracketAround } from "shared/utils/regexp";
import { replaceAllPlaceholders } from "shared/utils/string";
import { rx_rest, rx_topUnderHeat } from "../../utils/regexp";
import { getAllSearchTerms } from "../../utils/translation";
import { PreparationTypeRegExp } from "../models/instruction.class";

// !WARNING: Dieser Typ ist ein Duplikat
// !Nicht verwenden
enum PreparationType {
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

export const PREPARATIONS: ReadonlyArray<Group<PreparationType>> = [
  {
    name: "PREPARATION.OVEN",
    entries: [
      {
        name: "PREPARATION.TOP_UNDER_HEAT",
        type: PreparationType.TOPUNDERHEAT,
        icon: "preparationType-top-under-heat",
      },
      { name: "PREPARATION.FAN", type: PreparationType.FAN, icon: "preparationType-fan" },
      {
        name: "PREPARATION.TOP_HEAT",
        type: PreparationType.TOPHEAT,
        icon: "preparationType-top-heat",
      },
      {
        name: "PREPARATION.UNDER_HEAT",
        type: PreparationType.UNDERHEAT,
        icon: "preparationType-under-heat",
      },
      { name: "PREPARATION.GRILL", type: PreparationType.GRILL, icon: "preparationType-grill" },
    ],
  },
  {
    name: "PREPARATION.POT",
    entries: [
      {
        name: "PREPARATION.POT_COOK",
        type: PreparationType.POT_COOK,
        icon: "preparationType-pot-cook",
      },
      {
        name: "PREPARATION.POT_BLANCH",
        type: PreparationType.POT_BLANCH,
        icon: "preparationType-pot-blanch",
      },
      {
        name: "PREPARATION.POT_COOKING",
        type: PreparationType.POT_COOKING,
        icon: "preparationType-pot-cooking",
      },
    ],
  },
  {
    name: "PREPARATION.PAN",
    entries: [
      { name: "PREPARATION.PAN_STEAM", type: PreparationType.PAN, icon: "preparationType-pan" },
      {
        name: "PREPARATION.PAN_COOK",
        type: PreparationType.PAN_SAUTE,
        icon: "preparationType-pan-saute",
      },
    ],
  },
  {
    name: "PREPARATION.KITCHENMACHINE",
    entries: [
      {
        name: "PREPARATION.KITCHENMACHINE",
        type: PreparationType.KITCHENMACHINE,
        icon: "preparationType-kitchenmachine",
      },
      {
        name: "PREPARATION.KITCHENMACHINE_ATTACHMENT",
        type: PreparationType.KITCHENMACHINE_ATTACHMENT,
        icon: "preparationType-kitchenmachine-attachment",
      },
    ],
  },
  {
    name: "PREPARATION.REST",
    entries: [
      {
        name: "PREPARATION.REST_ROOMTEMPERATURE",
        type: PreparationType.REST,
        icon: "preparationType-rest",
      },
      {
        name: "PREPARATION.REST_REFRIGERATOR",
        type: PreparationType.REST_FRIDGE,
        icon: "preparationType-rest-fridge",
      },
      {
        name: "PREPARATION.REST_FREEZER",
        type: PreparationType.REST_FREEZER,
        icon: "preparationType-rest-freezer",
      },
    ],
  },
];

// REGEX der Types aufbauen
export const REGEX_PREPARATION_TYPES: PreparationTypeRegExp[] = PREPARATIONS.map((group) => {
  return group.entries.map((entry) => {
    const add: string[] = [];

    // Bei Umluft den speziellen RegEx verwenden
    if (entry.type === PreparationType.TOPUNDERHEAT) {
      add.push(rx_topUnderHeat);
    }

    // Alle Ruhezeiten mit "ruhen/ziehen lasssen"
    if (
      entry.type === PreparationType.REST ||
      entry.type === PreparationType.REST_FREEZER ||
      entry.type === PreparationType.REST_FRIDGE
    ) {
      add.push(rx_rest);
    }

    const rx = replaceAllPlaceholders(
      rx_bracketAround,
      getAllSearchTerms(entry.name).concat(add).join("|")
    );
    const regex: PreparationTypeRegExp = { rx, type: entry.type ?? PreparationType.NONE };
    return regex;
  });
}).flat();
