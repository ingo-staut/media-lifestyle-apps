import { cleanString, firstCharToTitleCase } from "shared/utils/string";
import { ItemCategory } from "./enum/item-category.enum";
import { IngredientConversion } from "./ingredient-conversion.class";

export class Item {
  name: string;
  quantity: number;
  category: ItemCategory;

  constructor(item: { name?: string; quantity?: number; category?: ItemCategory }) {
    this.name = item.name ?? "";
    this.quantity = item.quantity || 1;
    this.category = item.category ?? ItemCategory.NONE;
  }

  static parse(text: string): Item {
    // Im Text 2x oder 3x oder 4x usw suchen und wenn es gefunden wird, dann die Anzahl nehmen
    const match = text?.trim().match(/(\d+)x/i);
    if (!match) return new Item({ name: text?.trim() });

    const quantity = +match[1];
    const name = cleanString(firstCharToTitleCase(text.replace(match[0], "")));
    return new Item({ name, quantity });
  }

  static findItem(text: string, items: IngredientConversion[]): Item | null {
    if (!text?.trim()) return null;

    // Im Text 2x oder 3x oder 4x usw suchen und wenn es gefunden wird, dann die Anzahl nehmen
    const match = text.trim().match(/(\d+)x/i);
    if (!match) {
      // find item in items
      const item = items.find((item) => item.name.toLowerCase() === text.toLowerCase());
      if (!item) return null;
      return new Item({ name: item.name, quantity: 1 });
    }

    const quantity = +match[1];
    const name = cleanString(firstCharToTitleCase(text.replace(match[0], "")));
    return new Item({ name, quantity });
  }

  getItemString(): string {
    return this.quantity ? `${this.quantity}x ${this.name}` : this.name;
  }

  getItemDisplayString(ingredientsConversion?: IngredientConversion[] | null): string {
    if (!ingredientsConversion || !ingredientsConversion.length) return this.getItemString();
    const conversion = IngredientConversion.findIngredientConversion(
      this.name,
      ingredientsConversion
    );
    return (
      (conversion && conversion.emoji ? conversion.emoji + " " : "") +
      (this.quantity ? `${this.quantity}x ${this.name}` : this.name)
    );
  }

  static findItemInList(item: Item, list: Item[]): Item | null {
    return list.find((i) => i.name.toLowerCase() === item.name.toLowerCase()) ?? null;
  }
}
