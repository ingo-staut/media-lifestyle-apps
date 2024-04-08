import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";
import { Season } from "../../models/season.type";

@Injectable({
  providedIn: "root",
})
export class MediaDialogSeasonService {
  constructor(private dialogService: DialogService) {}

  open(media: Media, season: number = 0) {
    const add = season === 0;
    const episodes = add ? 0 : media.seasons[season - 1].episodes;
    const selectedKey = add || !media.seasons[season - 1].special ? "season" : "season-special";
    const data: DialogData = {
      title: add ? "SEASON.ADD" : "SEASON.EDIT",
      icons: ["season"],
      numberInputs: [
        {
          number: add ? media.lastSeasonEpisodesWithoutSpecials || null : episodes,
          icon: "season",
          placeholder: "EPISODE.S.",
          sliderSteps: 1,
          sliderMax: Math.max(25, episodes),
          suffixLong: "EPISODE.S.",
          suffixShort: "EPISODE.SHORT",
        },
      ],
      toggleGroupInputs: [
        {
          placeholder: "SEASON.TYPE",
          selectedKey,
          showText: true,
          data: [
            {
              key: "season",
              name: "SEASON.",
              icon: "season",
            },
            {
              key: "season-special",
              name: "SEASON.SPECIAL",
              icon: "special",
            },
          ],
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          const newSeason: Season = {
            episodes: result.numberInputs[0],
            special: result.toggleGroupInputs[0] === "season-special",
          };

          // Staffel hinzufügen
          if (result.actionAdd) {
            media.seasons.push(newSeason);

            if (media.automatic) {
              media.setCurrentEpisode(media.seasons.length, newSeason.episodes);
            }

            return { media };
          }

          // Staffel bearbeiten
          else if (result.actionApply) {
            media.seasons[season - 1] = newSeason;

            if (media.automatic && season === media.currentEpisode.season) {
              media.setCurrentEpisode(media.seasons.length, newSeason.episodes);
            }

            return { media };
          }

          // Staffel gelöscht
          else if (result.actionDelete) {
            media.seasons.splice(season - 1, 1);

            if (!media.seasons.length) {
              media.setCurrentEpisode(0, 0);
              return { media };
            }

            if (media.automatic) {
              media.setCurrentEpisode(
                media.seasons.length,
                media.seasons[media.seasons.length - 1].episodes
              );
            }

            return { media, delete: true };
          }
          return undefined;
        } else {
          return undefined;
        }
      })
    );
  }
}
