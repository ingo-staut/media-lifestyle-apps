import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { LocaleService } from "shared/services/locale.service";
import { EpisodeDetail } from "../../models/episode-detail.class";
import { Media } from "../../models/media.class";
import { SeasonEpisodes } from "../../models/season.type";

@Component({
  selector: "app-episode-in-table-with-episode-details",
  templateUrl: "./episode-in-table-with-episode-details.component.html",
  styleUrls: ["./episode-in-table-with-episode-details.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpisodeInTableWithEpisodeDetailsComponent {
  @Input() media: Media;
  @Input() details: EpisodeDetail[] | null;
  @Input() seasons: SeasonEpisodes[];
  @Input() season: number;
  @Input() seasonIndex: number;
  @Input() episode: number;

  current = new Date();

  constructor(protected localeService: LocaleService) {}
}
