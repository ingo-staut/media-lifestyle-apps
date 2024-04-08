import { Injectable } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Observable, take } from "rxjs";
import { DialogReturnData } from "shared/models/dialog.type";
import { FunctionsDialogData } from "../../dialogs/functions-dialog/functions-dialog.component";
import { FunctionsBottomSheetComponent } from "./functions-bottom-sheet.component";

@Injectable({
  providedIn: "root",
})
export class FunctionsBottomSheetService {
  isBottomSheetOpen = false;

  constructor(private _bottomSheet: MatBottomSheet) {}

  open(data: FunctionsDialogData): Observable<DialogReturnData> {
    history.pushState(null, document.title, location.href);
    window.addEventListener("popstate", () => {
      if (this.isBottomSheetOpen) this._bottomSheet.dismiss();
    });

    this.isBottomSheetOpen = true;

    return this._bottomSheet
      .open(FunctionsBottomSheetComponent, {
        data,
      })
      .afterDismissed()
      .pipe(take(1));
  }
}
