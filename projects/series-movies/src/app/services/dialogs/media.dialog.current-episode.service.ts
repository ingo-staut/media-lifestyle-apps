import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Episode } from "../../models/episode.class";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogCurrentEpisodeService {
  constructor(private dialogService: DialogService) {}

  open(media: Media) {
    const { currentEpisode } = media;

    const seasonMax = media.seasons.length;
    const episodeMax = media.mostEpisodes;

    const add = currentEpisode.season < 0 && currentEpisode.episode <= 0;
    const data: DialogData = {
      title: "EPISODE.CURRENT",
      icons: ["season"],
      numberInputs: [
        {
          number: media.currentEpisode.season || null,
          icon: "season",
          placeholder: "SEASON.",
          required: true,
          max: seasonMax,
          showSlider: true,
          sliderMax: seasonMax,
        },
        {
          number: media.currentEpisode.episode || null,
          icon: "season",
          placeholder: "EPISODE.",
          max: episodeMax,
          showSlider: true,
          sliderSteps: 1,
          sliderMax: episodeMax,
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
            return new Episode({ season: 0, episode: 0 });
          }
          const data: Episode = new Episode({
            season: result.numberInputs[0],
            episode: result.numberInputs[1],
          });
          return data;
        } else {
          return undefined;
        }
      })
    );
  }
}
