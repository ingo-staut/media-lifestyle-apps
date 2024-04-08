import { Injectable } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Observable, take } from "rxjs";
import {
  PurchaseToAdditionalIngredientsDialogData,
  PurchaseToAdditionalIngredientsDialogReturnData,
} from "../../dialogs/purchase-to-additional-ingredients-dialog/purchase-to-additional-ingredients-dialog.service";
import { PurchaseToAdditionalIngredientsBottomSheetComponent } from "./purchase-to-additional-ingredients-bottom-sheet.component";

@Injectable({
  providedIn: "root",
})
export class PurchaseToAdditionalIngredientsBottomSheetService {
  isBottomSheetOpen = false;

  constructor(private _bottomSheet: MatBottomSheet) {}

  open(
    data: PurchaseToAdditionalIngredientsDialogData
  ): Observable<PurchaseToAdditionalIngredientsDialogReturnData> {
    history.pushState(null, document.title, location.href);
    window.addEventListener("popstate", () => {
      if (this.isBottomSheetOpen) this._bottomSheet.dismiss();
    });

    this.isBottomSheetOpen = true;

    return this._bottomSheet
      .open(PurchaseToAdditionalIngredientsBottomSheetComponent, {
        data,
        autoFocus: "dialog",
        panelClass: "bottom-sheet-normal",
      })
      .afterDismissed()
      .pipe(take(1));
  }
}
