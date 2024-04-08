import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DateFns } from "shared/utils/date-fns";
import { EpisodeInTelevision } from "../app/models/episode-in-television.type";
import { Episode } from "../app/models/episode.class";
import { Media } from "../app/models/media.class";

@Pipe({
  name: "currentEpisode",
})
export class CurrentEpisodePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    media: Media,
    // Für Neuladen
    currentEpisode: Episode,
    locale: string,
    showCount: boolean = true,
    showTotolCount: boolean = false,
    totalCountWithHTML: boolean = true
  ): string {
    return media.getCurrentEpisodeString(
      this.translateService,
      showCount,
      showTotolCount,
      totalCountWithHTML
    );
  }
}

@Pipe({
  name: "episode",
})
export class EpisodePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    media: Media,
    episode: Episode,
    // Für Neuladen
    locale: string,
    showCount: boolean = true,
    showTotolCount: boolean = false,
    totalCountWithHTML: boolean = true
  ): string {
    return media.getEpisodeString(
      episode,
      this.translateService,
      showCount,
      showTotolCount,
      totalCountWithHTML
    );
  }
}

@Pipe({
  name: "televisionEpisode",
})
export class TelevisionEpisodePipe implements PipeTransform {
  transform(media: Media, episode: Episode): string {
    return media.getTelevisionEpisodeString(episode);
  }
}

@Pipe({
  name: "televisionEpisodeCount",
})
export class TelevisionEpisodeCountPipe implements PipeTransform {
  transform(media: Media, episode: Episode): number {
    return media.getTelevisionEpisode(episode);
  }
}

@Pipe({
  name: "lastEpisodeInSeason",
})
export class LastEpisodeInSeasonPipe implements PipeTransform {
  transform(media: Media): boolean {
    return media.currentEpisodeIsLastInSeason;
  }
}

@Pipe({
  name: "episodeIcon",
})
export class EpisodeIconPipe implements PipeTransform {
  transform(media: Media): { name: string; icon: string } | null {
    const episode = media.currentEpisode;
    const seasons = media.seasons;

    if (episode.isSeriesStart) {
      return { name: "START_OF_SERIES", icon: "season-new" };
    }
    if (episode.isSeasonStart) {
      return { name: "START_OF_SEASON", icon: "season-new" };
    }
    if (episode.episode === seasons[episode.season - 1].episodes && !media.automatic) {
      return { name: "SEASON_FINALE", icon: "season-finale" };
    }
    return null;
  }
}

@Pipe({
  name: "episodeProgress",
})
export class EpisodeProgressPipe implements PipeTransform {
  transform(media: Media, currentEpisode: Episode): number {
    return media.episodeProgressForCurrentSeasonPercentage || media.episodeProgressPercentage;
  }
}

@Pipe({
  name: "episodeInTelevision",
})
export class EpisodeInTelevisionPipe implements PipeTransform {
  transform(media: Media, season: number, episode: number): EpisodeInTelevision | null {
    return (
      media.television?._episodesInTelevision?.find(
        (episodeInTelevision) =>
          episodeInTelevision.episode.season === season &&
          episodeInTelevision.episode.episode === episode
      ) ?? null
    );
  }
}

@Pipe({
  name: "filterEpisodesInTelevisionMissed",
})
export class FilterEpisodesInTelevisionMissedPipe implements PipeTransform {
  transform(episodesInTV?: EpisodeInTelevision[] | null): EpisodeInTelevision[] {
    if (!episodesInTV) return [];

    return episodesInTV.filter(
      (episodeInTV) =>
        // Alle Episoden vor Heute und nur Heute die,
        // die bereits ausgestrahlt wurden
        (DateFns.isBeforeOrToday(episodeInTV.date) &&
          episodeInTV.date.getHours() === 0 &&
          episodeInTV.date.getMinutes() === 0) ||
        // Eigentlich müsste hier die Endzeit getestet werden
        DateFns.isBefore(episodeInTV.date, new Date())
    );
  }
}
