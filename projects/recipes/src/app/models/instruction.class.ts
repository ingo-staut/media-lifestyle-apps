import isEqual from "lodash.isequal";
import { DateFns, DurationRange } from "shared/utils/date-fns";
import { REGEX_SPLIT_SENTENCE } from "shared/utils/regexp";
import { cleanString, splitTags, toTitleCase } from "shared/utils/string";
import { rx_temperature, rx_timeInWords } from "../../utils/regexp";
import { REGEX_PREPARATION_TYPES } from "../data/preparation.data";
import { LevelType } from "./enum/level.enum";
import { PreparationType } from "./enum/preparation.enum";
import { Ingredient } from "./ingredient.class";
import { Utensil } from "./utensil.class";

export type PreparationTypeRegExp = {
  rx: string;
  type: PreparationType;
  count?: number;
};

export class Instruction {
  name: string;
  text: string;
  minTime?: number | null;
  maxTime?: number | null;
  temperature?: number | null;
  preparationType?: PreparationType;
  note?: string;
  optional?: boolean;
  utensils: Utensil[] = [];
  ingredients: Ingredient[] = [];
  level: LevelType;
  /**
   * Wenn dieser Wert gesetzt ist,
   * dann handelt es sich hier um ein verlinktes Rezept,
   * anstatt ein weiterer Zubereitungsschritt.
   */
  recipeId?: number;

  // Nicht in der Datenbank
  _lastAdded: Date;

  constructor(instruction: {
    name?: string;
    text?: string;
    minTime?: number | null;
    maxTime?: number | null;
    temperature?: number | null;
    preparationType?: PreparationType;
    note?: string;
    optional?: boolean;
    utensils?: Utensil[];
    ingredients?: Ingredient[];
    level?: LevelType;
  }) {
    this.name = instruction.name ?? "";
    this.text = instruction.text ?? "";
    this.minTime = instruction.minTime ?? null;
    this.maxTime = instruction.maxTime ?? null;
    this.temperature = instruction.temperature ?? null;
    this.preparationType = instruction.preparationType ?? PreparationType.NONE;
    this.note = instruction.note ?? "";
    this.optional = instruction.optional ?? false;
    this.utensils = instruction.utensils ?? [];
    this.ingredients = instruction.ingredients ?? [];
    this.level = instruction.level ?? LevelType.LEVEL_NONE;
    this._lastAdded = new Date(-1);
  }

  static parse(value: string): Instruction | null {
    const values = splitTags(value);

    let minTime: number | undefined = undefined;
    let maxTime: number | undefined = undefined;
    let temperature: number | undefined = undefined;
    const indexUsed = new Set<number>();

    values.forEach((v, index) => {
      if (!minTime) {
        const duration = DateFns.getDurationRangeOfString(v);
        if (duration) {
          minTime = duration.min;
          maxTime = duration.max;
          indexUsed.add(index);
        }
        if (!temperature) {
          temperature = Instruction.findTemperature(v);
          if (temperature) indexUsed.add(index);
        }
      }
    });

    const valuesLeft = values.filter((_, index) => !indexUsed.has(index));
    const title = valuesLeft.length >= 1 ? toTitleCase(valuesLeft[0]) : "";
    const text = valuesLeft.length >= 2 ? valuesLeft[1] : "";

    return new Instruction({
      name: cleanString(title),
      text: cleanString(text),
      minTime,
      maxTime,
      temperature,
    });
  }

  static getInstructionsWithDetailsAndTitleOfStringList(list: string[]): Instruction[] {
    const instructions = list
      // Bei Einträgen mit Zahl am Anfang wird die Zahl entfernt und getrimmt
      // z.B. "1.  " oder "2. Text"
      .map((entry) =>
        entry
          ?.trim()
          .replaceAll(/^\d+\.\s*/gi, "")
          ?.trim()
      )
      // Leere Zeilen entfernen
      .filter((entry) => entry?.trim())
      // Zubereitungsdetails finden
      .map((text) => Instruction.findPreparationDetail(text, true))
      .filter((instruction): instruction is Instruction => !!instruction);

    return Instruction.setTitleOfEachInstructionInList(instructions);
  }

  static getInstructionsWithDetailsAndTitleOfMultilineText(text: string): Instruction[] {
    const instructions = Instruction.getInstructionsWithDetailsAndTitleOfStringList(
      text.split("\n")
    );

    return Instruction.setTitleOfEachInstructionInList(instructions);
  }

  static filterInstructions(instructions: Instruction[]): Instruction[] {
    return instructions.filter(
      (instruction) => !instruction.text.match(/^.{0,10}(guten)? ?appetit!?.{0,10}$/gi)
    );
  }

