import { trimToString } from "shared/utils/string";

export function trimRecipeTitle(text: string) {
  return trimToString(trimToString(trimToString(text, " ("), " - "), " – ");
}
