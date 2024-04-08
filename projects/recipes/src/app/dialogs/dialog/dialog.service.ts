import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { take } from "rxjs";
import { DialogData, DialogReturnData } from "shared/models/dialog.type";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { BottomSheetService } from "../../bottom-sheets/bottom-sheet/bottom-sheet.service";
import { DialogComponent } from "./dialog.component";

@Injectable({
  providedIn: "root",
})
export class DialogService {
  private isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialog: MatDialog, private bottomSheetService: BottomSheetService) {}

  open<ItemType>(data: DialogData<ItemType>, bottomSheetIfSmallScreen = true) {
    if (this.isSmallScreen.matches && bottomSheetIfSmallScreen) {
      return this.bottomSheetService.open(data).pipe(take(1));
    } else {
      return this.dialog
        .open<DialogComponent, any, DialogReturnData>(DialogComponent, {
          data,
          panelClass: "light-background",
          minWidth: "500px",
          maxWidth: "600px",
          autoFocus: "first-tabbable",
          closeOnNavigation: false,
        })
        .afterClosed()
        .pipe(take(1));
    }
  }
}
