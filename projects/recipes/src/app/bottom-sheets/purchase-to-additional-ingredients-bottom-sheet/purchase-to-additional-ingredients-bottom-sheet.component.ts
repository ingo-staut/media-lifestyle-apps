import { Component, Inject } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { LocaleService } from "shared/services/locale.service";
import { PurchaseToAdditionalIngredientsDialogData } from "../../dialogs/purchase-to-additional-ingredients-dialog/purchase-to-additional-ingredients-dialog.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";

@Component({
  selector: "app-purchase-to-additional-ingredients-bottom-sheet",
  templateUrl: "./purchase-to-additional-ingredients-bottom-sheet.component.html",
  styleUrls: ["./purchase-to-additional-ingredients-bottom-sheet.component.scss"],
})
export class PurchaseToAdditionalIngredientsBottomSheetComponent {
  constructor(
    private bottomSheetRef: MatBottomSheetRef<PurchaseToAdditionalIngredientsBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: PurchaseToAdditionalIngredientsDialogData,
    protected ingredientApiService: IngredientApiService,
    protected localeService: LocaleService
  ) {}

  onApply() {
    this.bottomSheetRef.dismiss(this.data);
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }
}
