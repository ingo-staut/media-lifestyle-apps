import { getNewUUID } from "shared/utils/uuid";
import { EpisodeDetailType } from "./enum/episode-detail.enum";

export class EpisodeDetail {
  id: string;
  season: number;
  episode: number;
  type: EpisodeDetailType;
  note?: string;
  url?: string;
  date?: Date | null;

  constructor(data: {
    id?: string;
    season: number;
    episode: number;
    type: EpisodeDetailType;
    note?: string;
    url?: string;
    date?: Date | null;
  }) {
    const { id, season, episode, type, note, url, date } = data;
    this.id = id ?? getNewUUID();
    this.season = season;
    this.episode = episode;
    this.type = type;
    this.note = note ?? "";
    this.url = url ?? "";
    this.date = date ?? null;
  }
}
