import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { take } from "rxjs";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import {
  TelevisionDialogComponent,
  TelevisionDialogData,
  TelevisionDialogReturnData,
} from "./television-dialog.component";

@Injectable({
  providedIn: "root",
})
export class TelevisionDialogService {
  private isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialog: MatDialog) {}

  open(data: TelevisionDialogData) {
    return this.dialog
      .open<TelevisionDialogComponent, any, TelevisionDialogReturnData>(TelevisionDialogComponent, {
        data,
        panelClass: "light-background",
        minWidth: this.isSmallScreen.matches ? "100vw" : "500px",
        maxWidth: this.isSmallScreen.matches ? "100vw" : "600px",
        position: this.isSmallScreen.matches ? { bottom: "0px" } : {},
        autoFocus: "dialog",
        closeOnNavigation: false,
      })
      .afterClosed()
      .pipe(take(1));
  }
}
