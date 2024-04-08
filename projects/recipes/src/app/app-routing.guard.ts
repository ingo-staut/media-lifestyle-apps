import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Injectable({ providedIn: "root" })
export class CanDeactivateGuard {
  constructor(private dialog: MatDialog) {}

  canDeactivate(): boolean {
    if (this.dialog.openDialogs.length > 0) {
      // Letzten Dialog schließen
      this.dialog.openDialogs.at(-1)?.close();
      return false;
    } else {
      return true;
    }
  }
}
