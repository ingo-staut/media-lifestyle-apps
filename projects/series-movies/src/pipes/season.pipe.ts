import { Pipe, PipeTransform } from "@angular/core";
import { Media } from "../app/models/media.class";
import { SeasonEpisodes } from "../app/models/season.type";

@Pipe({
  name: "season",
})
export class SeasonPipe implements PipeTransform {
  transform(media: Media, consecutiveEpisodeNumbering: boolean): SeasonEpisodes[] {
    return media.getSeasons();
  }
}

@Pipe({
  name: "currentSeason",
})
export class CurrentSeasonPipe implements PipeTransform {
  transform(media: Media): number {
    return media.currentSeason;
  }
}
