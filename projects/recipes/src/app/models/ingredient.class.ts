import { cloneDeep } from "lodash";
import { rx_wordBeginning, rx_wordEndnding } from "shared/utils/regexp";
import {
  cleanString,
  combinePairsInList,
  compareText,
  escapeRegExp,
  firstCharToTitleCase,
  getDigitAsString,
  getDigitFromBeginningAndRemoveFromString,
  getLongestString,
  splitString,
  splitTags,
} from "shared/utils/string";
import { IngredientConversionContentType } from "./enum/ingredient-conversion-content.enum";
import { IngredientAvailability } from "./ingredient-availability.type";
import { IngredientConversion } from "./ingredient-conversion.class";
import { Instruction } from "./instruction.class";
import { Recipe } from "./recipe.class";

export function getClosestFraction(input: number): [number, number] {
  let closestFraction: [number, number] = [0, 1];
  let minDifference = Math.abs(input - closestFraction[0] / closestFraction[1]);

  for (let numerator = 1; numerator <= 9; numerator++) {
    for (let denominator = 1; denominator <= 9; denominator++) {
      const difference = Math.abs(input - numerator / denominator);
      if (difference < minDifference) {
        minDifference = difference;
        closestFraction = [numerator, denominator];
      }
    }
  }

  return closestFraction;
}

export type FromWith = { id?: string; notes: string[] };

type IngredientParseOptionals = {
  notChangeName: boolean;
  notChangeNote: boolean;
  notChangeUnit: boolean;
};

export class Ingredient {
  name: string;
  unit: string;
  amount: number;
  note: string;
  variants: string[];

  // ! Ab hier Attribute, die nicht mit in die Datenbank kommen

  /**
   * | Wert      | Beschreibung                   |
   * | :-------- | :----------------------------- |
   * | x < 0     | Einheit der Zutat passt nicht  |
   * | 0         | Nicht vorhanden                |
   * | 0 > x < 1 | Teilweise vorhanden            |
   * | x >= 1    | Vorhanden                      |
   */
  available: number;
  fromWithRecipe: FromWith[] = [];
  fromWithInstruction: FromWith[] = [];
  id?: string;

  // IngredientAvailable
  useUntil: Date | null = null;

  _checked: boolean;
  _lastAdded: Date;
  _description: string;
  store: string;

  constructor(ingredient: {
    name: string;
    unit?: string;
    amount?: number;
    note?: string;
    variants?: string[];
    available?: number;
    fromWithRecipe?: FromWith[];
    fromWithInstruction?: FromWith[];
    useUntil?: Date | null;
    _checked?: boolean;
    store?: string;
  }) {
    this.name = ingredient.name;
    this.unit = ingredient.unit ?? "";
    this.amount = ingredient.amount ?? 0;
    this.note = ingredient.note ?? "";
    this.available = ingredient.available ?? 0;
    this.variants = ingredient.variants ?? [];
    this.fromWithRecipe = ingredient.fromWithRecipe ?? [];
    this.fromWithInstruction = ingredient.fromWithInstruction ?? [];
    this.useUntil = ingredient.useUntil ?? null;
    this._checked = ingredient._checked ?? false;
    this.store = ingredient.store ?? "";

    const { unit, amount } = Ingredient.interpretUnitAndAmountCombination(this.unit, this.amount);
    this.unit = unit;
    this.amount = amount;
  }

  static readonly SEPARATORS = [", ", " oder ", " (", ")"];

  static parse(value: string, optionals?: IngredientParseOptionals): Ingredient | null {
    // z.B.: Für den Teig ...
    if (/^für d.*/gis.test(value)) return null;

    value = cleanString(value);
    value = value.replaceAll("(n)", "n"); // Sonst wird es als Notiz erkannt

    if (!value) return null;
    if (value.endsWith(":")) return null;

    let note = "";

    const matchNote = value.match(/\((.*)\)$/); // 100 ml Milch (Vegan)
    if (matchNote) {
      note = matchNote[1];
      value = value.replace(matchNote[0], "").trim();
    }

    const { amount, text } = getDigitFromBeginningAndRemoveFromString(value);
    value = text;

    const splitted = splitString(value, [" ", "\t"]);

    if (splitted.length === 0) return null;

    if (splitted.length === 1) {
      const name = cleanString(firstCharToTitleCase(splitted[0]));

      return Ingredient.assambleIngredient(name, "", amount, note, optionals);
    }

    // Wenn es eine Anzahl gibt, dann auch eine Einheit
    if (amount) {
      const unit = splitted[0];
      const name = cleanString(firstCharToTitleCase(splitted.slice(1).join(" ")));

      return Ingredient.assambleIngredient(name, unit, amount, note, optionals);
    }

    const name = cleanString(firstCharToTitleCase(splitted.join(" ")));

    return Ingredient.assambleIngredient(name, "", amount, note, optionals);
  }

