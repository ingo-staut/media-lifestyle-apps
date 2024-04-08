import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogAvailableUntilService {
  constructor(private dialogService: DialogService) {}

  open(media: Media) {
    const { availableUntil } = media;

    const add = !availableUntil;

    const data: DialogData = {
      title: "AVAILABLE_UNTIL",
      icons: ["calendar-until"],
      dateInputs: [
        {
          placeholder: "AVAILABLE_UNTIL",
          date: availableUntil ?? null,
          required: true,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          if (result.actionDelete) {
            return null;
          }
          return result.dateInputs[0];
        } else {
          return undefined;
        }
      })
    );
  }
}
