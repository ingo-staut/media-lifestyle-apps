import { DropdownData } from "shared/models/dropdown.type";
import { EpisodeDetailNoteTypes, EpisodeDetailType } from "../models/enum/episode-detail.enum";

export const EPISODE_DETAIL_TYPES: DropdownData<EpisodeDetailType, string>[] = [
  {
    key: EpisodeDetailType.FAVORITE,
    name: "FAVORITE.",
    icon: "favorite",
  },
  {
    key: EpisodeDetailType.INFO,
    name: "NOTE.",
    icon: "info",
  },
  {
    key: EpisodeDetailType.SPECIAL,
    name: "EPISODE.SPECIAL",
    icon: "special",
  },
  {
    key: EpisodeDetailType.NOT_WATCHED,
    name: "NOT_WATCHED",
    icon: "hide",
  },
  {
    key: EpisodeDetailType.AVAILABLE_UNTIL,
    name: "AVAILABLE_UNTIL",
    icon: "calendar",
  },
  {
    key: EpisodeDetailType.IN_TELEVISION,
    name: "TELEVISION.IN",
    icon: "television",
  },
];

export const EPISODE_DETAIL_NOTE_TYPES = EPISODE_DETAIL_TYPES.filter((type) =>
  EpisodeDetailNoteTypes.includes(type.key)
);

export function getEpisodeDetailTypeByType(type: EpisodeDetailType) {
  return EPISODE_DETAIL_TYPES.find((episodeDetailType) => episodeDetailType.key === type)!;
}