  private static assambleIngredient(
    name: string,
    unit: string,
    amount: number,
    note: string,
    optionals?: IngredientParseOptionals
  ) {
    const { notChangeName, notChangeNote, notChangeUnit } = optionals ?? {};

    if (!notChangeName) {
      const match = name.match(/knoblauchzehe.*/gi);
      if (match) {
        name = "Knoblauch";
        unit = "Zehen";
      }
    }

    return new Ingredient({
      name: notChangeName ? name : Ingredient.changeName(name),
      unit: notChangeUnit ? unit : Ingredient.changeUnit(unit),
      amount,
      note: notChangeNote ? note : Ingredient.changeNote(note),
    });
  }

  static changeUnit(unit: string) {
    if (!unit?.trim()) return unit;

    return unit
      ?.trim()
      .replaceAll(/^reife$/gi, "")
      .replaceAll(/^block$/gi, "")
      .replaceAll(/^kleine?$/gi, "")
      .replaceAll(/^m?(ittel)?.?(-| )?große(n|s|)?$/gi, "")
      .replaceAll(/^kilogramm$/gi, "kg")
      .replaceAll(/^gramm$/gi, "g")
      .replaceAll(/^milliliter$/gi, "ml")
      .replaceAll(/^liter$/gi, "l")
      .replaceAll(/^bd.$/gi, "Bund")
      .replaceAll(/^(päckchen|packung(en)?)$/gi, "Pck.")
      .replaceAll(/^e(ss|ß)l(ö|oe)ffel$/gi, "EL")
      .replaceAll(/^teel(ö|oe)ffel$/gi, "TL")
      .replaceAll(/^messerspitze$/gi, "Msp.");
  }

