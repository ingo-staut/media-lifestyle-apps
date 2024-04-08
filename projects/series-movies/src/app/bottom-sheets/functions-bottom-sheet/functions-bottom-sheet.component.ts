import { Component, Inject } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { DialogAction } from "shared/models/dialog-action.type";
import { FunctionsDialogData } from "../../dialogs/functions-dialog/functions-dialog.component";
import { BottomSheetComponent } from "../bottom-sheet/bottom-sheet.component";

@Component({
  selector: "app-functions-bottom-sheet",
  templateUrl: "./functions-bottom-sheet.component.html",
  styleUrls: ["./functions-bottom-sheet.component.scss"],
})
export class FunctionsBottomSheetComponent {
  constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: FunctionsDialogData
  ) {}

  onActionClick(action: DialogAction) {
    this.bottomSheetRef.dismiss(action.key);
  }

  onClose() {
    this.bottomSheetRef.dismiss();
  }
}
