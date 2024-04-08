import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogTitlesService {
  constructor(private dialogService: DialogService) {}

  open(media: Media) {
    const { name, nameOriginal: originalName } = media;

    const data: DialogData = {
      title: "TITLE",
      icons: ["rename"],
      textInputs: [
        {
          text: name,
          icon: "rename",
          placeholder: "TITLE",
          required: true,
        },
        {
          text: originalName,
          icon: "rename",
          placeholder: "TITLE_ORIGINAL",
        },
      ],
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          return { name: result.textInputs[0], nameOriginal: result.textInputs[1] };
        } else {
          return undefined;
        }
      })
    );
  }
}
