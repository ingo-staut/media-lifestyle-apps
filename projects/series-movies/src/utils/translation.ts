import de from "../assets/i18n/de.json";
import en from "../assets/i18n/en.json";
import es from "../assets/i18n/es.json";
import fr from "../assets/i18n/fr.json";

import {
  getTranslationForAllLanguagesAsSearchTerms,
  getTranslationForLanguage,
} from "shared/utils/translation";

export function getAllSearchTerms(keys: string): string[] {
  return getTranslationForAllLanguagesAsSearchTerms(keys, { de, en, fr, es });
}

export function getTranslation(keys: string, language: string): string {
  switch (language) {
    case "de":
      return getTranslationForLanguage(keys, de);
    case "en":
      return getTranslationForLanguage(keys, en);
    case "fr":
      return getTranslationForLanguage(keys, fr);
    case "es":
      return getTranslationForLanguage(keys, es);
    default:
      return getTranslationForLanguage(keys, en);
  }
}
