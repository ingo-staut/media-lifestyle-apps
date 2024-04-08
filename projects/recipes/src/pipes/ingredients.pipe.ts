import { Pipe, PipeTransform } from "@angular/core";
import { cloneDeep } from "lodash";
import { DropdownData } from "shared/models/dropdown.type";
import { Available, available } from "../app/models/available.type";
import { Conversion, getConversionString } from "../app/models/conversion.type";
import { ItemType } from "../app/models/enum/item.enum";
import { IngredientFilterListSelectedKeys } from "../app/models/filter-ingredients-selected-keys.type";
import { IngredientAvailability } from "../app/models/ingredient-availability.type";
import { IngredientConversion } from "../app/models/ingredient-conversion.class";
import { Ingredient } from "../app/models/ingredient.class";
import { Instruction } from "../app/models/instruction.class";
import { Item } from "../app/models/item.class";

@Pipe({
  name: "ingredientsFromInstructions",
})
export class IngredientsFromInstructionsPipe implements PipeTransform {
  transform(instructions: (Instruction | null)[], locale: string): Ingredient[] {
    return instructions.flatMap(
      (instruction, index) =>
        instruction?.ingredients.map((ingredient) => {
          const ingr = new Ingredient(ingredient);
          ingr.fromWithInstruction = [
            { id: index.toString(), notes: [ingr.getIngredientString(locale)] },
          ];
          return ingr;
        }) ?? []
    );
  }
}

@Pipe({
  name: "showIngredient",
})
export class ShowIngredientPipe implements PipeTransform {
  transform(
    ingredient: Ingredient,
    parameters: {
      ingredientsConversion?: IngredientConversion[] | null;
      ingredientsAvailable?: Ingredient[] | null;
      filterKey?: IngredientFilterListSelectedKeys | null;
    },
    showIngredient: Function
  ): boolean {
    return showIngredient(ingredient, parameters);
  }
}

@Pipe({
  name: "ingredient",
})
export class IngredientPipe implements PipeTransform {
  transform(
    ingredient: Ingredient,
    locale: string,
    ingredientsConversion?: IngredientConversion[] | null,
    optionals?: {
      amountFactor?: number;
      onlyAmountAndUnitAndNote?: boolean;
      hideIngredientNotes?: boolean;
    }
  ): string {
    return new Ingredient(ingredient).getIngredientString(
      locale,
      ingredientsConversion ?? [],
      optionals
    );
  }
}

@Pipe({
  name: "ingredientItemType",
})
export class IngredientItemTypePipe implements PipeTransform {
  transform(
    ingredient: Ingredient,
    ingredientsConversion: IngredientConversion[] | null
  ): ItemType {
    return (
      IngredientConversion.findIngredientConversion(ingredient.name, ingredientsConversion ?? [])
        ?.type ?? ItemType.FOOD
    );
  }
}

@Pipe({
  name: "ingredientAvailability",
})
export class IngredientAvailabilityPipe implements PipeTransform {
  transform(
    ingredient: Ingredient,
    ingredientsAvailable: Ingredient[],
    ingredientsConversion: IngredientConversion[]
  ): IngredientAvailability {
    return new Ingredient(ingredient).isAvailable(ingredientsAvailable, ingredientsConversion);
  }
}

