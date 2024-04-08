import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { map } from "rxjs";
import { DateInput } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { FirstCharToLowercasePipe } from "shared/pipes/string.pipe";
import { NotificationService } from "shared/services/notification.service";
import { cleanUrl } from "shared/utils/url";
import { getNewUUID } from "shared/utils/uuid";
import {
  EPISODE_DETAIL_NOTE_TYPES,
  getEpisodeDetailTypeByType,
} from "../../data/episode-detail.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { EpisodeDetailType, isEpisodeDetailNoteType } from "../../models/enum/episode-detail.enum";
import { EpisodeDetail } from "../../models/episode-detail.class";
import { Episode } from "../../models/episode.class";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogEpisodeDetailsService {
  constructor(
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private firstCharToLowercasePipe: FirstCharToLowercasePipe,
    private dialogService: DialogService
  ) {}

  openEditEpisodeDetail(
    media: Media,
    d:
      | {
          season: number;
          episode: number;
          type: EpisodeDetailType;
        }
      | {
          episodeDetailId: string;
        }
  ) {
    const add = !("episodeDetailId" in d);

    const episodeDetail =
      "episodeDetailId" in d
        ? media.findEpisodeDetailById(d.episodeDetailId)!
        : {
            season: d.season,
            episode: d.episode,
            type: d.type,
          };
    const date = "date" in episodeDetail ? episodeDetail.date ?? null : null;

    const favoriteOrInfoOrSpecial = isEpisodeDetailNoteType(episodeDetail.type);
    const typeWithDate =
      episodeDetail.type === EpisodeDetailType.IN_TELEVISION ||
      episodeDetail.type === EpisodeDetailType.AVAILABLE_UNTIL;

    const dateInputs: DateInput[] = typeWithDate
      ? [
          {
            date,
            placeholder:
              episodeDetail?.type === EpisodeDetailType.AVAILABLE_UNTIL
                ? "AVAILABLE_UNTIL"
                : "TELEVISION.IN",
            required: true,
            order: 6,
          },
        ]
      : [];

    const toggleGroupInputs = favoriteOrInfoOrSpecial
      ? [
          {
            data: EPISODE_DETAIL_NOTE_TYPES,
            placeholder: "NOTE.TYPE",
            selectedKey: episodeDetail?.type,
            showText: true,
            order: 5,
          },
        ]
      : [];

    const detailType = getEpisodeDetailTypeByType(episodeDetail.type);
    let title = detailType ? "ADD_VALUE" : "NOTE.ADD";
    let titleReplace = detailType ? detailType.name : "";
    let icon = detailType ? detailType.icon : "note";

    if (!add) {
      title = title.replace("ADD", "EDIT");
    }

    const episodeText = media.getEpisodeString(
      new Episode({ season: episodeDetail.season, episode: episodeDetail.episode }),
      this.translateService
    );

    const titleReplaceText = {
      value: this.firstCharToLowercasePipe.transform(
        this.translateService.instant(titleReplace),
        this.translateService.currentLang
      ),
    };

    title = this.translateService.instant(title, titleReplaceText) + " (" + episodeText + ")";

    const data: DialogData = {
      title,
      icons: [icon],
      textInputs: [
        {
          text: !add && "note" in episodeDetail ? episodeDetail.note ?? "" : "",
          icon: "note",
          placeholder: "NOTE.",
          required: favoriteOrInfoOrSpecial,
          order: 3,
        },
        {
          text: !add && "url" in episodeDetail ? episodeDetail.url ?? "" : "",
          icon: "url",
          placeholder: "URL.",
          order: 4,
        },
      ],
      numberInputs: [
        {
          number: episodeDetail.season ?? null,
          placeholder: "SEASON.",
          icon: "season",
          required: true,
          order: 1,
        },
        {
          number: episodeDetail.episode ?? null,
          placeholder: "EPISODE.",
          icon: "season",
          order: 2,
        },
      ],
      dateInputs,
      toggleGroupInputs,
      actionCancel: true,
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return;

        // Erstellen oder Bearbeiten
        if (result.actionAddOrApply) {
          const note = result.textInputs[0];
          const url = cleanUrl(result.textInputs[1]);
          const date = result.dateInputs[0];
          const type = favoriteOrInfoOrSpecial
            ? (result.toggleGroupInputs[0] as EpisodeDetailType)
            : episodeDetail?.type;
          const season = result.numberInputs[0] ?? 1;
          const episode = result.numberInputs[1] ?? 0;

          const newData: EpisodeDetail = new EpisodeDetail({
            ...episodeDetail,
            episode,
            season,
            type: type ?? EpisodeDetailType.INFO,
            note,
            url,
            date,
          });

          const episodeChanged =
            episodeDetail.season !== newData.season || episodeDetail.episode !== newData.episode;

          if (episodeChanged && "id" in episodeDetail) {
            media.removeEpisodeDetailById(episodeDetail.id);
          }

          // Erstellen
          if (result.actionAdd || episodeChanged) {
            newData.id = getNewUUID();
            media.addEpisodeDetail(newData);
          }

          // Bearbeiten
          else if (result.actionApply && "episodeDetailId" in d) {
            media.removeEpisodeDetailById(d.episodeDetailId);
            media.addEpisodeDetail(newData);
          } else {
            throw new Error("EpisodeDetailId is null");
          }
        }

        // Löschen
        else if (result.actionDelete && "episodeDetailId" in d) {
          media.removeEpisodeDetailById(d.episodeDetailId);
        } else {
          throw new Error("EpisodeDetailId is null");
        }

        return media;
      })
    );
  }

  removeEpisodeDetailById(media: Media, episodeDetailId: string): Media {
    if (!episodeDetailId) return media;

    media.removeEpisodeDetailById(episodeDetailId);

    return media;
  }
}
