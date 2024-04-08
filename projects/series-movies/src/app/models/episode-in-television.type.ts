import { TimeRange } from "../../../../../shared/models/time-range.type";
import { EpisodeDetail } from "./episode-detail.class";
import { Episode } from "./episode.class";

export type EpisodeInTelevision = {
  date: Date;
  time: TimeRange;
  episode: Episode;
  episodeDetails?: EpisodeDetail[];
};
