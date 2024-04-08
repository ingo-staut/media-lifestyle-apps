import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogNoteService {
  constructor(private dialogService: DialogService) {}

  open(media: Media) {
    const { note } = media;

    const add = !note;
    const data: DialogData = {
      title: "NOTE.",
      icons: ["note"],
      textInputs: [
        {
          text: note,
          icon: "note",
          placeholder: "NOTE.",
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
            return "";
          }
          return result.textInputs[0];
        } else {
          return undefined;
        }
      })
    );
  }
}
