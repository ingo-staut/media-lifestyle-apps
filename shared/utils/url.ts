import { TranslateService } from "@ngx-translate/core";
import { getUrlTypeNameByUrlType } from "shared/data/url-type.data";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { SearchEngine } from "shared/models/search-engine.type";
import { Url } from "shared/models/url.class";
import { findMostCommonItemInList } from "./list";
import { forSearch, replaceInTitle, toTitleCase } from "./string";
import { getUrlByWikipediaUrl } from "./url.wikipedia";
import { getYoutubeIdFromUrl, getYoutubeTimestampFromUrl } from "./url.youtube";

export const URL_FAVICON = "https://www.google.com/s2/favicons?domain=";
export const URL_REPLACER_SEARCHTEXT = "%s";
const URL_REPLACER_SEASON = "_season_";
const URL_REPLACER_SEASON_GER = "_staffel_";
const URL_REPLACER_EPISODE = "_episode_";
const URL_REPLACER_YEAR = "_year_";
const URL_REPLACER_YEAR_GER = "_jahr_";

export const URL_REPLACER = [
  URL_REPLACER_SEASON,
  URL_REPLACER_SEASON_GER,
  URL_REPLACER_EPISODE,
  URL_REPLACER_YEAR,
  URL_REPLACER_YEAR_GER,
];

