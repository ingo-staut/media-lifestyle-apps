import { Injectable } from "@angular/core";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Store } from "../../models/store.type";
import { StoreApiService } from "./store.api.service";

@Injectable({
  providedIn: "root",
})
export class StoreService {
  constructor(private dialogService: DialogService, private storeApiService: StoreApiService) {}

  openAddOrEditDialog(store?: Store, add?: boolean) {
    // Wenn kein Laden übergeben wird,
    // ist es automatisch hinzufügen
    if (!store) add = true;

    const dialogData: DialogData = {
      title: "STORE." + (add ? "ADD" : "EDIT_WITH_VALUE"),
      titleReplace: { value: store?.name ?? "" },
      icons: ["store"],
      textInputs: [
        // Titel
        {
          text: store?.name ?? "",
          icon: "rename",
          placeholder: "TITLE",
          required: true,
          // Disabled wenn bearbeitet wird
          disabled: !add,
        },
        // Icon
        {
          text: store?.icon ?? "",
          icon: "image",
          placeholder: "IMAGE.",
          funcInputKey: "TITLE",
          func: (text?: string) => {
            if (!text) return;
            window.open(
              "https://www.google.com/search?tbm=isch&q=icon+" + text + "+wiki",
              "_blank"
            );
          },
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    this.dialogService.open(dialogData).subscribe((result) => {
      if (!result) return;

      if (result.actionAddOrApply) {
        const store: Store = {
          name: result.textInputs[0],
          icon: result.textInputs[1],
        };
        this.storeApiService.saveAndReloadStore(store);
      } else if (result.actionDelete && store) {
        this.dialogService
          .open({
            title: "STORE.DELETE_ACTION.TITLE",
            text: "STORE.DELETE_ACTION.TEXT",
            icons: ["delete"],
            actionPrimary: false,
            actionDelete: true,
            actionCancel: true,
          })
          .subscribe((result) => {
            if (result) {
              this.storeApiService.deleteAndReloadStore(store);
            }
          });
      }
    });
  }
}
