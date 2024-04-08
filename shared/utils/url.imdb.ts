import { IMDbUrlKey } from "shared/models/imdb-url-key.type";

const URL_IMDb = "https://www.imdb.com/";
const REGEX_IMDb = /^https?:\/\/www\.imdb\.com\/(?:title|name)\/((?:tt|nm)[0-9]+)/i;

export function getIMDbIdFromUrl(url: string): string | undefined {
  if (url.includes("imdb")) {
    const match = url.match(REGEX_IMDb); // z.B.: tt1839578 (inkl. "tt" oder "nm")
    if (match) {
      return match[1];
    }
  }
  return undefined;
}

export function getIMDbUrlById(id: string, key?: IMDbUrlKey): string {
  return `${URL_IMDb}${key ?? getIMDbUrlTypeById(id) ?? IMDbUrlKey.TITLE}/${id}/`;
}

export function getIMDbUrlTypeById(id: string): IMDbUrlKey | null {
  return id.startsWith("nm") ? IMDbUrlKey.PERSON : id.startsWith("tt") ? IMDbUrlKey.TITLE : null;
}
