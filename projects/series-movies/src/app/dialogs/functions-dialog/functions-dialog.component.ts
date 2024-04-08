import { Component, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DialogAction } from "shared/models/dialog-action.type";
import { DialogComponent } from "../dialog/dialog.component";

export type FunctionsDialogData = {
  title: string;
  titleReplace?: any;
  text?: string;
  textReplace?: any;
  actions?: DialogAction[];
  actionClose?: boolean;
  showAsList?: boolean;
};

@Component({
  selector: "app-functions-dialog",
  templateUrl: "./functions-dialog.component.html",
  styleUrls: ["./functions-dialog.component.scss"],
})
export class FunctionsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FunctionsDialogData,
    private formBuilder: FormBuilder
  ) {}

  onActionClick(action: DialogAction) {
    this.dialogRef.close(action.key);
  }

  onClose() {
    this.dialogRef.close();
  }
}
