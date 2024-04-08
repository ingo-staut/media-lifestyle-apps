import { REGEX_SPLIT_TITLE_FOR_RECIPE } from "./regexp";

/**
 * Titel eines Rezepts wird von einer Überschrift
 * (wie Browser-Tab-Titel) extrahiert
 */
export function extractRecipeTitleOfText(text: string): string {
  if (!text?.trim()) return text;
  return text.split(REGEX_SPLIT_TITLE_FOR_RECIPE)[0];
}
