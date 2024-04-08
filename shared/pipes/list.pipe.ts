import { Pipe, PipeTransform } from "@angular/core";
import { IngredientConversion } from "../../projects/recipes/src/app/models/ingredient-conversion.class";
import { Ingredient } from "../../projects/recipes/src/app/models/ingredient.class";
import { Item } from "../../projects/recipes/src/app/models/item.class";

@Pipe({
  name: "listItem",
})
export class ListItemPipe implements PipeTransform {
  transform<ValueType>(
    value: ValueType,
    ingredientsConversion?: IngredientConversion[] | null
  ): string {
    return typeof value === "string"
      ? value
      : new Item(value as Item).getItemDisplayString(ingredientsConversion);
  }
}

@Pipe({
  name: "listItemName",
})
export class ListItemNamePipe implements PipeTransform {
  transform<ValueType>(value: ValueType): string {
    return typeof value === "string" ? value : new Item(value as Item).name;
  }
}

@Pipe({
  name: "itemInList",
  // pure: false, // Änderungen in Array "ingredients" werden erkannt
})
export class ItemInListPipe implements PipeTransform {
  transform<ValueType>(
    item: ValueType,
    equalFunction: (val1: ValueType, val2: ValueType) => boolean,
    list?: ValueType[] | null
  ): boolean {
    if (!list || !list.length || !equalFunction) return false;
    return list.some((ingr) => equalFunction(ingr, item));
  }
}

@Pipe({
  name: "itemInListDisplayText",
})
export class ItemInListDisplayTextPipe implements PipeTransform {
  transform(item: any): string {
    if (typeof item === "string") return item;
    if (typeof item === "object" && item && "name" in item! && typeof item.name === "string")
      return item.name;
    return "";
  }
}

@Pipe({
  name: "indexInList",
})
export class IndexInListPipe implements PipeTransform {
  transform(item: Ingredient, ingredients: Ingredient[]): number {
    return ingredients.findIndex((ingredient) => new Ingredient(ingredient).equalAll(item));
  }
}

@Pipe({
  name: "join",
})
export class JoinPipe implements PipeTransform {
  transform(list: string[], separator: string): string {
    return list.join(separator);
  }
}