export function isValidHttpUrl(text: string) {
  try {
    if (!text || !text?.trim()) return false;
    const url = new URL(text.trim().toLowerCase());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export function getTitleOfUrl(url: string): string {
  try {
    if (!url?.trim()) return url;

    if (!url.match(/^https?:\/\//)) url = "https://" + url;
    if (!url.match(/\./)) return url;
    const matches = new URL(url).host.match(/^(?:[^.]+\.)?([^.]+)(\.[^.]+)$/);
    return matches
      ? matches[1].length > 2
        ? matches[1].length === 3
          ? matches[1].toUpperCase()
          : toTitleCase(matches[1])
        : matches[1] + matches[2]
      : url;
  } catch (error) {
    console.error("Es konnte kein Titel der URL extrahiert werden: ", url, error);

    return url;
  }
}

export function getUrlTitleTypeNoteByUrl(url: Url, translateService: TranslateService): string {
  const textType = getUrlTypeNameByUrlType(url.type, false);
  const textTypeTranslated = textType ? translateService.instant(textType) + ": " : "";
  return `${textTypeTranslated}${getTitleOfUrl(url.url)}${url.note ? ` (${url.note})` : ""}`;
}

export function getUrlTypeNoteByUrl(url: Url, translateService: TranslateService): string {
  const textType = getUrlTypeNameByUrlType(url.type, false);
  const textTypeTranslated = textType ? translateService.instant(textType) + ": " : "";
  return `${textTypeTranslated}${url.url}${url.note ? ` (${url.note})` : ""}`;
}

export function replacePlaceholderInUrlWithSearchEngine(
  searchEngine: SearchEngine,
  title: string,
  season?: number,
  episode?: number,
  year?: number
): string {
  const url = searchEngine.url;
  if (!title?.trim()) return url;
  if (!url?.trim()) return url;

  const { replaceSpaceInTitle, replaceInTitleType } = searchEngine;
  title = replaceInTitle(title, replaceSpaceInTitle, replaceInTitleType);

  return replaceSeasonAndEpisodeAndYearInUrl(
    url.replaceAll(URL_REPLACER_SEARCHTEXT, title),
    season ?? 1,
    episode ?? 1,
    year ?? new Date().getFullYear()
  );
}

export function replaceSeasonAndEpisodeAndYearInUrl(
  url: string,
  season: number,
  episode: number,
  year: number
): string {
  if (!url?.trim()) return url;

  return url
    .replaceAll(URL_REPLACER_SEASON, season.toString())
    .replaceAll(URL_REPLACER_SEASON_GER, season.toString())
    .replaceAll(URL_REPLACER_EPISODE, episode.toString())
    .replaceAll(URL_REPLACER_YEAR, year.toString())
    .replaceAll(URL_REPLACER_YEAR_GER, year.toString());
}

export function cleanUrl(url: string): string {
  if (!url?.trim()) return url;

  const youtubeId = getYoutubeIdFromUrl(url);
  if (youtubeId) {
    const time = getYoutubeTimestampFromUrl(url);
    const newUrl = new URL("https://www.youtube.com/watch?v=" + youtubeId);
    if (time) newUrl.searchParams.set("t", `${time}s`);
    return newUrl.href;
  }

  return url;
}

export function replaceSeasonAndEpisode(url: string) {
  const title = getTitleOfUrl(url);
  if (title === "bs.to") {
    return url.replaceAll(/\/\d+\//gi, "/" + URL_REPLACER_SEASON + "/");
  } else if (title.toLowerCase() === "ardmediathek") {
    return url.replaceAll(/\/\d+\/?$/gi, "/" + URL_REPLACER_SEASON);
  } else if (title === "s.to") {
    return url
      .replaceAll(/\/staffel-\d+\//gi, "/staffel-" + URL_REPLACER_SEASON + "/")
      .replaceAll(/\/episode-\d+\/?/gi, "/episode-" + URL_REPLACER_EPISODE);
  } else {
    return url;
  }
}

export function sortUrlListByType(a: Url, b: Url): number {
  // Reihenfolge
  const order = [UrlType.INTRO, UrlType.TRAILER, UrlType.CRITIC_REVIEW, UrlType.NEWS];

  const indexA = order.indexOf(a.type);
  const indexB = order.indexOf(b.type);

  if (indexA === -1 && indexB === -1) {
    return a.type?.localeCompare(b.type);
  } else if (indexA === -1) {
    return 1;
  } else if (indexB === -1) {
    return -1;
  } else {
    return indexA - indexB;
  }
}

export async function getUrlsFromClipboard(
  searchEngines: SearchEngine[],
  clean: boolean = true
): Promise<{
  urlsInfo?: Url[];
  urlsVideo?: Url[];
  urlsWatch?: Url[];
}> {
  const fromClipboard = await navigator.clipboard.readText();

  if (!isValidHttpUrl(fromClipboard)) return {};

  const url = clean ? cleanUrl(fromClipboard) : fromClipboard;

  if (getYoutubeIdFromUrl(fromClipboard)) {
    return {
      urlsVideo: [new Url({ url, type: UrlType.TRAILER })],
    };
  }

  const wikipediaUrl = getUrlByWikipediaUrl(fromClipboard, true);
  if (wikipediaUrl) {
    return {
      urlsInfo: [wikipediaUrl],
    };
  }

  const possibleTypes = searchEngines
    .filter((searchEngine) => forSearch(searchEngine.name) === forSearch(getTitleOfUrl(url)))
    .filter(
      (searchEngine) =>
        searchEngine.type === SearchEngineType.URL_INFO ||
        searchEngine.type === SearchEngineType.URL_WATCH ||
        searchEngine.type === SearchEngineType.URL_VIDEO
    )
    .map((searchEngine) => searchEngine.type);

  const type = findMostCommonItemInList(possibleTypes) ?? SearchEngineType.NONE;

  const urls = [new Url({ url })];

  if (type === SearchEngineType.URL_VIDEO) {
    return { urlsVideo: urls };
  } else if (type === SearchEngineType.URL_WATCH) {
    return { urlsWatch: urls };
  }

  return { urlsInfo: urls };
}

export function formatUrl(optionals?: {
  url?: Url | string;
  season?: number;
  episode?: number;
  year?: number;
  searchEngine?: SearchEngine;
  title?: string;
}) {
  const { url, season, episode, year, searchEngine, title } = optionals ?? {};
  if (searchEngine && title) {
    return replacePlaceholderInUrlWithSearchEngine(searchEngine, title, season, episode, year);
  } else if (url) {
    return replaceSeasonAndEpisodeAndYearInUrl(
      typeof url === "string" ? url : url.url,
      season ?? 1,
      episode ?? 1,
      year ?? new Date().getFullYear()
    );
  } else {
    return "";
  }
}

export function openUrl(url: string) {
  window.open(url, "_blank");
}

export function formatAndOpenUrl(optionals?: {
  url?: Url | string;
  season?: number;
  episode?: number;
  searchEngine?: SearchEngine;
  title?: string;
}) {
  const url = formatUrl(optionals);
  openUrl(url);
}

export function getUrlIcons(url: string): string[] {
  return getUrlIconsWithTooltips(url).map((item) => item.icon);
}

export function getUrlIconsWithTooltips(url: string): { icon: string; text: string }[] {
  if (!url?.trim()) return [];

  const icons = [];

  if (urlIsPlaylist(url)) {
    icons.push({ icon: "playlist", text: "PLAYLIST" });
  }

  if (
    url.includes(URL_REPLACER_SEASON) ||
    url.includes(URL_REPLACER_SEASON_GER) ||
    url.includes(URL_REPLACER_EPISODE)
  ) {
    icons.push({ icon: "season", text: "SEASON_AND_EPISODE_PLACEHOLDER" });
  }

  if (url.includes(URL_REPLACER_YEAR) || url.includes(URL_REPLACER_YEAR_GER)) {
    icons.push({ icon: "calendar", text: "YEAR.PLACEHOLDER" });
  }

  return icons;
}

function urlIsPlaylist(url: string) {
  return url.match(/\Wlist\W/);
}
