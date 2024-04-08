import { Pipe, PipeTransform } from "@angular/core";
import { DropdownData } from "shared/models/dropdown.type";
import { DateFns } from "shared/utils/date-fns";
import { getEpisodeDetailTypeByType } from "../app/data/episode-detail.data";
import { EpisodeDetailType } from "../app/models/enum/episode-detail.enum";
import { EpisodeDetail } from "../app/models/episode-detail.class";
import { Episode } from "../app/models/episode.class";
import { Media } from "../app/models/media.class";

@Pipe({
  name: "episodeProgressByEpisodeDetailsWithDuration",
})
export class EpisodeProgressByEpisodeDetailsWithDurationPipe implements PipeTransform {
  transform(
    episode: Episode,
    episodeDetails: EpisodeDetail[],
    runtime: number
  ): number | undefined {
    const progress = Media.getEpisodeProgressByEpisodeDetailWithDuration(
      episode,
      episodeDetails,
      runtime
    );

    return progress;
  }
}

@Pipe({
  name: "episodeDetailsBySeasonAndEpisode",
})
export class EpisodeDetailsBySeasonAndEpisodePipe implements PipeTransform {
  transform(media: Media, season: number, episode: number): EpisodeDetail[] | null {
    const episodeDetailsForEpisode = Media.getEpisodeDetailsByEpisodeAndSeason(
      media.episodeDetails,
      season,
      episode
    );

    return episodeDetailsForEpisode.length ? episodeDetailsForEpisode : null;
  }
}

@Pipe({
  name: "episodeDetailsByEpisode",
})
export class EpisodeDetailsByEpisodePipe implements PipeTransform {
  transform(
    episodeDetails: EpisodeDetail[],
    episode: Episode,
    types: EpisodeDetailType[]
  ): EpisodeDetail[] | null {
    if (!episode) return null;

    const episodeDetailsForEpisode = Media.getEpisodeDetailsByEpisodeAndSeason(
      episodeDetails,
      episode.season,
      episode.episode
    )?.filter((detail) => (types ? types.includes(detail.type) : true));

    return episodeDetailsForEpisode.length ? episodeDetailsForEpisode : null;
  }
}

@Pipe({
  name: "hasEpisodeDetailsByEpisode",
})
export class HasEpisodeDetailsByEpisodePipe implements PipeTransform {
  transform(media: Media, nextEpisode: Episode, types: EpisodeDetailType[]): boolean {
    return !!Media.getEpisodeDetailsByEpisodeAndSeason(
      media.episodeDetails,
      nextEpisode.season,
      nextEpisode.episode
    ).filter((detail) => (types ? types.includes(detail.type) : true)).length;
  }
}

@Pipe({
  name: "episodeDetail",
})
export class EpisodeDetailPipe implements PipeTransform {
  transform(
    detail: EpisodeDetail,
    optionals?: { returnUrlIfUrl: boolean }
  ): DropdownData<EpisodeDetailType, string> {
    const { returnUrlIfUrl = true } = optionals ?? {};

    const hasDuration =
      detail.type === EpisodeDetailType.INFO &&
      !!DateFns.getDurationRangeOfString(detail.note || "")?.min;
    if (hasDuration) {
      return {
        key: detail.type,
        name: "CONTINUE_WATCHING",
        icon: "continue-watching",
      };
    }

    const hasUrl = !!detail.url;
    if (hasUrl && returnUrlIfUrl && detail.type === EpisodeDetailType.INFO) {
      return {
        key: detail.type,
        name: "URL.",
        icon: "url",
      };
    }

    return getEpisodeDetailTypeByType(detail.type);
  }
}

@Pipe({
  name: "episodeDetailIsWatching",
})
export class EpisodeDetailIsWatchingPipe implements PipeTransform {
  transform(detail: EpisodeDetail): boolean {
    return (
      detail.type === EpisodeDetailType.INFO &&
      !!DateFns.getDurationRangeOfString(detail.note || "")?.min
    );
  }
}

@Pipe({
  name: "watched",
})
export class WatchedPipe implements PipeTransform {
  transform(media: Media, season: number, episode: number): boolean {
    return !(
      Media.getEpisodeDetailsByTypeAndEpisodeAndSeason(
        media.episodeDetails,
        EpisodeDetailType.NOT_WATCHED,
        season,
        episode
      ).length ||
      Media.getEpisodeDetailsByTypeAndEpisodeAndSeason(
        media.episodeDetails,
        EpisodeDetailType.NOT_WATCHED,
        season,
        0
      ).length
    );
  }
}
