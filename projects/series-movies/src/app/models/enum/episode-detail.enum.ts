export enum EpisodeDetailType {
  FAVORITE = "FAVORITE",
  INFO = "INFO",
  SPECIAL = "SPECIAL",
  NOT_WATCHED = "NOT_WATCHED",
  AVAILABLE_UNTIL = "AVAILABLE_UNTIL",
  IN_TELEVISION = "IN_TELEVISION",
}

export const EpisodeDetailNoteTypes = [
  EpisodeDetailType.FAVORITE,
  EpisodeDetailType.INFO,
  EpisodeDetailType.SPECIAL,
];

export function isEpisodeDetailNoteType(type: EpisodeDetailType) {
  return (
    type === EpisodeDetailType.FAVORITE ||
    type === EpisodeDetailType.INFO ||
    type === EpisodeDetailType.SPECIAL
  );
}
