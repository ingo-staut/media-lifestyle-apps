import { transformWikiwandUrlToWikipediaUrl } from "shared/utils/url.wikiwand";
import { Language } from "./enum/language.enum";
import { UrlType } from "./enum/url-type.enum";

export enum UrlEnum {
  INFO,
  VIDEO,
  WATCH,
}

export class Url {
  url: string;
  note: string;
  type: UrlType;
  language: Language;

  constructor(urlObject: { url: string; note?: string; type?: UrlType; language?: Language }) {
    let { url, note, type, language } = urlObject ?? {};
    if (url.includes("imdb") && !url.endsWith("/")) {
      url = url + "/";
    }
    this.url = transformWikiwandUrlToWikipediaUrl(url);
    this.note = note ?? "";
    this.type = type ?? UrlType.NONE;
    this.language = language ?? Language.NONE;
  }
}
