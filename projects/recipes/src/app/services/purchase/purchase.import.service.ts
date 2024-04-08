import { Injectable } from "@angular/core";
import { DateFns } from "shared/utils/date-fns";
import { ItemCategory } from "../../models/enum/item-category.enum";
import { ItemType } from "../../models/enum/item.enum";
import { Item } from "../../models/item.class";
import { Purchase } from "../../models/purchase.class";

@Injectable({
  providedIn: "root",
})
export class PurchaseImportService {
  readonly categories: string[] = ["lunch", "work", "gift", "ticket"];

  readInPurchases(text: string, type: ItemType) {
    const purchases = text.split("\n").map((item) => this.readInPurchase(item, type));
    return purchases.filter((item): item is Purchase => !!item);
  }

  readInPurchase(text: string, type: ItemType) {
    const list = text.split("\t");

    const price = +list[0].replace(" €", "").replace(",", ".");
    const store = list[1];
    const date = DateFns.getDateFromString(list[2], "dd.MM.yyyy", new Date());
    const items = list[3].split("; ").map((item) => {
      const category =
        (this.categories
          .find((category) => item.toLowerCase().includes("{" + category + "}"))
          ?.toUpperCase() as ItemCategory) ?? ItemCategory.NONE;
      if (category) {
        item = item.replace("{" + category.toLowerCase() + "}", "").trim();
      }
      const match = item.match(/ ?\[(\d+)\]/);
      if (match) {
        const data = new Item({
          name: item.replace(match[0], "").trim(),
          quantity: +match[1],
          category,
        });
        return data;
      } else {
        const data = new Item({
          name: item,
          quantity: 1,
          category,
        });
        return data;
      }
    });
    const note = list[4];

    if (!date) {
      console.warn({ list, date });
      return;
    }

    return new Purchase({
      price,
      store,
      date,
      items,
      note,
      type,
    });
  }
}
