import { isValidHttpUrl } from "shared/utils/url";

export enum ImportRecipeFromWebsiteKey {
  EAT_SMARTER = 1,
  BIANCA_ZAPATKA,
  SLOWLY_VEGGIE,
  EAT_THIS,
}

export function getImportRecipeFromWebsiteType(url: string) {
  if (!isValidHttpUrl(url)) return;

  if (url.includes("eatsmarter")) return ImportRecipeFromWebsiteKey.EAT_SMARTER;
  if (url.includes("biancazapatka")) return ImportRecipeFromWebsiteKey.BIANCA_ZAPATKA;
  if (url.includes("slowlyveggie")) return ImportRecipeFromWebsiteKey.SLOWLY_VEGGIE;
  if (url.includes("eat-this")) return ImportRecipeFromWebsiteKey.EAT_THIS;

  return;
}