  static setTitleOfEachInstructionInList(instructions: Instruction[]): Instruction[] {
    let indexOffset = 0;

    return instructions.map((instruction, index) => {
      const pos = index - indexOffset;

      // Wenn bereits ein Titel gesetzt wurde,
      // dann nichts mehr setzen
      if (instruction.name !== "") {
        if (instruction.name.match(/^[A-ZÄÖÜ\/!-?=&% ]+$/gm)) {
          instruction.name = toTitleCase(instruction.name);
        }
        return instruction;
      }

      // Erster Schritt immer "Vorbereitung"
      if (pos === 0) instruction.name = "Vorbereitung";
      // Wenn letzter Eintrag ein "Servieren" im Text enthält und keinen Typen, dann als Titel "Servieren" nehmen
      else if (
        pos === instructions.length - 1 &&
        (instruction.text.toLowerCase().includes("servieren") ||
          instruction.text.toLowerCase().includes("garnieren")) &&
        (instruction.preparationType === PreparationType.NONE ||
          instruction.preparationType === PreparationType.REST ||
          instruction.preparationType === PreparationType.REST_FREEZER ||
          instruction.preparationType === PreparationType.REST_FRIDGE)
      ) {
        instruction.name = "Servieren";
      }
      // Wenn Eintrag ein "Tipp" im Text enthält und keinen Typen, dann als Titel "Tipp" nehmen
      // dabei nicht die Schritte weiter zählen
      else if (instruction.text.toLowerCase().includes("tipp")) {
        instruction.name = "Tipp";
        indexOffset += 1;
      }
      // Nummerierte Schritte
      else instruction.name = instruction.name === "" ? pos + ". Schritt" : instruction.name;

      return instruction;
    });
  }

  static findPreparationDetails(text: string) {
    const sentences = text
      .split(REGEX_SPLIT_SENTENCE)
      .map((t) => t.trim())
      // Es bleiben immer zwischen den Satzbausteinen ein "." übrig
      .filter((t) => t.trim().length > 0 && t.trim() !== ".")
      // Alle Sätze ohne Punkt am Ende
      .map((t) => t.replace(/\.$/, ""));

    // Für jede gefundene Zubereitungsmethode eine neue Instruction erstellen,
    // aber mit den Sätzen, die danach noch kommen bis wieder eine Zubereitungsmethode gefunden wird
    const instructions: Instruction[] = [];
    let currentInstruction: Instruction | null = null;
    sentences.forEach((sentence) => {
      const detail = Instruction.findPreparationDetail(sentence);
      if (detail) {
        if (currentInstruction) {
          instructions.push(currentInstruction);
        }
        currentInstruction = detail;
      } else {
        if (currentInstruction) {
          currentInstruction.text += ". " + sentence;
        } else {
          currentInstruction = new Instruction({ text: sentence });
        }
      }
    });

    if (currentInstruction) {
      instructions.push(currentInstruction);
    }

    // Bei jedem Zubereitungsschritt einen Punkt ans Ende setzen
    instructions.forEach((instruction) => {
      if (!instruction.text.endsWith(".")) {
        instruction.text += ".";
      }
    });

    return instructions;
  }

  static findTemperature(text: string) {
    const rx_temp = RegExp("^" + rx_temperature + "$", "i");
    const match = text.match(rx_temp);
    if (match) {
      return parseInt(match[1]);
    }
    return undefined;
  }

  static findTemperatures(text: string) {
    const rx_temp = RegExp(rx_temperature, "gi");
    const matches = text.matchAll(rx_temp);
    const temperatures: number[] = [];
    for (const match of matches) {
      temperatures.push(parseInt(match[1]));
    }
    return temperatures;
  }

  static changeIngredientNamesInInstructionTexts(instructions: Instruction[]) {
    return instructions.map((instruction) => {
      instruction.text = Ingredient.changeIngredientNamesInInstructionText(instruction.text);
      return instruction;
    });
  }

