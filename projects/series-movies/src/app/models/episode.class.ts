export class Episode {
  season: number;
  episode: number;
  // details?: EpisodeDetail[] | null;

  constructor(data: { season: number; episode: number }) {
    const { season, episode } = data;
    this.season = season;
    this.episode = episode;
  }

  get isSeriesStart() {
    return this.season <= 1 && this.episode <= 0;
  }

  get isSeasonStart() {
    return this.episode <= 0;
  }
}

// export type EpisodeDetail = {
//   type: EpisodeDetailType;
//   note?: string;
//   url?: string;
//   date?: Date | null;
// };
