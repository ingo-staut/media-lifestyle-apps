import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { getLanguageByKey } from "shared/data/language.data";
import { getUrlTypeDropdownDataByUrlType } from "shared/data/url-type.data";
import { Language } from "shared/models/enum/language.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { MenuItem } from "shared/models/menu-item.type";
import { SearchEngine, getMenuItemQuickAdd } from "shared/models/search-engine.type";
import { Url } from "shared/models/url.class";
import { ShareService } from "shared/services/share.service";
import { URL_FAVICON, getUrlIconsWithTooltips, getUrlTitleTypeNoteByUrl } from "shared/utils/url";
import { Media } from "../app/models/media.class";
import { OpenUrlOnDeviceApiService } from "../app/services/open-url.api.service";

@Pipe({
  name: "urlsForPlay",
})
export class UrlsForPlayPipe implements PipeTransform {
  transform(media: Media): Url | null {
    return media.getPlayUrl();
  }
}

export const URLS_MENU_GROUP_NAMES = new Map<string, string>([
  ["urlsWatch", "URL.S.WATCH"],
  ["urlsVideo", "URL.S.VIDEO"],
  ["urlsInfo", "URL.S.INFO"],
]);

@Pipe({
  name: "urlsMenu",
})
export class UrlsMenuPipe implements PipeTransform {
  constructor(
    private translateService: TranslateService,
    private shareService: ShareService,
    private openUrlOnDeviceApiService: OpenUrlOnDeviceApiService
  ) {}

  transform(
    media: Media,
    withShareButton: boolean,
    withOpenUrlOnDevice: boolean,
    searchEngines?: SearchEngine[] | null
  ) {
    const getMenuItem = (url: Url, groupKey: string) => {
      return getUrlMenuItem(
        url,
        groupKey,
        this.translateService,
        this.shareService,
        withShareButton,
        this.openUrlOnDeviceApiService,
        withOpenUrlOnDevice
      );
    };

    const urlsWatch = media.urlsWatch.map((url) => getMenuItem(url, "urlsWatch"));
    const urlsVideo = media.urlsVideo.map((url) => getMenuItem(url, "urlsVideo")).slice(0, 2);
    const urlsInfo = media.urlsInfo.map((url) => getMenuItem(url, "urlsInfo")).slice(0, 2);

    const getItemQuickAdd = (searchEngine: SearchEngine, groupKey: string) => {
      return getMenuItemQuickAdd(
        searchEngine,
        groupKey,
        this.shareService,
        media.nameOriginal || media.name,
        media.currentEpisode.season,
        media.currentEpisode.episode + 1,
        media.yearStart,
        withShareButton,
        this.openUrlOnDeviceApiService,
        withOpenUrlOnDevice
      );
    };

    const searchEnginesFavorite =
      searchEngines?.filter(
        (searchEngine) =>
          searchEngine.favorite &&
          (searchEngine.mediaType === media.type || searchEngine.mediaType === null)
      ) ?? [];

    if (!urlsWatch.length) {
      urlsWatch.push(
        ...searchEnginesFavorite
          .filter((searchEngine) => searchEngine.type === SearchEngineType.URL_WATCH)
          .map((searchEngine) => getItemQuickAdd(searchEngine, "urlsWatch"))
      );
    }

    if (!urlsVideo.length) {
      urlsVideo.push(
        ...searchEnginesFavorite
          .filter((searchEngine) => searchEngine.type === SearchEngineType.URL_VIDEO)
          .map((searchEngine) => getItemQuickAdd(searchEngine, "urlsVideo"))
      );
    }

    if (!urlsInfo.length) {
      urlsInfo.push(
        ...searchEnginesFavorite
          .filter((searchEngine) => searchEngine.type === SearchEngineType.URL_INFO)
          .map((searchEngine) => getItemQuickAdd(searchEngine, "urlsInfo"))
      );
    }

    return [...urlsWatch, ...urlsVideo, ...urlsInfo];
  }
}

function getUrlMenuItem(
  url: Url,
  groupKey: string,
  translateService: TranslateService,
  shareService: ShareService,
  withShareButton: boolean,
  openUrlOnDeviceApiService: OpenUrlOnDeviceApiService,
  withOpenUrlOnDevice: boolean
) {
  const icons: string[] = [];
  const iconsTooltip: string[] = [];

  const text = getUrlTitleTypeNoteByUrl(url, translateService);

  const type = getUrlTypeDropdownDataByUrlType(url.type);
  if (url.type !== UrlType.NONE && type && type.icon) {
    icons.push(type.icon);
    iconsTooltip.push(type.name);
  }

  const language = getLanguageByKey(url.language);
  if (url.language !== Language.NONE && language && language.icon) {
    icons.push(language.icon);
    iconsTooltip.push(language.name);
  }

  const iconsAndTooltips = getUrlIconsWithTooltips(url.url);
  icons.push(...iconsAndTooltips.map((item) => item.icon));
  iconsTooltip.push(...iconsAndTooltips.map((item) => item.text));

  const actions = [];

  if (withShareButton) {
    actions.push({
      text: "SHARE",
      icon: "share",
      id: "share",
      func: () => {
        shareService.shareUrlWithoutCatch(url.url);
      },
    });
  }

  if (withOpenUrlOnDevice) {
    actions.push({
      text: "URL.OPEN_ON_OTHER_DEVICE",
      icon: "open-url-on-device",
      id: "open-url-on-device",
      func: () => {
        openUrlOnDeviceApiService.openUrl(url.url);
      },
    });
  }

  const item: MenuItem<{ url: string; searchEngine?: SearchEngine }> = {
    text,
    description: url.url,
    image: URL_FAVICON + url.url,
    value: { url: url.url },
    icons,
    iconsTooltip,
    groupKey,
    groupName: groupKey,
    actions,
  };

  return item;
}
