import { TranslateService } from "@ngx-translate/core";
import { DateFns } from "shared/utils/date-fns";
import {
  cleanString,
  firstCharToTitleCase,
  getPriceOfString,
  splitTags,
} from "shared/utils/string";
import { getNewUUID } from "shared/utils/uuid";
import { getAllSearchTerms } from "../../utils/translation";
import { ItemType } from "./enum/item.enum";
import { IngredientConversion } from "./ingredient-conversion.class";
import { Item } from "./item.class";

export class Purchase {
  id: string;
  date: Date;
  price: number;
  store: string;
  note: string;
  items: Item[];
  type: ItemType;

  // Nicht mit in die Datenbank
  _lastAdded: Date;

  constructor(purchase: {
    id?: string;
    date?: Date;
    price?: number;
    store?: string;
    note?: string;
    items?: Item[];
    type?: ItemType;
  }) {
    this.id = purchase.id ?? getNewUUID();
    this.date = purchase.date ?? new Date();
    this.price = purchase.price ?? 0;
    this.store = purchase.store ?? "";
    this.note = purchase.note ?? "";
    this.items = purchase.items ?? [];
    this.type = purchase.type ?? ItemType.FOOD;
  }

  static parse(
    value: string,
    stores: string[],
    ingredientsConversion: IngredientConversion[],
    defaultType: ItemType,
    translateService: TranslateService
  ): Purchase {
    const values = splitTags(value, ",");

    let date: Date | null = null;
    let price: number | null = null;
    let type: ItemType | null = null;
    let store: string | null = null;

    const indexUsed = new Set<number>();

    values.forEach((v, index) => {
      if (!date) {
        date = DateFns.getDateOfString(v, translateService);
        if (date) {
          indexUsed.add(index);
        }
      }

      if (!price) {
        price = getPriceOfString(v);
        // Wert "0" ist gültig
        if (price !== null) {
          indexUsed.add(index);
        }
      }

      if (!type) {
        type = Purchase.findPurchaseType(v);
        if (type) {
          indexUsed.add(index);
        }
      }

      if (!store) {
        store = stores.find((s) => s.toLowerCase() === v.toLowerCase()) ?? null;
        if (store) {
          indexUsed.add(index);
        }
      }
    });

    if (!date) date = new Date();
    if (!price || Number.isNaN(price)) price = 0;
    if (!type) type = defaultType;

    const valuesLeft = values.filter((_, index) => !indexUsed.has(index));

    // Zutaten erkennen und hinzufügen
    // Verhindert, dass wenn der Laden nicht erkannt wird,
    // eines der Zutaten verwendet wird
    const items: Item[] = [];
    valuesLeft.forEach((value, index, array) => {
      const item = Item.findItem(value, ingredientsConversion);
      if (item) {
        items.push(item);
        array.splice(index, 1);
      }
    });

    // Falls kein Store gefunden wurde, den ersten Eintrag als Store verwenden
    if (!store) {
      store =
        valuesLeft.length >= 1 ? cleanString(firstCharToTitleCase(valuesLeft.shift() ?? "")) : "";
    }

    // Restliche Items hinzufügen
    valuesLeft.forEach((v) => items.push(Item.parse(v)));

    return new Purchase({
      date,
      price,
      store,
      items,
      type,
    });
  }

  static findPurchaseType(text: string): ItemType | null {
    text = text.trim().toLowerCase();
    if (!text) return null;

    const thingTerms = getAllSearchTerms("THING").map((item) => item.toLowerCase());
    const foodTerms = getAllSearchTerms("FOOD").map((food) => food.toLowerCase());

    const isThing = thingTerms.some((term) => term === text);
    if (isThing) {
      return ItemType.THING;
    }

    const isFood = foodTerms.some((term) => term === text);
    if (isFood) {
      return ItemType.FOOD;
    }

    return null;
  }
}
