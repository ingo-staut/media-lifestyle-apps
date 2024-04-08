import { TranslateService } from "@ngx-translate/core";
import { DateFns } from "shared/utils/date-fns";
import { rx_wordEnd } from "shared/utils/regexp";
import { cleanString, firstCharToTitleCase, splitString, splitTags } from "shared/utils/string";
import { UTENSIL_MATERIALS, findUtensilMaterial } from "../data/utensil-material.data";
import { UTENSIL_SIZES, findUtensilSize } from "../data/utensil-size.data";
import { UtensilMaterial } from "./enum/utensil-material.enum";
import { UtensilSize } from "./enum/utensil-size.enum";
import { FromWith } from "./ingredient.class";
import { Instruction } from "./instruction.class";
import { UtensilObject } from "./utensil-object.class";

/**
 * Daten aus der Datenbank
 */
export class Utensil {
  name: string;
  amount: number;
  size: UtensilSize;
  material: UtensilMaterial;
  note: string;

  fromWithInstruction: FromWith[] = [];

  _lastAdded: Date;

  constructor(data: {
    name: string;
    amount?: number;
    size?: UtensilSize;
    material?: UtensilMaterial;
    note?: string;
    fromWithInstruction?: FromWith[];
  }) {
    this.name = data.name;
    this.amount = data.amount ?? 1;
    this.size = data.size ?? UtensilSize.NONE;
    this.material = data.material ?? UtensilMaterial.NONE;
    this.note = data.note ?? "";
    this.fromWithInstruction = data.fromWithInstruction ?? [];
  }

  static parse(value: string): Utensil {
    const splitted = splitString(value, [" ", ","]);

    // Wenn nur ein Objekt, dann direkt als Name setzen
    if (splitted.length === 1)
      return new Utensil({ name: cleanString(firstCharToTitleCase(value)) });

    let size: UtensilSize = UtensilSize.NONE;
    let material: UtensilMaterial = UtensilMaterial.NONE;
    const rest = splitted
      .map((split) => {
        if (material === UtensilMaterial.NONE) {
          const tmp = findUtensilMaterial(split);
          if (tmp !== UtensilMaterial.NONE) {
            material = tmp;
            return;
          }
        }

        if (size === UtensilSize.NONE) {
          const tmp = findUtensilSize(split);
          if (tmp !== UtensilSize.NONE) {
            size = tmp;
            return;
          }
        }

        // Falls keine Größe oder Material gefunden,
        // dann den Wert wieder zurückgeben
        return split;
      })
      .filter((filter): filter is string => !!filter);

    const name = cleanString(
      firstCharToTitleCase(rest.join(" ").replaceAll("aus", "").replaceAll("made of", ""))
    );

    return new Utensil({ name, size, material });
  }

  static parseAll(value: string) {
    const tags = splitTags(value);
    const utensils = tags
      .map((tag) => Utensil.parse(tag))
      .map((utensil) => {
        if (utensil) utensil._lastAdded = new Date();
        return utensil;
      })
      .filter((value): value is Utensil => !!value);

    return utensils;
  }

  getUtensilString(object: UtensilObject | null, translateService: TranslateService): string {
    const sizeTranslation = translateService.instant(UTENSIL_SIZES[this.size].name);
    const materialTranslation = translateService.instant(UTENSIL_MATERIALS[this.material].name);
    const sizeLower =
      translateService.currentLang != "de" ? sizeTranslation.toLowerCase() : sizeTranslation;
    const materialLower =
      translateService.currentLang != "de"
        ? materialTranslation.toLowerCase()
        : materialTranslation;

    const materialSeparator = ["aus", "made from", "de", "de"][
      DateFns.getLocaleIndex(translateService.currentLang)
    ];

    const size = this.size !== UtensilSize.NONE ? ", " + sizeLower : "";
    const material =
      this.material !== UtensilMaterial.NONE ? " " + materialSeparator + " " + materialLower : "";
    const noteStr = this.note ? " (" + this.note + ")" : "";
    const amount = this.amount > 1 ? this.amount + "x " : "";
    const name = object ? object.name : this.name;

    return amount + name + size + material + noteStr;
  }

  static findUtensilsAndAddToInstructions(
    instructions: Instruction[],
    utensilObjects: UtensilObject[]
  ): Instruction[] {
    return instructions.map((instruction) => {
      if (!instruction) return instruction;

      const splittedInstructionText = instruction.text.toLowerCase().split(RegExp(rx_wordEnd));

      utensilObjects.forEach((utensilObject) => {
        if (
          // Im Text ein Utensilienname
          instruction?.text.toLowerCase().includes(utensilObject.name.toLowerCase()) ||
          // Alternative Utensiliennamen
          utensilObject.alternativeNames.some((alternativeName) =>
            instruction.text.toLowerCase().includes(alternativeName)
          ) ||
          // Zutateneinheiten und Utensilien-Suchnamen
          instruction.ingredients.some((ingredient) =>
            utensilObject.searchNames.includes(ingredient.unit)
          ) ||
          splittedInstructionText.some((word) =>
            utensilObject.searchNames.some((name) => name.toLowerCase() === word)
          )
        ) {
          instruction.utensils.push(new Utensil({ name: utensilObject.name }));
        }
      });
      return instruction;
    });
  }
}
