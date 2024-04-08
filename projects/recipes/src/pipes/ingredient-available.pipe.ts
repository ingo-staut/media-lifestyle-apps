import { Pipe, PipeTransform } from "@angular/core";
import { MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL } from "../app/data/menu-available-ingredients.data";
import { MenuAvailableIngredientsDateUntil } from "../app/models/enum/menu-available-ingredients-date-until.enum";
import { Ingredient } from "../app/models/ingredient.class";
import { findUseUntilCategory } from "./date.pipe";

@Pipe({
  name: "ingredientsAvailableCatgoryLists",
})
export class IngredientsAvailableCatgoryListsPipe implements PipeTransform {
  transform(ingredients: Ingredient[] | null): {
    hideSection: boolean;
    initialIndex: number;
    lists: {
      name: string;
      icon: string;
      ingredients: Ingredient[];
    }[];
  } {
    if (!ingredients || ingredients.length === 0)
      return { hideSection: true, initialIndex: 0, lists: [] };

    const ingredientsWithUseUntil = ingredients.filter((ingredient) => ingredient.useUntil);

    const missed: Ingredient[] = [];
    const next3days: Ingredient[] = [];
    const next7days: Ingredient[] = [];
    const next31days: Ingredient[] = [];
    const future: Ingredient[] = [];

    ingredientsWithUseUntil.forEach((ingredient) => {
      const key = findUseUntilCategory(ingredient.useUntil);

      switch (key) {
        case MenuAvailableIngredientsDateUntil.MISSED:
          missed.push(ingredient);
          break;

        case MenuAvailableIngredientsDateUntil.NEXT_3_DAYS:
          next3days.push(ingredient);
          break;

        case MenuAvailableIngredientsDateUntil.NEXT_7_DAYS:
          next7days.push(ingredient);
          break;

        case MenuAvailableIngredientsDateUntil.NEXT_31_DAYS:
          next31days.push(ingredient);
          break;

        case MenuAvailableIngredientsDateUntil.FUTURE:
          future.push(ingredient);
          break;

        default:
          break;
      }
    });

    const all = [missed, next3days, next7days, next31days, future];

    const initialIndex = all.findIndex((list, index) => list.length > 0 && index > 0);

    return {
      initialIndex: Math.max(initialIndex, 0),
      hideSection: initialIndex === -1 && missed.length === 0,
      lists: all.map((ingredients, index) => {
        const details = MENU_AVAILABLE_INGREDIENTS_DATE_UNTIL[index + 2];
        return {
          name: details.name,
          icon: details.icon,
          ingredients,
        };
      }),
    };
  }
}
