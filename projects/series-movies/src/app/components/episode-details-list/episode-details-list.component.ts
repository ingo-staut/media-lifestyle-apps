import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { LocaleService } from "shared/services/locale.service";
import { UrlService } from "shared/services/url.service";
import { URL_FAVICON } from "shared/utils/url";
import { EpisodeDetailNoteTypes } from "../../models/enum/episode-detail.enum";
import { Episode } from "../../models/episode.class";
import { Media } from "../../models/media.class";
import { MediaDialogEpisodeDetailsService } from "../../services/dialogs/media.dialog.episode-detail.service";
import { MediaApiService } from "../../services/media.api.service";

@Component({
  selector: "app-episode-details-list",
  templateUrl: "./episode-details-list.component.html",
  styleUrls: ["./episode-details-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpisodeDetailsListComponent {
  @Input() media: Media;
  @Input() episode: Episode;
  @Input() showNextEpisodeDetails?: boolean = false;

  EpisodeDetailNoteTypes = EpisodeDetailNoteTypes;
  URL_FAVICON = URL_FAVICON;

  subButtonHover = false;

  get nextEpisode() {
    return this.showNextEpisodeDetails
      ? new Episode({ season: this.episode.season, episode: this.episode.episode + 1 })
      : this.episode;
  }

  constructor(
    protected localeService: LocaleService,
    private mediaDialogEpisodeDetailService: MediaDialogEpisodeDetailsService,
    private mediaApiService: MediaApiService,
    private urlService: UrlService
  ) {}

  openEditEpisodeDetail(event: Event, episodeDetailId: string) {
    event.stopPropagation();

    this.mediaDialogEpisodeDetailService
      .openEditEpisodeDetail(this.media, {
        episodeDetailId,
      })
      .subscribe((result) => {
        if (!result) return;

        this.media = result;
        this.media.episodeDetails = [...result.episodeDetails];

        result.recalculateEvents();
        this.mediaApiService.saveAndReloadMedia(result);
      });
  }

  openUrl(url: string, event?: MouseEvent) {
    if (event) event.stopPropagation();

    this.urlService.openOrCopyUrl({
      event,
      url,
    });
  }
}
