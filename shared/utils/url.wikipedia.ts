import { findLanguageByText } from "shared/data/language.data";
import { Url } from "shared/models/url.class";

export function isWikipediaUrl(url: string): boolean {
  return url.includes("wikipedia.org");
}

export function getUrlByWikipediaUrl(url: string, nullIfNotFound: boolean): Url | null {
  if (!isWikipediaUrl(url)) {
    return nullIfNotFound ? null : new Url({ url });
  }

  const match = url.match(/(?:^|https?:\/\/)(\w{2})\./i);
  if (!match) {
    return nullIfNotFound ? null : new Url({ url });
  }

  const languageCode = match[1];
  return new Url({ url, language: findLanguageByText(languageCode)?.key });
}
