import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import {
  COUNTRY_UNITED_STATES_ICON,
  COUNTRY_UNITED_STATES_NAME,
  findLanguageIconByText,
  findLanguageTextByText,
  getLanguageByKey,
  getLanguageIconByKey,
} from "shared/data/language.data";
import { DropdownData } from "shared/models/dropdown.type";
import { Language } from "shared/models/enum/language.enum";
import { joinTextWithComma } from "shared/utils/string";

@Pipe({
  name: "language",
})
export class LanguagePipe implements PipeTransform {
  transform(language?: Language): DropdownData<string, string> | null {
    if (!language) return null;
    return getLanguageByKey(language) ?? null;
  }
}

@Pipe({
  name: "languageIcon",
})
export class LanguageIconPipe implements PipeTransform {
  transform(language?: Language, iconForNone: boolean = false): string | null {
    if (!language) return null;
    return getLanguageIconByKey(language, iconForNone);
  }
}

@Pipe({
  name: "allLanguages",
})
export class AllLanguagesPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    languages: string[],
    locale: string
  ): { icons: string[]; tooltip: string; moreCount: number } {
    const icons = languages.map((lang) => findLanguageIconByText(lang)).filter((icon) => !!icon);
    const tooltip =
      languages.length === 0
        ? "LANGUAGE.NOT"
        : joinTextWithComma(
            languages.map((lang) =>
              this.translateService.instant(findLanguageTextByText(lang, true))
            ),
            this.translateService.instant("AND")
          );
    const moreCount = languages.length - icons.length;
    return { icons, tooltip, moreCount };
  }
}

@Pipe({
  name: "mostSignificantFlags",
})
export class MostSignificantFlagsPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    languages: string[],
    countries: string[],
    flagsCount: number,
    locale: string
  ): { icon: string; tooltip: string }[] {
    return getMostSignificantFlags(languages, countries, flagsCount, this.translateService);
  }
}

export function getMostSignificantFlags(
  languages: string[],
  countries: string[],
  flagsCount: number,
  translateService: TranslateService
) {
  const iconsUnique = getIconsUnique(languages, countries);

  // Alle Sprachen als Tooltip,
  // wenn nur eine Flagge angezeigt wird
  if (flagsCount === 1) {
    return [{ icon: iconsUnique[0], tooltip: oneFlagTooltip(languages, translateService) }];
  }

  return getFlags(iconsUnique, flagsCount, translateService);
}

function getTextByIcon(icon: string, translateService: TranslateService) {
  return icon === COUNTRY_UNITED_STATES_ICON
    ? COUNTRY_UNITED_STATES_NAME
    : // ! Icon und Text müssen ähnlich sein
      // ! "LANGUAGE.DE" === "language-de" ✅
      translateService.instant(icon.toUpperCase().replaceAll("-", "."));
}

function oneFlagTooltip(languages: string[], translateService: TranslateService) {
  return joinTextWithComma(
    languages.map((lang) => translateService.instant(findLanguageTextByText(lang, true))),
    translateService.instant("AND")
  );
}

function getFlags(icons: string[], flagsCount: number, translateService: TranslateService) {
  const flags = icons.slice(0, flagsCount).map((icon) => {
    const tooltip = getTextByIcon(icon, translateService);

    return {
      tooltip,
      icon,
    };
  });

  return flags;
}

function getIconsUnique(languages: string[], countries: string[]) {
  const iconsCountry = countries
    .map((country) => findLanguageIconByText(country))
    .filter((icon) => !!icon);
  const iconsLanguage = languages
    .map((lang) => findLanguageIconByText(lang))
    .filter((icon) => !!icon);

  // Listen enthalten US und EN
  // EN entfernen, nur US behalten
  const hasUS = iconsCountry.some((icon) => icon === COUNTRY_UNITED_STATES_ICON);
  const languageIndex = iconsLanguage.indexOf("language-en");
  const countryIndex = iconsCountry.indexOf("language-en");

  if (hasUS && languageIndex !== -1) iconsLanguage.splice(languageIndex, 1);
  if (hasUS && countryIndex !== -1) iconsCountry.splice(countryIndex, 1);

  const iconsLanguageAndCountry: string[] = [];
  while (iconsCountry.length || iconsLanguage.length) {
    if (iconsCountry.length) {
      iconsLanguageAndCountry.push(iconsCountry.shift()!);
    }
    if (iconsLanguage.length) {
      iconsLanguageAndCountry.push(iconsLanguage.shift()!);
    }
  }

  return [...new Set(iconsLanguageAndCountry)];
}
