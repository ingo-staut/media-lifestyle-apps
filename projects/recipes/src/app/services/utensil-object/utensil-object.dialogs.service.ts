import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { UtensilObject } from "../../models/utensil-object.class";
import { UtensilObjectApiService } from "./utensil-object.api.service";

@Injectable({
  providedIn: "root",
})
export class UtensilObjectDialogsService {
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(
    private dialogService: DialogService,
    private utensilObjectApiService: UtensilObjectApiService
  ) {}

  openEditUtensilObjectDialog(utensilObject: UtensilObject) {
    const data: DialogData = {
      title: "UTENSIL_OBJECT.EDIT",
      icons: ["utensil"],
      textInputs: [
        {
          text: utensilObject.name,
          icon: "rename",
          placeholder: "TITLE",
          required: true,
          order: 1,
        },
      ],
      numberInputs: [
        {
          number: utensilObject.effort,
          icon: "portion",
          placeholder: "EFFORT",
          max: 10,
          showSlider: true,
          required: true,
          order: 2,
        },
      ],
      itemsInputs: [
        {
          placeholder: "ALTERNATIVE_NAMES",
          items: utensilObject.alternativeNames,
          addIconWhenBigButton: "rename",
          showDeleteButton: true,
          maxHeight: 160,
          order: 3,
        },
        {
          placeholder: "SEARCH_TERMS",
          items: utensilObject.searchNames,
          addIconWhenBigButton: "search",
          order: 4,
        },
      ],
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return null;

        const newUtensilObject = new UtensilObject({
          ...utensilObject,
          name: result.textInputs[0],
          effort: result.numberInputs[0],
          alternativeNames: result.itemsInputs[0],
          searchNames: result.itemsInputs[1],
        });

        if (result.actionApply) {
          return newUtensilObject;
        }

        return null;
      })
    );
  }

  openEditUtensilObjectDialogSaveAndReload(utensilObject: UtensilObject) {
    this.openEditUtensilObjectDialog(utensilObject).subscribe((result) => {
      if (!result) return;

      this.utensilObjectApiService.updateUtensilObject(result);
    });
  }
}
