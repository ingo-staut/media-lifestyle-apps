import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { getLanguageIconByKey } from "shared/data/language.data";
import { getUrlTypeDropdownDataByUrlType } from "shared/data/url-type.data";
import { DropdownData } from "shared/models/dropdown.type";
import { Language } from "shared/models/enum/language.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { Url } from "shared/models/url.class";
import {
  getTitleOfUrl,
  getUrlIcons,
  getUrlTitleTypeNoteByUrl,
  getUrlTypeNoteByUrl,
  isValidHttpUrl,
} from "shared/utils/url";
import { getIMDbIdFromUrl } from "shared/utils/url.imdb";
import { getYoutubeIdFromUrl } from "shared/utils/url.youtube";

@Pipe({
  name: "isValidUrl",
})
export class IsValidUrlPipe implements PipeTransform {
  transform(url: string): boolean {
    return isValidHttpUrl(url);
  }
}

@Pipe({
  name: "urlTitle",
})
export class UrlTitlePipe implements PipeTransform {
  transform(url: string, note?: string): string {
    return getTitleOfUrl(url) + (note ? ` (${note})` : "");
  }
}

@Pipe({
  name: "urlType",
})
export class UrlTypePipe implements PipeTransform {
  transform(type: UrlType, iconForNone: boolean = false): DropdownData<string, string> | undefined {
    if (!iconForNone && type === UrlType.NONE) return undefined;
    return getUrlTypeDropdownDataByUrlType(type);
  }
}

@Pipe({
  name: "urlWithTypeByUrl",
})
export class UrlWithTypeByUrlPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(url: Url, locale: string): string {
    return getUrlTypeNoteByUrl(url, this.translateService);
  }
}

@Pipe({
  name: "urlTitleWithTypeByUrl",
})
export class UrlTitleWithTypeByUrlPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(url: Url, locale: string): string {
    return getUrlTitleTypeNoteByUrl(url, this.translateService);
  }
}

@Pipe({
  name: "url",
})
export class UrlPipe implements PipeTransform {
  transform(url?: string): string {
    if (!url) return "";

    if (isValidHttpUrl(url)) return new URL(url).href;
    return "";
  }
}

@Pipe({
  name: "isImdbOrYoutubeUrl",
})
export class IsImdbOrYoutubeUrlPipe implements PipeTransform {
  transform(url?: string): boolean {
    if (!url || !isValidHttpUrl(url)) return false;

    return !!getIMDbIdFromUrl(url) || !!getYoutubeIdFromUrl(url);
  }
}

@Pipe({
  name: "urlIcons",
})
export class UrlIconsPipe implements PipeTransform {
  transform(url: string, language?: Language): string[] {
    if (!language && !url) return [];

    const icons: string[] = [];

    if (language) {
      const languageIcon = getLanguageIconByKey(language, false);

      if (languageIcon) icons.push(languageIcon);
    }

    icons.push(...getUrlIcons(url));

    return icons;
  }
}
