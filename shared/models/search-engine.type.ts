import { OpenUrlOnDeviceApiService } from "projects/series-movies/src/app/services/open-url.api.service";
import { LANGUAGES_WITHOUT_NONE } from "shared/data/language.data";
import { ShareService } from "shared/services/share.service";
import {
  URL_FAVICON,
  getUrlIconsWithTooltips,
  replacePlaceholderInUrlWithSearchEngine,
} from "shared/utils/url";
import { Language } from "./enum/language.enum";
import { MediaEnum } from "./enum/media.enum";
import { ReplaceInTitleType } from "./enum/replace-fitting-type.enum";
import { SearchEngineType } from "./enum/search-engine.enum";
import { MenuItem } from "./menu-item.type";

export type SearchEngine = {
  id: string;
  name: string;
  url: string;
  image: string;
  favorite: boolean;
  showQuickAdd: boolean;
  type: SearchEngineType;
  language: Language;
  replaceSpaceInTitle: string;
  replaceInTitleType: ReplaceInTitleType;
  mediaType: MediaEnum | null;
};

export function getMenuItem(searchEngine: SearchEngine) {
  const icons: string[] = [];
  const iconsTooltip: string[] = [];

  // Serie oder Film
  if (searchEngine.mediaType === MediaEnum.SERIES) {
    icons.push("series");
    iconsTooltip.push("SERIES.");
  } else if (searchEngine.mediaType === MediaEnum.MOVIE) {
    icons.push("movie");
    iconsTooltip.push("MOVIE.");
  }

  // Sprache
  const language = LANGUAGES_WITHOUT_NONE.find(
    (language) => language.key === searchEngine.language
  );

  if (language) {
    icons.push(language.icon);
    iconsTooltip.push(language.name);
  }

  // Zusätzliche Icons
  const iconsAndTooltips = getUrlIconsWithTooltips(searchEngine.url);
  icons.push(...iconsAndTooltips.map((item) => item.icon));
  iconsTooltip.push(...iconsAndTooltips.map((item) => item.text));

  const data: MenuItem<SearchEngine> = {
    value: searchEngine,
    id: searchEngine.id,
    text: searchEngine.name,
    description: searchEngine.url,
    icons,
    iconsTooltip,
    image: searchEngine.image || URL_FAVICON + new URL(searchEngine.url).host,
    groupKey: "searchEngine",
    highlight: false,
    favorite: searchEngine.favorite,
  };

  return data;
}

export function getMenuItemQuickAdd(
  searchEngine: SearchEngine,
  groupKey: string,
  shareService: ShareService,
  title: string,
  season: number,
  episode: number,
  year: number,
  withShareButton: boolean,
  openUrlOnDeviceApiService: OpenUrlOnDeviceApiService,
  withOpenUrlButton: boolean
) {
  const icons: string[] = [];
  const iconsTooltip: string[] = [];

  // Sprache
  const language = LANGUAGES_WITHOUT_NONE.find(
    (language) => language.key === searchEngine.language
  );

  if (language) {
    icons.push(language.icon);
    iconsTooltip.push(language.name);
  }

  // Zusätzliche Icons
  const iconsAndTooltips = getUrlIconsWithTooltips(searchEngine.url);
  icons.push(...iconsAndTooltips.map((item) => item.icon));
  iconsTooltip.push(...iconsAndTooltips.map((item) => item.text));

  const actions = [];

  if (withShareButton) {
    actions.push({
      text: "SHARE",
      icon: "share",
      id: "share",
      func: () => {
        const url = replacePlaceholderInUrlWithSearchEngine(
          searchEngine,
          title,
          season,
          episode,
          year
        );
        shareService.shareUrlWithoutCatch(url);
      },
    });
  }

  if (withOpenUrlButton) {
    actions.push({
      text: "URL.OPEN_ON_OTHER_DEVICE",
      icon: "open-url-on-device",
      id: "open-url-on-device",
      func: () => {
        const url = replacePlaceholderInUrlWithSearchEngine(
          searchEngine,
          title,
          season,
          episode,
          year
        );
        openUrlOnDeviceApiService.openUrl(url);
      },
    });
  }

  const data: MenuItem<{ url: string; searchEngine?: SearchEngine }> = {
    value: { url: searchEngine.url, searchEngine },
    id: searchEngine.id,
    text: searchEngine.name,
    description: searchEngine.url,
    icon: "quick-add",
    icons,
    iconsTooltip,
    image: searchEngine.image || URL_FAVICON + new URL(searchEngine.url).host,
    groupKey,
    highlight: false,
    actions,
  };

  return data;
}
