import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { NumberInput } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogYearsService {
  private readonly yearMin = 1900;
  private readonly yearSliderMin = 2000;

  private readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialogService: DialogService) {}

  open(media: Media) {
    const { yearStart, yearEnd } = media;

    const yearMax = new Date().getFullYear() + 2;

    const add = yearStart === 0 && yearEnd === 0;

    const numberInputs: NumberInput[] = [
      {
        number: yearStart || null,
        icon: media.isMovie ? "calendar" : "calendar-start",
        placeholder: media.isMovie ? "YEAR.PUBLICATION" : "YEAR.START.",
        showSlider: true,
        hideSliderInitially: !this.isSmallScreen.matches,
        sliderSteps: 1,
        min: this.yearMin,
        max: yearMax,
        sliderMin: this.yearSliderMin,
        sliderMax: yearMax,
        required: true,
        sliderNoNumberFormatting: true,
      },
    ];

    if (!media.isMovie) {
      const yearEndInput: NumberInput = {
        number: yearEnd || null,
        icon: "calendar-end",
        placeholder: "YEAR.END.",
        showSlider: true,
        hideSliderInitially: !this.isSmallScreen.matches,
        sliderSteps: 1,
        min: this.yearMin,
        max: yearMax,
        sliderMin: this.yearSliderMin,
        sliderMax: yearMax,
        sliderNoNumberFormatting: true,
      };
      numberInputs.push(yearEndInput);
    }

    const data: DialogData = {
      title: media.isMovie ? "YEAR.PUBLICATION" : "YEAR.S",
      icons: ["calendar"],
      numberInputs,
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          if (result.actionDelete) {
            return { yearStart: 0, yearEnd: 0 };
          }
          return { yearStart: result.numberInputs[0], yearEnd: result.numberInputs[1] || 0 };
        } else {
          return undefined;
        }
      })
    );
  }
}
