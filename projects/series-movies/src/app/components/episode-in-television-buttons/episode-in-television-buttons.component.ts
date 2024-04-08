import { Component, Input } from "@angular/core";
import { EpisodeDetailType } from "../../models/enum/episode-detail.enum";
import { EpisodeInTelevision } from "../../models/episode-in-television.type";
import { Media } from "../../models/media.class";
import { MediaDialogEpisodeDetailsService } from "../../services/dialogs/media.dialog.episode-detail.service";
import { MediaApiService } from "../../services/media.api.service";
import { MediaEpisodeService } from "../../services/media.episode.service";

@Component({
  selector: "app-episode-in-television-buttons",
  templateUrl: "./episode-in-television-buttons.component.html",
  styleUrls: ["./episode-in-television-buttons.component.scss"],
})
export class EpisodeInTelevisionButtonsComponent {
  @Input() media: Media;
  @Input() episodeInTV: EpisodeInTelevision;

  EpisodeDetailType = EpisodeDetailType;

  constructor(
    private mediaApiService: MediaApiService,
    protected mediaEpisodeService: MediaEpisodeService,
    protected mediaDialogEpisodeDetailService: MediaDialogEpisodeDetailsService
  ) {}

  openEditEpisodeDetail(event: Event) {
    event.stopPropagation();
    this.mediaDialogEpisodeDetailService
      .openEditEpisodeDetail(this.media, {
        season: this.episodeInTV.episode.season,
        episode: this.episodeInTV.episode.episode,
        type: EpisodeDetailType.INFO,
      })
      .subscribe((result) => {
        if (!result) return;

        result.recalculateEvents();
        this.mediaApiService.saveAndReloadMedia(result);
      });
  }

  onNext(event: Event) {
    event.stopPropagation();
    this.mediaEpisodeService.onNext(this.media, this.episodeInTV);
  }

  onNotWatched(event: Event) {
    event.stopPropagation();
    this.mediaEpisodeService.onNotWatched(this.media, this.episodeInTV);
  }

  onMoveToNext(event: Event) {
    event.stopPropagation();
    this.mediaEpisodeService.onMoveToNext(this.media, this.episodeInTV);
  }
}
