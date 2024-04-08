import { toCamelCase, trimToString } from "./string";

export function getNameOfYoutubeTrailerTitle(youtubeTitle: string) {
  youtubeTitle = trimToString(youtubeTitle, "Trailer");
  youtubeTitle = trimToString(youtubeTitle, " - ");
  youtubeTitle = trimToString(youtubeTitle, "-");
  youtubeTitle = trimToString(youtubeTitle, " ‐ ");
  youtubeTitle = trimToString(youtubeTitle, " — ");
  youtubeTitle = trimToString(youtubeTitle, "Official");
  youtubeTitle = trimToString(youtubeTitle, "Season");
  youtubeTitle = trimToString(youtubeTitle, "Staffel");
  youtubeTitle = trimToString(youtubeTitle, "Limited"); // e.g. Limited Series Trailer
  youtubeTitle = trimToString(youtubeTitle, " US Release");
  youtubeTitle = trimToString(youtubeTitle, " UK Release");
  youtubeTitle = trimToString(youtubeTitle, "|");
  youtubeTitle = trimToString(youtubeTitle, "(");
  youtubeTitle = toCamelCase(youtubeTitle);

  return youtubeTitle;
}
