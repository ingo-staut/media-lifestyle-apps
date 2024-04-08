import { Injectable } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Observable, take } from "rxjs";
import {
  MenuBottomSheetComponent,
  MenuDialogData,
  MenuDialogReturnData,
} from "./menu-bottom-sheet.component";

@Injectable({
  providedIn: "root",
})
export class MenuBottomSheetService {
  isBottomSheetOpen = false;

  constructor(private _bottomSheet: MatBottomSheet) {}

  open<MenuItemType>(
    data: MenuDialogData<MenuItemType>,
    panelClass?: string
  ): Observable<MenuDialogReturnData<MenuItemType>> {
    history.pushState(null, document.title, location.href);
    window.addEventListener("popstate", () => {
      if (this.isBottomSheetOpen) this._bottomSheet.dismiss();
    });

    this.isBottomSheetOpen = true;

    return this._bottomSheet
      .open(MenuBottomSheetComponent, {
        data,
        panelClass,
      })
      .afterDismissed()
      .pipe(take(1));
  }
}
