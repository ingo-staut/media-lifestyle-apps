import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { MediaEnum } from "../../../../../../shared/models/enum/media.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogRuntimeService {
  private readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialogService: DialogService) {}

  open(media: Media) {
    const { runtime, type } = media;

    const add = runtime === 0;
    const data: DialogData = {
      title: "RUNTIME.",
      icons: ["time"],
      numberInputs: [
        {
          number: runtime || null,
          icon: "time",
          placeholder: "RUNTIME.",
          showSlider: true,
          hideSliderInitially: !this.isSmallScreen.matches,
          sliderSteps: 5,
          sliderMax: type === MediaEnum.SERIES ? 60 : 180,
          suffixLong: "TIME.MINUTES",
          suffixShort: "TIME.MINUTES_SHORT",
          formatAsDuration: true,
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
