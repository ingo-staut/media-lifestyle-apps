import { Component, Inject } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { LocaleService } from "shared/services/locale.service";
import { URL_FAVICON } from "shared/utils/url";
import { UrlService } from "../../../../../../shared/services/url.service";
import { EPISODE_DETAIL_TYPES } from "../../data/episode-detail.data";
import { EpisodeDetailType } from "../../models/enum/episode-detail.enum";
import { EpisodeDetail } from "../../models/episode-detail.class";
import { Episode } from "../../models/episode.class";
import { Media } from "../../models/media.class";

type ReturnValueApplyChanges = {
  media: Media;
};

type ReturnValueEditSeason = {
  season: number;
};

export type ReturnValueDeleteEpisodeDetailById = {
  episodeDetailId: string;
};

export type ReturnValueEditEpisodeDetailById = { edit: boolean; episodeDetailId: string };

export type ReturnValueAddEpisodeDetail = {
  season: number;
  episode: number;
  type: EpisodeDetailType;
};

export type EpisodeDetailsMenuBottomSheetReturnData =
  | ReturnValueApplyChanges
  | ReturnValueEditSeason
  | ReturnValueEditEpisodeDetailById
  | ReturnValueDeleteEpisodeDetailById;

@Component({
  templateUrl: "./episode-detail-menu-bottom-sheet.component.html",
  styleUrls: ["./episode-detail-menu-bottom-sheet.component.scss"],
})
export class EpisodeDetailsMenuBottomSheetComponent {
  URL_FAVICON = URL_FAVICON;
  EPISODE_DETAIL_TYPES = EPISODE_DETAIL_TYPES;
  EpisodeDetailType = EpisodeDetailType;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<EpisodeDetailsMenuBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      media: Media;
      episodeDetails: EpisodeDetail[] | null;
      season: number;
      episode: number;
    },
    private urlService: UrlService,
    protected localeService: LocaleService
  ) {}

  onEpisodeClick(season: number, episode: number) {
    this.data.media.currentEpisode = new Episode({ season, episode });

    const data: ReturnValueApplyChanges = {
      media: this.data.media,
    };
    this.bottomSheetRef.dismiss(data);
  }

  onEditSeasonClick(season: number) {
    const data: ReturnValueEditSeason = {
      season,
    };
    this.bottomSheetRef.dismiss(data);
  }

  openUrl(event: MouseEvent, url?: string) {
    event.stopPropagation();

    this.urlService.openOrCopyUrl({
      event,
      url,
      season: this.data.media.currentSeason,
      episode: this.data.media.currentEpisode.episode,
      year: this.data.media.yearStart,
    });
  }

  openEditEpisodeDetail(episodeDetailId: string) {
    const data: ReturnValueEditEpisodeDetailById = {
      edit: true,
      episodeDetailId,
    };
    this.bottomSheetRef.dismiss(data);
  }

  openAddEpisodeDetail(season: number, episode: number, type: EpisodeDetailType) {
    const data: ReturnValueAddEpisodeDetail = {
      season,
      episode,
      type,
    };
    this.bottomSheetRef.dismiss(data);
  }

  onDeleteEpisodeDetail(episodeDetailId: string) {
    const data: ReturnValueDeleteEpisodeDetailById = {
      episodeDetailId,
    };
    this.bottomSheetRef.dismiss(data);
  }

  onCheckTelevision(season: number, episode: number) {}

  onDeleteAllEpisodeDetails() {
    this.data.media.episodeDetails = Media.removeAllEpisodeDetailsWithWatchtimeByEpisode(
      this.data.season,
      this.data.episode,
      this.data.media.episodeDetails
    );

    const data: ReturnValueApplyChanges = {
      media: this.data.media,
    };
    this.bottomSheetRef.dismiss(data);
  }
}
