const URL_YOUTUBE = "https://www.youtube.com/watch?v=";
const URL_YOUTUBE_REGEX_ID =
  /^.*(?:(?:youtu.be\/)|(?:v\/)|(?:\/u\/\w\/)|(?:embed\/)|(?:watch\?))\??v?=?([^#&?]*).*/;

export function getYoutubeIdFromUrl(url: string): string | null {
  if (!url?.trim() || (!url?.includes("youtube") && !url?.includes("youtu.be"))) return null;

  const match = url.match(URL_YOUTUBE_REGEX_ID);
  if (!match) return null;

  return match[1];
}

export function getYoutubeTimestampFromUrl(url: string): number | undefined {
  const searchParams = new URL(url).searchParams;
  const timeString = searchParams.get("t");
  if (!timeString) return;
  return +timeString.replaceAll("s", "");
}

export function getYoutubeUrlById(id: string): string {
  return URL_YOUTUBE + id;
}
