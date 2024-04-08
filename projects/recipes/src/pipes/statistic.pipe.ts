import { Pipe, PipeTransform } from "@angular/core";
import { IngredientConversion } from "../app/models/ingredient-conversion.class";
import { Purchase } from "../app/models/purchase.class";
import { Store } from "../app/models/store.type";

@Pipe({
  name: "storeCount",
})
export class StoreCountPipe implements PipeTransform {
  transform(purchases?: Purchase[] | null, stores?: Store[] | null) {
    const allStoresWithoutNoImage: {
      storeName: string[];
      count: number;
      image: string;
    } = {
      storeName: [],
      count: 0,
      image: "",
    };

    return countStoresWithSameName(purchases ?? [])
      .map((value) => {
        return {
          ...value,
          image: stores?.find((store) => store.name.toLowerCase() === value.storeName.toLowerCase())
            ?.icon,
        };
      })
      .sort((v1, v2) => v2.count - v1.count)
      .filter((value) => {
        if (!value.image) {
          allStoresWithoutNoImage.storeName.push(value.count.toString() + "x " + value.storeName);
          allStoresWithoutNoImage.count += value.count;
          return false;
        }
        return true;
      })
      .concat({
        ...allStoresWithoutNoImage,
        storeName: allStoresWithoutNoImage.storeName.join(", "),
      })
      .filter((store) => store.count !== 0);
  }
}

function purchaseIsVegan(purchase: Purchase, ingredientsConversion: IngredientConversion[]) {
  return purchase.items.every(
    (item) =>
      IngredientConversion.findIngredientConversion(item.name, ingredientsConversion)?.isVegan ??
      true
  );
}

@Pipe({
  name: "purchasesNotVeganCount",
})
export class PurchasesNotVeganCountPipe implements PipeTransform {
  transform(purchases?: Purchase[] | null, ingredientsConversion?: IngredientConversion[] | null) {
    if (!purchases || !ingredientsConversion) return 0;

    return purchases.reduce(
      (total, purchase) => total + (purchaseIsVegan(purchase, ingredientsConversion) ? 0 : 1),
      0
    );
  }
}

function purchaseItemsAllContainSugar(
  purchase: Purchase,
  ingredientsConversion: IngredientConversion[]
) {
  return purchase.items.every(
    (item) =>
      IngredientConversion.findIngredientConversion(item.name, ingredientsConversion)
        ?.containsSugar ?? true
  );
}

@Pipe({
  name: "purchasesNoSugarCount",
})
export class PurchasesNoSugarCountPipe implements PipeTransform {
  transform(purchases?: Purchase[] | null, ingredientsConversion?: IngredientConversion[] | null) {
    if (!purchases || !ingredientsConversion) return 0;

    return purchases.reduce(
      (total, purchase) =>
        total + (purchaseItemsAllContainSugar(purchase, ingredientsConversion) ? 0 : 1),
      0
    );
  }
}

@Pipe({
  name: "itemsCountFromPurchases",
})
export class itemsCountFromPurchasesPipe implements PipeTransform {
  transform(purchases?: Purchase[] | null) {
    if (!purchases) return null;

    const counts = purchases.reduce(
      (total, purchase) => {
        return {
          itemsCount: total.itemsCount + purchase.items.length,
          total: total.total + purchase.items.reduce((count, item) => count + item.quantity, 0),
        };
      },
      { itemsCount: 0, total: 0 }
    );

    if (counts.itemsCount === 0 || counts.total === 0) return null;

    return counts;
  }
}

@Pipe({
  name: "notesCount",
})
export class NotesCountPipe implements PipeTransform {
  transform(purchases?: Purchase[] | null) {
    if (!purchases) return 0;

    return purchases.reduce((total, purchase) => total + (!!purchase.note ? 1 : 0), 0);
  }
}

@Pipe({
  name: "totalCostOfPurchases",
})
export class TotalCostOfPurchasesPipe implements PipeTransform {
  transform(purchases?: Purchase[] | null) {
    if (!purchases) return 0;

    return purchases.reduce((total, purchase) => total + purchase.price, 0);
  }
}

@Pipe({
  name: "filterPurchasesByDateRange",
})
export class FilterPurchasesByDateRangePipe implements PipeTransform {
  transform(purchases?: Purchase[] | null, start?: Date, end?: Date) {
    if (!purchases || !start || !end) return [];

    return purchases.filter((purchase) => purchase.date >= start && purchase.date <= end);
  }
}

function countStoresWithSameName(purchases: Purchase[]) {
  const storeCounts: { [storeName: string]: number } = {};

  for (const purchase of purchases) {
    const storeName = purchase.store;
    if (storeCounts.hasOwnProperty(storeName)) {
      storeCounts[storeName]++;
    } else {
      storeCounts[storeName] = 1;
    }
  }

  return Object.keys(storeCounts).map((storeName) => ({
    storeName,
    count: storeCounts[storeName],
  }));
}
