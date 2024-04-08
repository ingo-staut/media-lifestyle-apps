import { Pipe, PipeTransform } from "@angular/core";
import { Item } from "../app/models/item.class";

@Pipe({
  name: "purchaseItemsCount",
})
export class PurchaseItemsCountPipe implements PipeTransform {
  transform(items: Item[]): number {
    return items.reduce((acc, item) => (acc += item.quantity), 0);
  }
}