export function findAllPossibleIngredients(
  name: string,
  quantity: number,
  availables: Ingredient[] | null,
  ingredientsConversion: IngredientConversion[] | null,
  locale: string
): { ingredient: Ingredient; icons: string[]; sortValue: number }[] | undefined {
  if (!availables || !ingredientsConversion) return;

  const ingredientsAvailable = Ingredient.findAllIngredientInListByName(
    name,
    availables,
    undefined,
    false
  );

  const ingredientConversion = IngredientConversion.findIngredientConversion(
    name,
    ingredientsConversion
  );

  // ! Sonderfall: Es gibt keine Umrechnung,
  // aber die Unit bei Verfügbar und gerade gekauft stimmen überein (sind beide leer)
  if (!ingredientConversion && ingredientsAvailable) {
    const ingredients = ingredientsAvailable
      ?.filter((ingredientAvailable: Ingredient) => ingredientAvailable.unit === "")
      .flatMap((ingredientAvailable: Ingredient) => {
        return [
          {
            ingredient: new Ingredient({
              name,
              unit: "",
              amount: ingredientAvailable.amount + quantity, // In diesem Fall "+"
            }),
            icons: ["available"],
            sortValue: 4,
          },
          {
            ingredient: new Ingredient({
              name,
              unit: "",
              amount: ingredientAvailable.amount, // In diesem Fall "+"
            }),
            icons: ["ingredient-conversion"],
            sortValue: 3,
          },
        ];
      });

    // Sollte immer eine Zutat sein
    return ingredients?.length
      ? ingredients
      : [{ ingredient: new Ingredient({ name, amount: quantity }), icons: ["add"], sortValue: 1 }];
  }

  // Keine verfügbare Zutat und keine Umrechnung
  if (!ingredientConversion) {
    return [
      { ingredient: new Ingredient({ name, amount: quantity }), icons: ["add"], sortValue: 1 },
    ];
  }

  // Keine verfügbaren Zutaten zur Zutat
  if (!ingredientsAvailable || !ingredientsAvailable.length) {
    // Alle möglichen Umrechnungen
    return ingredientConversion.conversions
      .sort(IngredientConversion.customSort())
      .map((conversion: Conversion) => {
        // Umrechnung
        return {
          ingredient: new Ingredient({
            name,
            unit: conversion.unit,
            amount: conversion.amount * quantity,
            note: quantity > 1 ? getConversionString(conversion, locale) : "",
          }),
          icons: quantity > 1 ? ["factor"] : ["ingredient-conversion"],
          sortValue: quantity > 1 ? 2 : 3,
        };
      });
  }

  return ingredientConversion.conversions.flatMap((conversion) => {
    const withAvailable = ingredientsAvailable.find((c) => c.unit === conversion.unit);

    if (withAvailable) {
      return [
        {
          ingredient: new Ingredient({
            name,
            unit: conversion.unit,
            amount: conversion.amount * quantity + withAvailable.amount,
          }),
          icons: ["available"],
          sortValue: 4,
        },
        {
          ingredient: new Ingredient({
            name,
            unit: conversion.unit,
            amount: conversion.amount * quantity,
            note: quantity > 1 ? getConversionString(conversion, locale) : "",
          }),
          icons: quantity > 1 ? ["factor"] : ["ingredient-conversion"],
          sortValue: quantity > 1 ? 2 : 3,
        },
      ];
    } else {
      return [
        {
          ingredient: new Ingredient({
            name,
            unit: conversion.unit,
            amount: conversion.amount * quantity,
            note: quantity > 1 ? getConversionString(conversion, locale) : "",
          }),
          icons: quantity > 1 ? ["factor"] : ["ingredient-conversion"],
          sortValue: quantity > 1 ? 2 : 3,
        },
      ];
    }
  });
}

@Pipe({
  name: "ingredientsDropdownData",
})
export class IngredientsDropdownDataPipe implements PipeTransform {
  transform(
    item: Item,
    availables: Ingredient[] | null,
    ingredientsConversion: IngredientConversion[] | null,
    locale: string | null
  ) {
    const ingredients = cloneDeep(
      findAllPossibleIngredients(
        item.name,
        item.quantity,
        availables,
        ingredientsConversion,
        locale ?? "de"
      )
    );

    if (!ingredients || !ingredients.length) return;

    ingredients.sort((a, b) => b.sortValue - a.sortValue);

    return ingredients.map((ingredient, index) => {
      const text = new Ingredient(ingredient.ingredient).getIngredientString(
        "de",
        ingredientsConversion ?? [],
        { onlyAmountAndUnitAndNote: true }
      );

      const data: DropdownData<string, Ingredient> = {
        key: index.toString(),
        name: text,
        tooltip: text,
        icon: ingredient.icons[0],
        value: ingredient.ingredient,
      };

      return data;
    });
  }
}

@Pipe({
  name: "availableObject",
})
export class AvailableObjectPipe implements PipeTransform {
  transform(value: number): Available {
    return available(value);
  }
}

@Pipe({
  name: "ingredientIsFromRecipe",
})
export class IngredientIsFromRecipePipe implements PipeTransform {
  transform(ingredient: Ingredient): boolean {
    return ingredient.fromWithRecipe.some((from) => !!from.id);
  }
}

@Pipe({
  name: "ingredientsChecked",
})
export class IngredientsCheckedPipe implements PipeTransform {
  transform(ingredients?: Ingredient[] | null): string | null {
    if (!ingredients) return "";
    const countChecked = ingredients.filter((object) => object._checked).length;
    const count = ingredients.length;

    return countChecked ? `${countChecked}/${count}` : null;
  }
}