  static setDetailsToInstruction(instruction: Instruction) {
    // REGEX ausführen
    const types = REGEX_PREPARATION_TYPES.map((rx_type) => {
      const rx = new RegExp(rx_type.rx, "gi");

      const matches = instruction.text.matchAll(rx);
      let count = 0;
      for (const match of matches) {
        count++;
      }
      return { ...rx_type, count };
    });

    types.sort((a, b) => b.count - a.count);

    // Temperatur
    const temperatures = Instruction.findTemperatures(instruction.text);

    // Zeit
    const rx_time = RegExp(rx_timeInWords, "gi");
    const matches_time = instruction.text.matchAll(rx_time);
    const times: DurationRange[] = [];
    for (const match of matches_time) {
      const min =
        +(match.groups?.["minMinutes"] ?? 0) +
        +(match.groups?.["minHours"] ?? 0) * 60 +
        +(match.groups?.["minDays"] ?? 0) * 60 * 24;
      const max =
        +(match.groups?.["maxMinutes"] ?? 0) +
        +(match.groups?.["maxHours"] ?? 0) * 60 +
        +(match.groups?.["maxDays"] ?? 0) * 60 * 24;
      times.push({ min: min === 0 ? undefined : min, max: max === 0 ? undefined : max });
    }

    // Filter types with count==0
    const typesFiltered = types.filter((t) => t.count > 0);

    let preparationType = PreparationType.NONE;
    let temperature: number | undefined = undefined;
    let time: DurationRange | undefined = undefined;
    if (typesFiltered.length >= 1) {
      preparationType = typesFiltered[0].type;
    }
    if (temperatures.length >= 1) {
      temperature = temperatures[0];
    }
    if (times.length >= 1) {
      time = times[0];
    }

    if (preparationType) instruction.preparationType = preparationType;
    if (temperature) instruction.temperature = temperature;
    if (time?.min) instruction.minTime = time?.min;
    if (time?.max) instruction.maxTime = time?.max;

    return instruction;
  }

  static findPreparationDetail(text: string, returnNotNull: boolean = false) {
    // REGEX ausführen
    const types = REGEX_PREPARATION_TYPES.map((rx_type) => {
      const rx = new RegExp(rx_type.rx, "gi");

      const matches = text.matchAll(rx);
      let count = 0;
      for (const match of matches) {
        count++;
      }
      return { ...rx_type, count };
    });

    types.sort((a, b) => b.count - a.count);

    // Temperatur
    const temperatures = Instruction.findTemperatures(text);

    // Zeit
    const rx_time = RegExp(rx_timeInWords, "gi");
    const matches_time = text.matchAll(rx_time);
    const times: DurationRange[] = [];
    for (const match of matches_time) {
      const min =
        +(match.groups?.["minMinutes"] ?? 0) +
        +(match.groups?.["minHours"] ?? 0) * 60 +
        +(match.groups?.["minDays"] ?? 0) * 60 * 24;
      const max =
        +(match.groups?.["maxMinutes"] ?? 0) +
        +(match.groups?.["maxHours"] ?? 0) * 60 +
        +(match.groups?.["maxDays"] ?? 0) * 60 * 24;
      times.push({ min: min === 0 ? undefined : min, max: max === 0 ? undefined : max });
    }

    // Filter types with count==0
    const typesFiltered = types.filter((t) => t.count > 0);

    let preparationType = PreparationType.NONE;
    let temperature: number | undefined = undefined;
    let time: DurationRange | undefined = undefined;
    if (typesFiltered.length >= 1) {
      preparationType = typesFiltered[0].type;
    }
    if (temperatures.length >= 1) {
      temperature = temperatures[0];
    }
    if (times.length >= 1) {
      time = times[0];
    }

    if (
      preparationType === PreparationType.NONE &&
      temperature === undefined &&
      time === undefined
    ) {
      return returnNotNull
        ? new Instruction({
            text,
            preparationType,
            temperature,
          })
        : null;
    }

    return new Instruction({
      text,
      preparationType,
      temperature,
      minTime: time?.min,
      maxTime: time?.max,
    });
  }

  static isEqual(instructions: Instruction[], others: Instruction[]) {
    if (instructions.length !== others.length) {
      return false;
    }
    // instructions.sort((a, b) => a.text.length - b.text.length);
    // others.sort((a, b) => a.text.length - b.text.length);
    for (let i = 0; i < instructions.length; i++) {
      if (!Instruction.isInstructionEqual(instructions[i], others[i])) {
        return false;
      }
    }
    return true;
  }

  static isInstructionEqual(instruction: Instruction, other: Instruction) {
    return (
      instruction.name === other.name &&
      instruction.text === other.text &&
      instruction.preparationType === other.preparationType &&
      instruction.temperature === other.temperature &&
      instruction.minTime === other.minTime &&
      instruction.maxTime === other.maxTime &&
      Ingredient.isEqual(instruction.ingredients, other.ingredients) &&
      isEqual(instruction.utensils, other.utensils) &&
      instruction.note === other.note &&
      instruction.optional === other.optional &&
      instruction.level === other.level
    );
  }
}
