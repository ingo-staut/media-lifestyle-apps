import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { take } from "rxjs";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { FunctionsBottomSheetService } from "../../bottom-sheets/functions-bottom-sheet/functions-bottom-sheet.service";
import { FunctionsDialogComponent, FunctionsDialogData } from "./functions-dialog.component";

@Injectable({
  providedIn: "root",
})
export class FunctionsDialogService {
  private isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(
    private dialog: MatDialog,
    private functionsBottomSheetService: FunctionsBottomSheetService
  ) {}

  open(data: FunctionsDialogData, bottomSheetIfSmallScreen = true) {
    if (this.isSmallScreen.matches && bottomSheetIfSmallScreen) {
      return this.functionsBottomSheetService.open(data).pipe(take(1));
    } else {
      return this.dialog
        .open(FunctionsDialogComponent, {
          data,
          panelClass: "light-background",
          minWidth: "500px",
          autoFocus: false,
          closeOnNavigation: false,
        })
        .afterClosed()
        .pipe(take(1));
    }
  }
}
