import { CompleterEntry } from "shared/models/completer-entry.type";
import { DropdownData } from "shared/models/dropdown.type";
import { Language } from "../models/enum/language.enum";

export const COUNTRY_UNITED_STATES_NAME = "United States";
export const COUNTRY_UNITED_STATES_ICON = "language-us";

export const LANGUAGES: DropdownData<Language, string>[] = [
  {
    key: Language.NONE,
    name: "LANGUAGE.",
    icon: "language",
  },
  {
    key: Language.GERMAN,
    name: "LANGUAGE.DE",
    icon: "language-de",
    alternativeSearchTerms: [
      Language.GERMAN,
      "ger",
      "german",
      "deutsch",
      "deutschland",
      "germany",
      "allemand",
      "alemán",
    ],
    value: "Germany",
  },
  {
    key: Language.ENGLISH,
    name: "LANGUAGE.EN",
    icon: "language-en",
    alternativeSearchTerms: [
      Language.ENGLISH,
      "eng",
      "english",
      "englisch",
      "united kingdom",
      "gb",
      "anglais",
      "inglés",
    ],
    value: "United Kingdom",
  },
  {
    key: Language.FRENCH,
    name: "LANGUAGE.FR",
    icon: "language-fr",
    alternativeSearchTerms: [
      Language.FRENCH,
      "french",
      "französisch",
      "france",
      "frankreich",
      "français",
      "francés",
    ],
    value: "France",
  },
  {
    key: Language.SPANISH,
    name: "LANGUAGE.ES",
    icon: "language-es",
    alternativeSearchTerms: [
      Language.SPANISH,
      "spanish",
      "spanisch",
      "spanien",
      "spain",
      "espagnol",
      "español",
    ],
    value: "Spain",
  },
  {
    key: Language.SWEDISH,
    name: "LANGUAGE.SV",
    icon: "language-sv",
    alternativeSearchTerms: [
      Language.SWEDISH,
      "swedish",
      "schwedisch",
      "svenska",
      "schweden",
      "sueco",
      "suédois",
      "sweden",
    ],
    value: "Sweden",
  },
  {
    key: Language.ITALIAN,
    name: "LANGUAGE.IT",
    icon: "language-it",
    alternativeSearchTerms: [
      Language.ITALIAN,
      "italia",
      "italian",
      "italien",
      "italienisch",
      "italy",
      "italie",
      "italiano",
    ],
    value: "Italian",
  },
  {
    key: Language.JAPANESE,
    name: "LANGUAGE.JA",
    icon: "language-ja",
    alternativeSearchTerms: [
      Language.JAPANESE,
      "japanese",
      "japan",
      "japanisch",
      "japonés",
      "japonais",
    ],
    value: "Japan",
  },
  {
    key: Language.KOREAN,
    name: "LANGUAGE.KO",
    icon: "language-ko",
    alternativeSearchTerms: [
      Language.KOREAN,
      "korean",
      "koreanisch",
      "korea",
      "coréen",
      "coreano",
      "south korea",
      "südkorea",
    ],
    value: "Korea",
  },
];

export const LANGUAGES_WITHOUT_NONE = LANGUAGES.slice(1);
export const LANGUAGES_SYSTEM = LANGUAGES.slice(1, 5);
export const LANGUAGES_RECIPES = LANGUAGES.slice(0, 5);

export const LANGUAGES_COMPLETER_ENTRIES = LANGUAGES.map((language) => {
  const lang: CompleterEntry = {
    text: language.name,
    alternativeNames: language.alternativeSearchTerms,
    icons: [language.icon],
  };
  return lang;
});

export function getLanguageByKey(key: Language) {
  return LANGUAGES.find((data) => data.key === key);
}

export function getLanguageIconByKey(key: Language, iconForNone: boolean): string | null {
  if (!iconForNone && (key === Language.NONE || key === undefined)) return null;

  return getLanguageByKey(key)?.icon ?? null;
}

export function findLanguageByText(text: string): DropdownData<Language, string> | null {
  return (
    LANGUAGES.find((data) => data.alternativeSearchTerms?.includes(text.toLowerCase())) ?? null
  );
}

export function findLanguageKeyByText(text: string, textIfNotFound: boolean): string {
  return (
    LANGUAGES.find((data) => data.alternativeSearchTerms?.includes(text.toLowerCase()))?.key ??
    (textIfNotFound ? text : "")
  );
}

export function findLanguageIconByText(text: string): string {
  const icon =
    LANGUAGES.find((data) => data.alternativeSearchTerms?.includes(text.toLowerCase()))?.icon ?? "";

  // ! US-Flagge für wenn Land gesucht wird
  if (text.toLowerCase() === COUNTRY_UNITED_STATES_NAME.toLowerCase()) {
    return COUNTRY_UNITED_STATES_ICON;
  }

  return icon;
}

export function findLanguageTextByText(text: string, textIfNotFound: boolean): string {
  return (
    LANGUAGES.find((data) => data.alternativeSearchTerms?.includes(text.toLowerCase()))?.name ??
    (textIfNotFound ? text : "")
  );
}

export function findCountryTextByText(text: string) {
  const country = findLanguageByText(text);
  if (text.toLowerCase() === COUNTRY_UNITED_STATES_NAME.toLowerCase()) {
    return COUNTRY_UNITED_STATES_NAME;
  }

  return country?.value;
}
