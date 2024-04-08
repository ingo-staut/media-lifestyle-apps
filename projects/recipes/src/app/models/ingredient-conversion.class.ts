import { cloneDeep } from "lodash";
import { compareText } from "shared/utils/string";
import { CONTENTS } from "../data/ingredient-contents.data";
import { Conversion } from "./conversion.type";
import {
  IngredientConversionContentState,
  IngredientConversionContentType,
} from "./enum/ingredient-conversion-content.enum";
import { ItemType } from "./enum/item.enum";
import { IngredientConversionContent } from "./ingredient-conversion-content.type";
import { Ingredient } from "./ingredient.class";

export class IngredientConversion {
  id: string;
  name: string;
  emoji: string;
  conversions: Conversion[];
  alternativeNames: string[];
  type: ItemType;
  contents: IngredientConversionContent[];
  storeNumbers: { number: number; store: string }[];

  constructor(ingredientConversion: {
    id: string;
    name: string;
    emoji?: string;
    conversions: Conversion[];
    alternativeNames?: string[];
    type?: ItemType;
    contents?: IngredientConversionContent[];
    storeNumbers?: { number: number; store: string }[];
  }) {
    this.id = ingredientConversion.id;
    this.name = ingredientConversion.name;
    this.emoji = ingredientConversion.emoji ?? "";
    this.conversions = ingredientConversion.conversions;
    this.alternativeNames = ingredientConversion.alternativeNames ?? [];
    this.type = ingredientConversion.type ?? ItemType.FOOD;
    this.contents = ingredientConversion.contents ?? [];
    this.storeNumbers = ingredientConversion.storeNumbers ?? [];
  }

  get filteredContents() {
    return this.contents.filter(
      (item) =>
        item.state !== IngredientConversionContentState.NO &&
        item.state !== IngredientConversionContentState.WITHOUT
    );
  }

  get isVegan() {
    return this.filteredContents.every(
      (item) =>
        item.type !== IngredientConversionContentType.EGG &&
        item.type !== IngredientConversionContentType.FISH &&
        item.type !== IngredientConversionContentType.MEAT &&
        item.type !== IngredientConversionContentType.LACTOSE
    );
  }

  get isVegetarian() {
    return this.filteredContents.every(
      (item) =>
        item.type !== IngredientConversionContentType.MEAT &&
        item.type !== IngredientConversionContentType.FISH
    );
  }

  get containsAlcohol() {
    return this.filteredContents.some(
      (item) => item.type === IngredientConversionContentType.ALCOHOL
    );
  }

  get containsSugar() {
    return this.filteredContents.some(
      (item) => item.type === IngredientConversionContentType.SUGAR
    );
  }

  get containsLactose() {
    return this.filteredContents.some(
      (item) => item.type === IngredientConversionContentType.LACTOSE
    );
  }

  get containsFructose() {
    return this.filteredContents.some(
      (item) => item.type === IngredientConversionContentType.FRUCTOSE
    );
  }

  get containsGluten() {
    return this.filteredContents.some(
      (item) => item.type === IngredientConversionContentType.GLUTEN
    );
  }

  get mostlyContentsType(): IngredientConversionContentType {
    const filtered = this.filteredContents;
    if (filtered.length === 1) return filtered[0].type;

    if (filtered.some((item) => item.type === IngredientConversionContentType.ALCOHOL))
      return IngredientConversionContentType.ALCOHOL;

    if (filtered.some((item) => item.type === IngredientConversionContentType.SUGAR))
      return IngredientConversionContentType.SUGAR;

    if (filtered.some((item) => item.type === IngredientConversionContentType.FRUCTOSE))
      return IngredientConversionContentType.FRUCTOSE;

    if (filtered.some((item) => item.type === IngredientConversionContentType.GLUTEN))
      return IngredientConversionContentType.GLUTEN;

    if (filtered.some((item) => item.type === IngredientConversionContentType.LACTOSE))
      return IngredientConversionContentType.LACTOSE;

    if (filtered.some((item) => item.type === IngredientConversionContentType.EGG))
      return IngredientConversionContentType.EGG;

    if (filtered.some((item) => item.type === IngredientConversionContentType.MEAT))
      return IngredientConversionContentType.MEAT;

    if (filtered.some((item) => item.type === IngredientConversionContentType.FISH))
      return IngredientConversionContentType.FISH;

    if (this.isVegan) return IngredientConversionContentType.VEGAN;

    if (this.isVegetarian) return IngredientConversionContentType.VEGETARIAN;

    return IngredientConversionContentType.NO;
  }