  static changeNote(note: string) {
    // *siehe Anmerkungen // (*siehe ... // *(siehe ... // siehe ...
    const noteText = note
      ? note
          ?.trim()
          ?.replaceAll(/(\(|,)? ?\*?\(?siehe.*/gi, "")
          ?.trim()
      : "";

    return noteText.toLowerCase().includes("sorte nach belieben") ||
      noteText.toLowerCase().includes("nach bedarf") ||
      noteText.toLowerCase().includes("n. b.") ||
      noteText.toLowerCase().includes("ich nehme") ||
      noteText.toLowerCase().includes("ich verwende") ||
      noteText.toLowerCase().includes("ich benutze") ||
      noteText.toLowerCase().includes("oder margarine") ||
      /^ ?z\. ?b\. ?dr. ?oetker.*/gi.test(noteText) // " z. B. Dr. Oetker ... "
      ? ""
      : noteText;
  }

  static changeName(name: string) {
    if (!name?.trim()) return name;

    return this.changeNote(
      name
        .trim()
        .replaceAll(/^ ?biogreno ?/gi, "")
        .replaceAll(/^ ?vegan leben ?/gi, "")
        .replaceAll(/^ ?etwas ?/gi, "")
        .replaceAll(/^bunter pfeffer$/gi, "Pfeffer")
        .replaceAll(/^kakaopulver$/gi, "Kakao")
        .replaceAll(/^sojasauce$/gi, "Sojasoße")
        .replaceAll(/^champignons$/gi, "Pilze")
        .replaceAll(/^vanillinzucker$/gi, "Vanillezucker")
        .replaceAll(/^vanillin$/gi, "Vanillezucker")
        .replaceAll(/^pflanzenmilch$/gi, "Hafermilch")
        .replaceAll(/^pflanzendrink$/gi, "Hafermilch")
        .replaceAll(/^haferdrink$/gi, "Hafermilch")
        .replaceAll(/^sojadrink$/gi, "Sojamilch")
        .replaceAll(/^mandeldrink$/gi, "Mandelmilch")
        .replaceAll(/^blaubeere$/gi, "Blaubeeren")
        .replaceAll(/^himbeere$/gi, "Himbeeren")
        .replaceAll(/^banane$/gi, "Bananen")
        .replaceAll(/^apfel$/gi, "Äpfel")
        .replaceAll(/^zwiebel$/gi, "Zwiebeln")
        .replaceAll(/^tomatenketchup$/gi, "Ketchup")
        .replaceAll(/^schwarzer pfeffer$/gi, "Pfeffer")
        .replaceAll(/^(karotte|möhren?)$/gi, "Karotten")
        .replaceAll(/vegane butter( \(?.?(oder)?.?margarine\)?)?/gi, "Margarine")
        .replaceAll(/(geschmacksneutrales ?)?(pflanzen|raps|sonnenblumen|brat)-?öl/gi, "Öl")
        .replaceAll(/^(vollkorn-?)?(weizen|dinkel|feines ?)?(-?vollkorn)?-?mehl.*/gi, "Mehl") // Weizenmehl Typ 405 ... => Mehl // ! NICHT: Leinmehl
        .replaceAll(/(,|\()? ?zum braten.*/gi, "")
        .replaceAll(/^plus: ?/gi, "")
        ?.trim()
    );
  }

  static changeIngredientNamesInInstructionText(text: string) {
    if (!text?.trim()) return text;

    return (
      text
        .replaceAll(RegExp(rx_wordBeginning + "sojasauce" + rx_wordEndnding, "gi"), "$1Sojasoße$2")
        .replaceAll(RegExp(rx_wordBeginning + "champignons?" + rx_wordEndnding, "gi"), "$1Pilze$2")
        .replaceAll(
          RegExp(rx_wordBeginning + "vanillin(zucker)?" + rx_wordEndnding, "gi"),
          "$1Vanillezucker$2"
        )
        .replaceAll(
          RegExp(rx_wordBeginning + "pflanzenmilch" + rx_wordEndnding, "gi"),
          "$1Hafermilch$2"
        )
        .replaceAll(
          RegExp(rx_wordBeginning + "pflanzendrink" + rx_wordEndnding, "gi"),
          "$1Hafermilch$2"
        )
        .replaceAll(
          RegExp(rx_wordBeginning + "haferdrink" + rx_wordEndnding, "gi"),
          "$1Hafermilch$2"
        )
        .replaceAll(RegExp(rx_wordBeginning + "sojadrink" + rx_wordEndnding, "gi"), "$1Sojamilch$2")
        .replaceAll(
          RegExp(rx_wordBeginning + "tomatenketchup" + rx_wordEndnding, "gi"),
          "$1Ketchup$2"
        )
        .replaceAll(
          RegExp(rx_wordBeginning + "fleischtomate(n)?" + rx_wordEndnding, "gi"),
          "$1Tomate$2$3"
        )
        .replaceAll(RegExp(rx_wordBeginning + "chilipulver" + rx_wordEndnding, "gi"), "$1Chili$2")
        .replaceAll(
          RegExp(rx_wordBeginning + "gemüsezwiebel(n)?" + rx_wordEndnding, "gi"),
          "$1Zwiebel$2$3"
        )
        .replaceAll(
          RegExp(rx_wordBeginning + "mandeldrink" + rx_wordEndnding, "gi"),
          "$1Mandelmilch$2"
        )
        .replaceAll(RegExp(rx_wordBeginning + "möhren?" + rx_wordEndnding, "gi"), "$1Karotten$2")
        // ! Keine Mehrzahlen im Text ersetzen, die auf "n" enden, denn die werden gefunden
        // ! Allerdings "Apfel" nicht, sollte aber so bleiben, sonst passt es nicht in den Textfluss
        // .replaceAll(RegExp(rx_wordBeginning + "blaubeere" + rx_wordEndnding, "gi"), "$1Blaubeeren$2")
        // .replaceAll(RegExp(rx_wordBeginning + "himbeere" + rx_wordEndnding, "gi"), "$1Himbeeren$2")
        // .replaceAll(RegExp(rx_wordBeginning + "banane" + rx_wordEndnding, "gi"), "$1Bananen$2")
        // .replaceAll(RegExp(rx_wordBeginning + "apfel" + rx_wordEndnding, "gi"), "$1Äpfel$2")
        // .replaceAll(RegExp(rx_wordBeginning + "zwiebel" + rx_wordEndnding, "gi"), "$1Zwiebeln$2")
        // .replaceAll(RegExp(rx_wordBeginning + "karotte" + rx_wordEndnding, "gi"), "$1Karotten$2")
        .replaceAll(
          RegExp(rx_wordBeginning + "(?:veganen?)? butter" + rx_wordEndnding, "gi"),
          "$1Margarine$2"
        )
        .replaceAll(
          RegExp(
            rx_wordBeginning +
              "(?:geschmacksneutrales ?)?(?:neutrales ?)?(?:pflanzen|raps|sonnenblumen|brat|speise)-?öl" +
              rx_wordEndnding,
            "gi"
          ),
          "$1Öl$2"
        )
        .replaceAll(
          RegExp(
            rx_wordBeginning +
              "(?:vollkorn-?)?(?:weizen|dinkel|feines ?)?(?:-?vollkorn)?-?mehl" +
              rx_wordEndnding,
            "gi"
          ),
          "$1Mehl$2"
        ) // Vollkorn-Dinkel-Weizenmehl Typ 405 ... => Mehl // ! Mit Leerzeichen davor
        ?.trim()
    );
  }

  static parseAll(value: string) {
    const tags = splitTags(value);
    const ingredients = tags
      .map((tag) => Ingredient.parse(tag))
      .map((ingredient) => {
        if (ingredient) ingredient._lastAdded = new Date();
        return ingredient;
      })
      .filter((value): value is Ingredient => !!value);

    return ingredients;
  }

  static transformUnitAmountCombination(unit: string, amount: number) {
    if (unit.toLowerCase() === "g" && amount >= 1000) {
      return { unit: "kg", amount: amount / 1000 };
    }
    if (unit.toLowerCase() === "ml" && amount >= 1000) {
      return { unit: "l", amount: amount / 1000 };
    }
    return { unit, amount };
  }

  static interpretUnitAndAmountCombination(unit: string, amount: number) {
    if (unit.toLowerCase() === "kg") {
      return { unit: "g", amount: amount * 1000 };
    }
    if (unit.toLowerCase() === "l") {
      return { unit: "ml", amount: amount * 1000 };
    }
    return { unit, amount };
  }

  getIngredientString(
    locale: string,
    ingredientsConversion: IngredientConversion[] | null = [],
    optionals?: {
      onlyAmountAndUnitAndNote?: boolean;
      amountFactor?: number;
      conversion?: IngredientConversion;
      transformUnitAmountCombination?: boolean;
      hideIngredientNotes?: boolean;
    }
  ): string {
    const {
      onlyAmountAndUnitAndNote = false,
      amountFactor = 1,
      conversion,
      transformUnitAmountCombination = true,
      hideIngredientNotes = false,
    } = optionals ?? {};

    const actualAmount = amountFactor * this.amount;
    const ingredientConversion =
      conversion ??
      IngredientConversion.findIngredientConversion(this.name, ingredientsConversion ?? []);
    const emoji = ingredientConversion ? ingredientConversion.emoji + " " : "";
    const note = this.note && !hideIngredientNotes ? ` (${this.note})` : "";
    const { unit, amount } = transformUnitAmountCombination
      ? Ingredient.transformUnitAmountCombination(this.unit, actualAmount)
      : { unit: this.unit, amount: actualAmount };

    if (onlyAmountAndUnitAndNote)
      return (
        (amount === 0 ? "" : getDigitAsString(amount, locale) + (unit ? " " : "")) + unit + note
      );

    return (
      emoji +
      (amount === 0 ? "" : getDigitAsString(amount, locale) + (unit ? " " : "")) +
      unit +
      " " +
      this.name +
      note
    ).trim();
  }

  isVegan(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    if (conversion) {
      return new IngredientConversion(conversion).isVegan;
    }
    return getTrueIfNoType;
  }

  isVegetarian(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    if (conversion) {
      return new IngredientConversion(conversion).isVegetarian;
    }
    return getTrueIfNoType;
  }

  containsAlcohol(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    if (conversion) {
      return new IngredientConversion(conversion).containsAlcohol;
    }
    return getTrueIfNoType;
  }

  containsSugar(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    if (conversion) {
      return new IngredientConversion(conversion).containsSugar;
    }
    return getTrueIfNoType;
  }

  containsGluten(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    if (conversion) {
      return new IngredientConversion(conversion).containsGluten;
    }
    return getTrueIfNoType;
  }

  containsLactose(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    if (conversion) {
      return new IngredientConversion(conversion).containsLactose;
    }
    return getTrueIfNoType;
  }

  containsFructose(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    if (conversion) {
      return new IngredientConversion(conversion).containsFructose;
    }
    return getTrueIfNoType;
  }

  getMostlyContentsTypeObject(ingredientsConversion: IngredientConversion[]) {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    if (conversion) {
      const all = new IngredientConversion(conversion).filteredContents.map((item) => item.type);
      if (new IngredientConversion(conversion).isVegan) {
        all.unshift(IngredientConversionContentType.VEGAN);
      }
      if (new IngredientConversion(conversion).isVegetarian) {
        all.unshift(IngredientConversionContentType.VEGETARIAN);
      }

      return {
        mostly: new IngredientConversion(conversion).mostlyContentsTypeObject,
        all,
      };
    }
    return null;
  }

  hasEmoji(ingredientsConversion: IngredientConversion[]) {
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    return !!conversion?.emoji;
  }

  static combineIngredients(ingredients: Ingredient[]): Ingredient[] {
    const result: Ingredient[] = [];

    for (const ingredient of ingredients) {
      const found = new Ingredient(ingredient).findSameIngredientInListByNameAndUnit(result);

      if (found) {
        found.amount = found.amount + ingredient.amount;

        // Find the same "fromWithRecipe[]" (with id) in "found" and "ingredient" and combine the notes
        for (const fromWithRecipe of ingredient.fromWithRecipe ?? []) {
          const foundFromWithRecipe = found.fromWithRecipe?.find(
            (fromWithRecipeFound) => fromWithRecipeFound.id === fromWithRecipe.id
          );

          if (foundFromWithRecipe) {
            foundFromWithRecipe.notes.push(...fromWithRecipe.notes);
            // foundFromWithRecipe.note = foundFromWithRecipe.note + ", " + fromWithRecipe.note;
          } else {
            found.fromWithRecipe?.push(fromWithRecipe);
          }
        }

        for (const fromWithInstruction of ingredient.fromWithInstruction ?? []) {
          const foundFromWithInstruction = found.fromWithInstruction?.find(
            (fromWithInstructionFound) => fromWithInstructionFound.id === fromWithInstruction.id
          );

          if (foundFromWithInstruction) {
            foundFromWithInstruction.notes.push(...fromWithInstruction.notes);
            // foundFromWithInstruction.note = foundFromWithInstruction.note + ", " + fromWithInstruction.note;
          } else {
            found.fromWithInstruction?.push(fromWithInstruction);
          }
        }

        // Rezept kommt doppelt in der Liste vor
        // found.fromWithRecipe?.push(...(ingredient.fromWithRecipe ?? []));
      } else {
        result.push(ingredient);
      }
    }

    return result;
  }

  static setIngredientsChecked(ingredients: Ingredient[], ingredientsChecked: Ingredient[]) {
    ingredients.map((ingredient) => {
      ingredient._checked = !!ingredientsChecked.find((ingr) =>
        new Ingredient(ingr).equalAll(ingredient)
      );
      return ingredient;
    });

    return ingredients;
  }

  // /**
  //  * @deprecated Soltle eigentlich nicht mehr verwendet werden,
  //  * da in der Zutatenliste automatisch die Verügbarkeit berechnet wird
  //  */
  // static setAvailibilityToEachIngredient(
  //   ingredients: Ingredient[],
  //   ingredientsAvailable: Ingredient[]
  // ) {
  //   return ingredients.map((ingredient) => {
  //     ingredient.available = new Ingredient(ingredient).isAvailable(ingredientsAvailable, []);
  //     return ingredient;
  //   });
  // }

  static getIngredientsFromRecipes(recipes: Recipe[], locale: string): Ingredient[] {
    return Ingredient.combineIngredients(
      recipes
        .map((recipe) => {
          const instructions = recipe.instructions.filter(
            (instruction) =>
              !recipe.isOnShoppingList ||
              !instruction.optional ||
              (instruction.optional && recipe.isOnShoppingList.withOptionals)
          );
          const ingredients = instructions.map((instruction) => instruction.ingredients).flat();
          return Ingredient.combineIngredients(
            cloneDeep(ingredients).map((ingredient) => {
              const ingr = new Ingredient(ingredient);
              if (recipe.isOnShoppingList)
                ingr.changeAmount(recipe.isOnShoppingList.amountNumber, recipe.amountNumber);
              return ingr;
            })
          ).map((ingr) => {
            ingr.fromWithRecipe = [{ id: recipe.id, notes: [ingr.getIngredientString(locale)] }];
            return ingr;
          });
        })
        .flat()
    );
  }

  changeAmount(amountNumberCurrent: number, amountNumber: number) {
    this.amount = (amountNumberCurrent / amountNumber) * this.amount;
  }

  hasAtLeastOneRecipe() {
    return this.fromWithRecipe.some((fromWithRecipe) => fromWithRecipe.id);
  }

  hasNotAtLeastOneRecipe() {
    return this.fromWithRecipe.some((fromWithRecipe) => !fromWithRecipe.id);
  }

  hasNotOneRecipe() {
    return this.fromWithRecipe.filter((fromWithRecipe) => fromWithRecipe.id).length === 0;
  }

  hasAtLeastOneInstruction() {
    return this.fromWithInstruction.some((fromWithInstruction) => fromWithInstruction.id);
  }

  hasNotAtLeastOneInstruction() {
    return this.fromWithInstruction.some((fromWithInstruction) => !fromWithInstruction.id);
  }

  hasNotOneInstruction() {
    return (
      this.fromWithInstruction.filter((fromWithInstruction) => fromWithInstruction.id).length === 0
    );
  }

  equalAll(ingredient: Ingredient): boolean {
    return (
      compareText(this.name, ingredient.name) &&
      compareText(this.unit, ingredient.unit) &&
      this.amount === ingredient.amount &&
      this.note === ingredient.note
    );
  }

  equalNameAndUnit(ingredient: Ingredient): boolean {
    return compareText(this.name, ingredient.name) && compareText(this.unit, ingredient.unit);
  }

  findSameIngredientInListByNameAndUnit(
    ingredients: Ingredient[],
    compareUnit: boolean = true,
    split: string[] = []
  ): Ingredient | undefined {
    return ingredients.find(
      (ingredient) =>
        compareText(ingredient.name, this.name, [], split) &&
        (!compareUnit || (compareUnit && compareText(ingredient.unit, this.unit, [], split)))
    );
  }

  findSameIngredientInListByName(ingredients: Ingredient[]): Ingredient | undefined {
    return this.findSameIngredientInListByNameAndUnit(ingredients, false);
  }

  static isEqual(ingredients: Ingredient[], others: Ingredient[]) {
    if (ingredients.length !== others.length) {
      return false;
    }

    for (let i = 0; i < ingredients.length; i++) {
      if (!Ingredient.isIngredientEqual(ingredients[i], others[i])) {
        return false;
      }
    }

    return true;
  }

  static isIngredientEqual(ingredient: Ingredient, other: Ingredient): boolean {
    return (
      compareText(ingredient.name, other.name) &&
      compareText(ingredient.unit, other.unit) &&
      ingredient.amount === other.amount &&
      ingredient.note === other.note
    );
  }

  static findAllIngredientInListByNameAndUnit(
    name: string,
    ingredients: Ingredient[],
    unit?: string,
    compareUnit: boolean = true,
    alternativeNames: string[] = [],
    split: string[] = []
  ): Ingredient[] | undefined {
    return ingredients.filter(
      (ingredient) =>
        compareText(ingredient.name, name, alternativeNames, split) &&
        (!compareUnit || (compareUnit && unit !== undefined && compareText(ingredient.unit, unit)))
    );
  }

  static findAllIngredientInListByName(
    name: string,
    ingredients: Ingredient[],
    unit?: string,
    compareUnit: boolean = true,
    alternativeNames: string[] = [],
    split: string[] = []
  ): Ingredient[] | undefined {
    return Ingredient.findAllIngredientInListByNameAndUnit(
      name,
      ingredients,
      unit,
      compareUnit,
      alternativeNames,
      split
    );
  }

  static replaceIngredientInListByNameAndUnit(
    ingredient: Ingredient,
    ingredients: Ingredient[],
    compareUnit: boolean = true
  ) {
    const index = ingredients.findIndex(
      (ingr) =>
        compareText(ingr.name, ingredient.name) &&
        (!compareUnit || (compareUnit && compareText(ingr.unit, ingredient.unit)))
    );

    if (index === -1) {
      ingredients.unshift(ingredient);
    } else {
      ingredients[index] = ingredient;
    }

    return ingredients;
  }

  setAvailable(ingredientsAvailable: Ingredient[], ingredientsConversion: IngredientConversion[]) {
    this.available = Ingredient.isIngredientAvailable(
      this,
      ingredientsAvailable,
      ingredientsConversion
    ).ratio;
  }

  isAvailable(
    ingredientsAvailable: Ingredient[],
    ingredientsConversion: IngredientConversion[]
  ): IngredientAvailability {
    return Ingredient.isIngredientAvailable(this, ingredientsAvailable, ingredientsConversion);
  }

  /**
   * @param ingredient Ausgangszutat
   * @param ingredientsAvailable Alle verfügbaren Zutaten
   * @param ingredientsConversion Alle Umrechnungszutaten
   * @returns
   * | Wert      | Beschreibung                   |
   * | :-------- | :----------------------------- |
   * | x < 0     | Einheit der Zutat passt nicht  |
   * | 0         | Nicht vorhanden                |
   * | 0 > x < 1 | Teilweise vorhanden            |
   * | x >= 1    | Vorhanden                      |
   */
  static isIngredientAvailable(
    ingredient: Ingredient,
    ingredientsAvailable: Ingredient[],
    ingredientsConversion: IngredientConversion[]
  ): IngredientAvailability {
    // Verfügbare Zutat mit gleicher Einheit gefunden
    const foundAvailableIngredientWithSameUnit = new Ingredient(
      ingredient
    ).findSameIngredientInListByNameAndUnit(ingredientsAvailable, true, Ingredient.SEPARATORS);
    if (foundAvailableIngredientWithSameUnit) {
      if (foundAvailableIngredientWithSameUnit.amount === 0 && ingredient.amount === 0) {
        return { ratio: 1, ingredientAvailable: foundAvailableIngredientWithSameUnit };
      }
      return {
        ratio: foundAvailableIngredientWithSameUnit.amount / ingredient.amount,
        ingredientAvailable: foundAvailableIngredientWithSameUnit,
      };
    }

    // Falls keine verfügbare Zutat mit gleicher Einheit gefunden wurde

    // Nach verfügbarer Zutat mit gleichem Namen wie Ausgangszutat suchen
    const allAvailable = ingredientsAvailable.filter((ingredientAvailable) =>
      compareText(ingredientAvailable.name, ingredient.name, [], Ingredient.SEPARATORS)
    );

    // Keine verfügbare Zutat gefunden
    if (!allAvailable.length) {
      return { ratio: 0 };
    }

    // Verfügbare Zutat mit gleichem Namen wie Ausgangszutat gefunden

    // Suche nach Umrechnung zur Ausgangszutat
    const ingredientConversion = IngredientConversion.findIngredientConversion(
      ingredient.name,
      ingredientsConversion
    );

    // NUR FÜR DIE "FALSCHEN" RETURNS: Verfügbare Zutat (mit ungleicher Einheit) finden
    const foundSomeAvailable = new Ingredient(ingredient).findSameIngredientInListByNameAndUnit(
      ingredientsAvailable,
      false,
      Ingredient.SEPARATORS
    );

    // Keine Umrechnung gefunden
    if (!ingredientConversion)
      return foundSomeAvailable
        ? { ratio: -1, ingredientAvailable: foundSomeAvailable }
        : { ratio: 0 };

    // Umrechnung (evtl. mit gleicher Einheit) zur Augangszutat gefunden

    // Suche nach Umrechnung mit gleicher Einheit (nur nach der ersten suchen, sonst `filter` verwenden)
    const ingredientConversionsWithSameUnit = ingredientConversion.conversions.find(
      (ingredientsConversion) => compareText(ingredientsConversion.unit, ingredient.unit)
    );

    // Keine Umrechnung mit gleicher Einheit gefunden
    if (!ingredientConversionsWithSameUnit)
      return foundSomeAvailable
        ? { ratio: -1, ingredientAvailable: foundSomeAvailable }
        : { ratio: 0 };

    // Umrechnung mit gleicher Einheit zur Ausgangszutat gefunden (=> ingredientConversionsWithSameUnit)
    // Umrechnungen mit gleicher Einheit zur Ausgangszutat gefunden (=> ingredientConversion.conversions)

    // Enthält diese Umrechnung auch eine Umrechnung für die gefundenen Zutaten mit dem selben Namen, die bereits gefunden wurden?
    // Problem: Haben aktuell eine Umrechnung, die zur Ausgangszutat passt,
    // aber hat diese Umrechnung auch einen Eintrag mit der selben Einheit wie eines der bereits gefundenen Zutaten mit demselben Namen?
    const foundIngredientAvailableWithSameUnitAsInConversion = allAvailable.find(
      (ingredientAvailable) =>
        ingredientConversion.conversions.some((ingredientsConversion) =>
          compareText(ingredientsConversion.unit, ingredientAvailable.unit)
        )
    );

    // Keine verfügbare Zutat mit der gleichen Einheit wie eine Umrechnung der Ausgangszutat
    if (!foundIngredientAvailableWithSameUnitAsInConversion)
      return foundSomeAvailable
        ? { ratio: -1, ingredientAvailable: foundSomeAvailable }
        : { ratio: 0 };

    // Nochmal die passende Umrechnung zur verfügbaren Zutat holen (Immer vorhanden, da vorher schon gefunden!)
    const foundConversionWithSameUnitOfIngredientAvailable = ingredientConversion.conversions.find(
      (ingredientsConversion) =>
        compareText(
          ingredientsConversion.unit,
          foundIngredientAvailableWithSameUnitAsInConversion.unit
        )
    )!;

    // console.log(
    //   "Verfügbare Zutat",
    //   foundIngredientAvailableWithSameUnitAsInConversion.amount,
    //   foundIngredientAvailableWithSameUnitAsInConversion.unit
    // );
    // console.log(
    //   "Umrechnung d. verfügabren Zutat",
    //   foundConversionWithSameUnitOfIngredientAvailable.amount,
    //   foundConversionWithSameUnitOfIngredientAvailable.unit
    // );
    // console.log(
    //   "Umrechnung d. Ausgangszutat",
    //   ingredientConversionsWithSameUnit.amount,
    //   ingredientConversionsWithSameUnit.unit
    // );
    // console.log("Ausgangszutat", ingredient.amount, ingredient.unit);

    // console.log(
    //   "ZF:",
    //   foundIngredientAvailableWithSameUnitAsInConversion.amount,
    //   foundIngredientAvailableWithSameUnitAsInConversion.unit,
    //   "->",
    //   foundConversionWithSameUnitOfIngredientAvailable.amount,
    //   foundConversionWithSameUnitOfIngredientAvailable.unit,
    //   "->",
    //   ingredientConversionsWithSameUnit.amount,
    //   ingredientConversionsWithSameUnit.unit,
    //   "->",
    //   ingredient.amount,
    //   ingredient.unit
    // );

    const availableValueToCompare =
      foundConversionWithSameUnitOfIngredientAvailable.amount /
      foundConversionWithSameUnitOfIngredientAvailable.factor;

    const ingredientValueToCompare =
      ingredientConversionsWithSameUnit.amount / ingredientConversionsWithSameUnit.factor;

    const proportion =
      foundIngredientAvailableWithSameUnitAsInConversion.amount / availableValueToCompare; // bekomme das verhältnis

    const ingredientAvailable = cloneDeep(foundIngredientAvailableWithSameUnitAsInConversion);
    ingredientAvailable.note = "";

    return {
      ratio: (ingredientValueToCompare * proportion) / ingredient.amount,
      ingredientAvailable,
    };
  }

  static getIngredientsOfMultilineText(
    text: string,
    ingredientsConversion: IngredientConversion[]
  ): Ingredient[] {
    // Alle Zeilen durchgehen und nach Zutaten suchen
    const ingredients: Ingredient[] = [];

    let lines = text.split("\n");

    // Jede gerade Zeile beginnt mit einer Zahl
    const everyEvenLineHasDigitPercentage =
      lines.filter((line, index) => (index % 2 ? true : line.match(/^\d/))).length / lines.length;

    // Jede ungerade Zeile beginnt mit Text
    const everyOddLineHasDigitPercentage =
      lines.filter((line, index) => (index % 2 ? line.match(RegExp(/^[a-z]/, "gi")) : true))
        .length / lines.length;

    if (everyEvenLineHasDigitPercentage > 0.7 && everyOddLineHasDigitPercentage > 0.7) {
      lines = combinePairsInList(lines);
    }

    lines.forEach((line) => {
      const ingredient = Ingredient.parse(line);
      if (ingredient) {
        const ingr = IngredientConversion.findIngredientConversion(
          ingredient.name,
          ingredientsConversion
        );
        if (ingr) ingredient.name = ingr.name;
        ingredients.push(ingredient);
      }
    });

    return ingredients;
  }

  static addIngredientsToInstructions(
    ingredients: Ingredient[],
    instructions: Instruction[]
  ): Instruction[] {
    // --- Zutaten im Zubereitungstext finden und hinzufügen ---
    instructions.forEach((instruction) => {
      ingredients.forEach((ingredient, index) => {
        if (
          // Zutat kommt im Text vor
          RegExp(
            escapeRegExp(ingredient.name.toLowerCase().split(/(,|\()/)[0]) + "($|\\W)",
            "gi"
          ).test(instruction.text) &&
          // instruction.text
          //   .toLowerCase()
          //   .includes(ingredient.name.toLowerCase().split(/(,|\()/)[0]) &&
          // Noch nicht in der Liste der Zutaten vorhanden
          !instruction.ingredients.some((ingr) => ingr.name === ingredient.name.split(/(,|\()/)[0])
        ) {
          // Wenn Zutat hinzugfügt wird,
          // dann aus der Liste entfernen
          ingredients.splice(index, 1);
          instruction.ingredients.push(ingredient);
        }
      });
    });

    // --- Übrig gebliebene Zutaten hinzufügen ---
    ingredients.forEach((ingredient) => {
      // Wenn Zutat nicht in irgendeinem Zubereitungsschritt vorhanden ist,
      // dann zur ersten Zubereitung hinzufügen
      if (
        instructions.length > 0 &&
        !instructions.some((instruction) =>
          instruction.ingredients.some(
            (ingr) => new Ingredient(ingr).equalAll(ingredient)
            // Zutatenüberschriften, die im Text nicht vorkamen,
            // werden nicht hinzugefügt
          )
        ) &&
        !ingredient.name.match(/:$/)
      ) {
        instructions[0].ingredients.push(ingredient);
      }
    });

    return instructions;
  }

  static getIngredient(ingredient: Ingredient | string) {
    return typeof ingredient === "string"
      ? new Ingredient({ name: ingredient })
      : new Ingredient(ingredient);
  }

  static findIngredientWithNameBySearchText(
    searchText: string,
    ingredients: Ingredient[],
    ingredientsConversion: IngredientConversion[] | null = [],
    locale: string
  ): string {
    if (searchText?.trim().length <= 2) {
      return "";
    }

    const longestString = getLongestString(searchText.split(" "));

    const ingredientList = ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(longestString.toLowerCase())
    );

    if (!ingredientList.length) {
      return "";
    }

    const count = ingredientList.length - 1 > 0 ? ` (+${ingredientList.length - 1})` : "";

    return (
      new Ingredient(ingredientList[0]).getIngredientString(locale, ingredientsConversion ?? []) +
      count
    );
  }

  static findIngredientInListByName(
    name: string,
    ingredients: Ingredient[]
  ): Ingredient | undefined {
    return ingredients.find((ingr) => ingr.name.toLowerCase() === name.toLowerCase());
  }

  static findIngredientInListByIngredient(
    ingredient: Ingredient,
    ingredients: Ingredient[]
  ): Ingredient | undefined {
    const i = new Ingredient(ingredient);
    return ingredients.find((ingr) => i.equalAll(ingr));
  }
}
