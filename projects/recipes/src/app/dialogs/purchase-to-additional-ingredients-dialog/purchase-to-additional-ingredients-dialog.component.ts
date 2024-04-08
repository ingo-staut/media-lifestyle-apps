import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { LocaleService } from "shared/services/locale.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { PurchaseToAdditionalIngredientsDialogData } from "./purchase-to-additional-ingredients-dialog.service";

@Component({
  selector: "app-purchase-to-additional-ingredients-dialog",
  templateUrl: "./purchase-to-additional-ingredients-dialog.component.html",
  styleUrls: ["./purchase-to-additional-ingredients-dialog.component.scss"],
})
export class PurchaseToAdditionalIngredientsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<PurchaseToAdditionalIngredientsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PurchaseToAdditionalIngredientsDialogData,
    protected ingredientApiService: IngredientApiService,
    protected localeService: LocaleService
  ) {}

  onApply() {
    // WORKAROUND: Notiz entfernen weil,
    // wenn z.B. 3x Zutat im Einkauf dann als Kommentar in der Liste der verfügbaren Zutaten
    this.data.dataItems = this.data.dataItems.map((item) => {
      if (item.value) item.value.note = "";
      return item;
    });
    this.dialogRef.close({ dataItems: this.data.dataItems });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