  get mostlyContentsTypeObject() {
    return CONTENTS.get(this.mostlyContentsType);
  }

  static findIngredientConversion(
    name: string,
    ingredientsConversion: IngredientConversion[]
  ): IngredientConversion | undefined {
    if (!name || !ingredientsConversion.length) return undefined;

    return ingredientsConversion.find((ingredientsConversion) =>
      compareText(
        name,
        ingredientsConversion.name,
        ingredientsConversion.alternativeNames,
        Ingredient.SEPARATORS
      )
    );
  }

  static customSort(inputUnit?: string): (a: Conversion, b: Conversion) => number {
    return function (a: Conversion, b: Conversion): number {
      // Put the inputUnit first
      if (inputUnit && a.unit === inputUnit && b.unit !== inputUnit) return -1;
      if (inputUnit && a.unit !== inputUnit && b.unit === inputUnit) return 1;

      // Sort by unit alphabetically if not the input unit
      if (a.unit < b.unit) return -1;
      if (a.unit > b.unit) return 1;

      // If units are the same, sort by factor
      if (a.factor === 1 && b.factor !== 1) return -1;
      if (a.factor !== 1 && b.factor === 1) return 1;

      // If units and factors are the same, maintain original order
      return 0;
    };
  }

  static getMostFittingPrices(
    ingredient: Ingredient,
    portions: number,
    ingredientsConversion: IngredientConversion[]
  ): { normal: number; perPortion: number; max: number } | null {
    const { name, amount, unit } = ingredient;
    const conversion = IngredientConversion.findIngredientConversion(name, ingredientsConversion);

    if (!conversion || !portions) return null;

    let normal = 0;
    let perPortion = 0;
    let max = 0;

    conversion?.conversions.forEach((conversion) => {
      if (!conversion.costs.length) return;

      if (conversion.unit?.toLowerCase() === unit.toLowerCase()) {
        const factor = amount / conversion.amount; // 400 g / 200 g
        const maxCost = Math.max(...conversion.costs);
        max = maxCost * (factor > 1 ? Math.ceil(factor) : 1);
        normal = maxCost * factor;
        perPortion = normal / portions;
      }
    });

    if (normal) return { normal, perPortion, max };

    const costs = conversion.conversions.map((o) => o.costs).flat();
    if (!costs.length) return null;

    const maxCost = Math.max(...costs);
    return { normal: maxCost, perPortion: maxCost / portions, max: maxCost };
  }

  static filterIngredientsWithAdditionalMinusAvailable(
    ingredientsAdditional: Ingredient[],
    ingredientsFromRecipes: Ingredient[],
    ingredientsAvailable: Ingredient[],
    ingredientsConversion: IngredientConversion[]
  ) {
    return Ingredient.combineIngredients(
      // Zusätzliche Zutaten vor den Rezeptzutaten
      cloneDeep(ingredientsAdditional).concat(cloneDeep(ingredientsFromRecipes))
    )
      .map((ingredientOnList) => {
        const isAvailable = Ingredient.isIngredientAvailable(
          ingredientOnList,
          ingredientsAvailable,
          ingredientsConversion
        );
        const ratio = isAvailable.ratio;

        // Einheit passt nicht
        // UND bei der Zutat auf der Einkaufsliste
        // - gibt es keine Einheit
        // - gibt es keine Anzahl
        if (ratio < 0 && ingredientOnList.unit === "" && ingredientOnList.amount === 0) {
          // Zutat muss nicht eingekauft werden
          ingredientOnList.amount = -1;
          return ingredientOnList;
        }

        // Nicht vorhanden
        if (ratio === 0) {
          return ingredientOnList;
        }

        // 100% vorhanden
        if (ratio >= 1) {
          ingredientOnList.amount = -1;
          return ingredientOnList;
        }

        // x% vorhanden
        if (ratio > 0) {
          ingredientOnList.amount = ingredientOnList.amount * isAvailable.ratio;
          return ingredientOnList;
        }

        console.error("Dieser Bereich sollte nie auftauchen!", ratio);
        return ingredientOnList;
      })
      .filter((ingr) => ingr.amount >= 0);
  }
}
