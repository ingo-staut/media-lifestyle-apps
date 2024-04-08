import { Episode } from "./episode.class";

export type Season = {
  special: boolean;
  episodes: number;
};

export type SeasonEpisodes = {
  seasonText: string;
  season: number;
  special: boolean;
  episodes: Episode[];
  year: number;
};
