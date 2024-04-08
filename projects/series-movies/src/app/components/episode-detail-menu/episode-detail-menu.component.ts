import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocaleService } from "shared/services/locale.service";
import { URL_FAVICON } from "shared/utils/url";
import { UrlService } from "../../../../../../shared/services/url.service";
import {
  ReturnValueAddEpisodeDetail,
  ReturnValueDeleteEpisodeDetailById,
  ReturnValueEditEpisodeDetailById,
} from "../../bottom-sheets/episode-detail-menu-bottom-sheet/episode-detail-menu-bottom-sheet.component";
import { EPISODE_DETAIL_TYPES } from "../../data/episode-detail.data";
import { EpisodeDetailType } from "../../models/enum/episode-detail.enum";
import { EpisodeDetail } from "../../models/episode-detail.class";
import { Episode } from "../../models/episode.class";
import { Media } from "../../models/media.class";

@Component({
  selector: "app-episode-detail-menu",
  templateUrl: "./episode-detail-menu.component.html",
  styleUrls: ["./episode-detail-menu.component.scss"],
})
export class EpisodeDetailsMenuComponent {
  @Input() media: Media;
  @Input() episodeDetails: EpisodeDetail[] | null;
  @Input() season: number;
  @Input() episode: number;
  @Input() year: number;

  @Output() applyChanges = new EventEmitter<Media>();
  @Output() editSeason = new EventEmitter<number>();
  @Output() deleteDetailByIndex = new EventEmitter<ReturnValueDeleteEpisodeDetailById>();
  @Output() openEditEpisodeDetailDialog = new EventEmitter<ReturnValueEditEpisodeDetailById>();
  @Output() openAddEpisodeDetailDialog = new EventEmitter<ReturnValueAddEpisodeDetail>();

  URL_FAVICON = URL_FAVICON;
  EPISODE_DETAIL_TYPES = EPISODE_DETAIL_TYPES;
  EpisodeDetailType = EpisodeDetailType;

  constructor(private urlService: UrlService, protected localeService: LocaleService) {}

  onEpisodeClick(season: number, episode: number) {
    this.media.currentEpisode = new Episode({ season, episode });
    this.applyChanges.emit();
  }

  onEditSeasonClick(season: number) {
    this.editSeason.emit(season);
  }

  openUrl(event: MouseEvent, url?: string) {
    event.stopPropagation();

    this.urlService.openOrCopyUrl({
      event,
      url,
      season: this.season,
      episode: this.episode,
      year: this.year,
    });
  }

  openEditEpisodeDetail(episodeDetailId: string) {
    const data: ReturnValueEditEpisodeDetailById = {
      edit: true,
      episodeDetailId,
    };
    this.openEditEpisodeDetailDialog.emit(data);
  }

  openAddEpisodeDetail(season: number, episode: number, type: EpisodeDetailType) {
    const data: ReturnValueAddEpisodeDetail = {
      season,
      episode,
      type,
    };
    this.openAddEpisodeDetailDialog.emit(data);
  }

  onDeleteEpisodeDetail(episodeDetailId: string) {
    const data: ReturnValueDeleteEpisodeDetailById = {
      episodeDetailId,
    };
    this.deleteDetailByIndex.emit(data);
  }

  onCheckTelevision(season: number, episode: number) {}

  onDeleteAllEpisodeDetails() {
    this.media.removeAllEpisodeDetailsBySeasonAndEpisode(this.season, this.episode);
    this.applyChanges.emit();
  }
}
