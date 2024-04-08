import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { MediaEnum } from "../../../../../../shared/models/enum/media.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogRewatchService {
  constructor(private dialogService: DialogService) {}

  open(media: Media) {
    const { rewatch, type } = media;

    const add = rewatch === 0;
    const data: DialogData = {
      title: "REWATCH",
      icons: ["watch"],
      numberInputs: [
        {
          number: rewatch || null,
          icon: "watch",
          placeholder: "REWATCH",
          showSlider: true,
          sliderSteps: 1,
          sliderMax: type === MediaEnum.SERIES ? 5 : 10,
          suffixLong: "x",
          suffixShort: "x",
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
            return 0;
          }
          return result.numberInputs[0];
        } else {
          return undefined;
        }
      })
    );
  }
}
