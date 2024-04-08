import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { UTENSIL_MATERIAL_DROPDOWN_DATA } from "../../data/utensil-material.data";
import { UTENSIL_SIZE_DROPDOWN_DATA } from "../../data/utensil-size.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { UtensilMaterial } from "../../models/enum/utensil-material.enum";
import { UtensilSize } from "../../models/enum/utensil-size.enum";
import { Utensil } from "../../models/utensil.class";

@Injectable({
  providedIn: "root",
})
export class UtensilDialogsService {
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialogService: DialogService) {}

  openAddOrEditUtensilDialog(utensil?: Utensil) {
    const add = !utensil;

    const actions = add
      ? []
      : [
          {
            key: "delete",
            text: "ACTION.DELETE",
            icon: "delete",
            color: "warn",
          },
        ];

    const data: DialogData = {
      title: "UTENSIL." + (add ? "ADD" : "EDIT"),
      icons: ["utensil"],
      textInputs: [
        {
          text: add ? "" : utensil.name,
          icon: "rename",
          placeholder: "TITLE",
          order: 1,
          required: true,
        },
        {
          text: add ? "" : utensil.note,
          icon: "note",
          placeholder: "NOTE.",
          order: 5,
        },
      ],
      numberInputs: [
        {
          number: add ? 1 : utensil?.amount || 1,
          icon: "portion",
          placeholder: "AMOUNT",
          showSlider: true,
          required: true,
          order: 2,
        },
      ],
      toggleGroupInputs: [
        {
          data: UTENSIL_SIZE_DROPDOWN_DATA,
          selectedKey: add ? UtensilSize.NONE : utensil.size,
          showText: !this.isSmallScreen.matches,
          showTextOnlySelected: this.isSmallScreen.matches,
          placeholder: "SIZE.",
          order: 3,
        },
      ],
      dropdownInputs: [
        {
          data: UTENSIL_MATERIAL_DROPDOWN_DATA,
          selectedKey: add ? UtensilMaterial.NONE : utensil.material,
          placeholder: "MATERIAL.",
          order: 4,
        },
      ],
      actionPrimary: {
        key: "apply",
        text: "ACTION." + (add ? "ADD" : "APPLY"),
        icon: add ? "add" : "check",
      },
      actionCancel: true,
      actions,
    };

    return this.dialogService.open(data);
  }

  openAddOrEditUtensilDialogWithUtensilsList(
    utensils: Utensil[],
    parameters?: { utensil?: Utensil; index?: number }
  ) {
    const { utensil, index } = parameters ?? {};
    const add = !utensil;

    return this.openAddOrEditUtensilDialog(utensil).pipe(
      map((result) => {
        if (!result) return utensils;

        const newUtensil = new Utensil({
          ...utensil,
          name: result.textInputs[0],
          note: result.textInputs[1],
          amount: result.numberInputs[0],
          size: result.toggleGroupInputs[0] as UtensilSize,
          material: result.dropdownInputs[0] as UtensilMaterial,
        });

        // Hinzufügen
        if (add) {
          utensils.unshift(newUtensil);
          return utensils;
        }

        // Bearbeiten
        if (result.actionKey === "apply" && index !== undefined) {
          utensils[index] = newUtensil;
          return utensils;
        }

        // Löschen
        else if (result.actionKey === "delete" && index !== undefined) {
          utensils.splice(index, 1);
          return utensils;
        }

        // Default
        else return utensils;
      })
    );
  }
}
