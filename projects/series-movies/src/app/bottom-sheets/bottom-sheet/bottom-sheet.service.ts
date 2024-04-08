import { Injectable } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Observable, take } from "rxjs";
import { DialogData, DialogReturnData } from "shared/models/dialog.type";
import { BottomSheetComponent } from "./bottom-sheet.component";

@Injectable({
  providedIn: "root",
})
export class BottomSheetService {
  isBottomSheetOpen = false;

  constructor(private _bottomSheet: MatBottomSheet) {}

  open<ItemType>(data: DialogData<ItemType>): Observable<DialogReturnData> {
    history.pushState(null, document.title, location.href);
    window.addEventListener("popstate", () => {
      if (this.isBottomSheetOpen) this._bottomSheet.dismiss();
    });

    this.isBottomSheetOpen = true;

    return this._bottomSheet
      .open(BottomSheetComponent, {
        data,
        autoFocus: "dialog",
        panelClass: "bottom-sheet-normal",
      })
      .afterDismissed()
      .pipe(take(1));
  }
}
