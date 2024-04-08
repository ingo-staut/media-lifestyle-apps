import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { combineLatest, map, startWith } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { ITEM_DATA } from "../../data/item.data";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientConversionCompleterService } from "../ingredient/ingredient-conversion.completer.service";
import { PurchaseApiService } from "./purchase.api.service";

@Injectable({
  providedIn: "root",
})
export class PurchaseCompleterService {
  constructor(
    private translateService: TranslateService,
    private purchaseApiService: PurchaseApiService,
    private ingredientConversionCompleterService: IngredientConversionCompleterService
  ) {}

  completerListItemTypes$ = this.translateService.onLangChange.pipe(
    startWith(null),
    map(() => {
      return ITEM_DATA.map((item) => {
        const data: CompleterEntry = {
          text: this.translateService.instant(item.name),
          icons: [item.icon],
        };
        return data;
      });
    })
  );

  completerListItems$ = combineLatest([
    this.ingredientConversionCompleterService.completerListIngredientsConversionNames$,
    this.purchaseApiService.purchases$,
  ]).pipe(
    map(([completerConversions, purchase]) => {
      const completer = completerConversions;
      purchase.forEach((purchase) => {
        const { type } = purchase;
        purchase.items.forEach((item) => {
          if (!completer.some((c) => c.text.toLowerCase() === item.name.toLowerCase())) {
            const data: CompleterEntry = {
              text: item.name,
              icons: type === ItemType.FOOD ? ["shopping-cart"] : ["thing"],
            };
            completer.push(data);
          }
        });
      });

      return completer;
    })
  );
}
