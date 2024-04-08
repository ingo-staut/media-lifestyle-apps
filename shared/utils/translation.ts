export type LanguageJsons = {
  de: any;
  en: any;
  fr: any;
  es: any;
};

export function getTranslationForAllLanguagesAsSearchTerms(
  keys: string,
  jsons: LanguageJsons
): string[] {
  const de = getTranslationForLanguage(keys, jsons.de).split(" / ");
  const en = getTranslationForLanguage(keys, jsons.en).split(" / ");
  const fr = getTranslationForLanguage(keys, jsons.fr).split(" / ");
  const es = getTranslationForLanguage(keys, jsons.es).split(" / ");

  return [...de, ...en, ...fr, ...es];
}

function getTranslationForAllLanguages(keys: string, jsons: LanguageJsons): string[] {
  const de = getTranslationForLanguage(keys, jsons.de);
  const en = getTranslationForLanguage(keys, jsons.en);
  const fr = getTranslationForLanguage(keys, jsons.fr);
  const es = getTranslationForLanguage(keys, jsons.es);

  return [de, en, fr, es];
}

export function getTranslationForLanguage(keys: string, json: any) {
  try {
    return (
      keys.split(".").reduce((acc: any, key: any) => {
        return acc[key] as string;
      }, json) as string
    ).toLowerCase();
  } catch (error) {
    console.log(keys);
    return "";
  }
}
