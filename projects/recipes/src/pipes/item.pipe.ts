import { Pipe, PipeTransform } from "@angular/core";
import { ItemType } from "../app/models/enum/item.enum";
import { IngredientConversion } from "../app/models/ingredient-conversion.class";
import { Item } from "../app/models/item.class";

@Pipe({
  name: "item",
})
export class ItemPipe implements PipeTransform {
  transform(item: Item, ingredientsConversion?: IngredientConversion[] | null): string {
    return new Item(item).getItemDisplayString(ingredientsConversion);
  }
}

@Pipe({
  name: "hasItemStructure",
})
export class HasItemStructurePipe implements PipeTransform {
  transform(value: any): boolean {
    if (typeof value === "string") return !!value.trim().match(/^(\d+)x /i); // "2x " am Anfang
    if (value instanceof Item) return true;
    else return false;
  }
}

@Pipe({
  name: "itemTypeIcon",
})
export class ItemTypeIconPipe implements PipeTransform {
  transform(item: ItemType): string {
    return item === ItemType.THING ? "thing" : "ingredient";
  }
}

@Pipe({
  name: "showAddToConversionButton",
})
export class ShowAddToConversionPipe implements PipeTransform {
  transform(item: Item, ingredientsConversion: IngredientConversion[] | null): boolean {
    if (!ingredientsConversion) return false;
    return !IngredientConversion.findIngredientConversion(item.name, ingredientsConversion);
  }
}
