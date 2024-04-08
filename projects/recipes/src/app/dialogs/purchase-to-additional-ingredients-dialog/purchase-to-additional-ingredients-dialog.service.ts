import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { map, take, tap } from "rxjs";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { PurchaseToAdditionalIngredientsBottomSheetService } from "../../bottom-sheets/purchase-to-additional-ingredients-bottom-sheet/purchase-to-additional-ingredients-bottom-sheet.service";
import { Ingredient } from "../../models/ingredient.class";
import { Item } from "../../models/item.class";
import { PurchaseToAdditionalIngredientsDialogComponent } from "./purchase-to-additional-ingredients-dialog.component";

export type PurchaseToAdditionalIngredientsDialogData = {
  dataItems: DataItem[];
};

export type PurchaseToAdditionalIngredientsDialogReturnData = {
  dataItems: DataItem[];
};

export type DataItem = {
  item: Item;
  value?: Ingredient;
  change: boolean;
  key?: string;
};

@Injectable({
  providedIn: "root",
})
export class PurchaseToAdditionalIngredientsDialogService {
  private isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(
    private dialog: MatDialog,
    private bottomSheetService: PurchaseToAdditionalIngredientsBottomSheetService
  ) {}

  open(items: Item[], bottomSheetIfSmallScreen = true) {
    const dataItems: DataItem[] = items.map((item) => {
      return { item, change: true };
    });

    const data = { dataItems };

    const observable =
      this.isSmallScreen.matches && bottomSheetIfSmallScreen
        ? this.bottomSheetService.open(data)
        : this.dialog
            .open<
              PurchaseToAdditionalIngredientsDialogComponent,
              PurchaseToAdditionalIngredientsDialogData,
              PurchaseToAdditionalIngredientsDialogReturnData
            >(PurchaseToAdditionalIngredientsDialogComponent, {
              data,
              panelClass: "light-background",
              minWidth: "500px",
              maxWidth: "600px",
              autoFocus: false,
              closeOnNavigation: false,
            })
            .afterClosed();

    return observable.pipe(
      take(1),
      map((data) => data?.dataItems),
      map((data) => {
        if (!data) return;

        return (
          data
            // Nur geänderte
            .filter((item) => item.change)
            // Item zu Ingredient
            .map((item) => item.value)
        );
      }),
      tap((data) => {
        console.log("Daten", data);
      })
    );
  }
}
