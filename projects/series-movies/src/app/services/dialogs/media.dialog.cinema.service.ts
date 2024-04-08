import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Cinema } from "../../models/cinema.type";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogCinemaService {
  private isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialogService: DialogService) {}

  open(media: Media) {
    const add = !media.cinema;
    const data: DialogData<string, string> = {
      title: add ? "CINEMA.ADD" : "CINEMA.EDIT",
      icons: [],
      textInputs: [
        {
          text: media.cinema?.building ?? "",
          placeholder: "CINEMA.",
          icon: "cinema",
          order: 1,
          required: true,
        },
        {
          text: media.cinema?.note ?? "",
          placeholder: "NOTE.",
          icon: "note",
          order: 4,
        },
      ],
      dateInputs: [
        {
          date: media.cinema?.date ?? null,
          placeholder: "DATE.",
          required: true,
          order: 2,
        },
      ],
      numberInputs: [
        {
          number: media.cinema?.price ?? 0,
          icon: "money",
          placeholder: "PRICE",
          showSlider: true,
          hideSliderInitially: !this.isSmallScreen.matches,
          sliderMax: 20,
          suffixLong: "€",
          suffixShort: "€",
          required: true,
          order: 3,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return undefined;

        // Hinzufügen / Edit
        if (result.actionAddOrApply) {
          const cinema: Cinema = {
            building: result.textInputs[0],
            note: result.textInputs[1],
            date: result.dateInputs[0]!,
            price: result.numberInputs[0],
          };

          media.cinema = cinema;
        }

        // Löschen
        else if (result.actionDelete) {
          media.cinema = null;
        }

        return media;
      })
    );
  }
}
