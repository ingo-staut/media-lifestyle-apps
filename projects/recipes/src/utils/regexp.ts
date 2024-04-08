// ----------------------------------------------------------------
// RegExp als Text für den RegExp-Contructor (überall `\` => `\\`)
// ----------------------------------------------------------------

import { rx_dashSign, rx_wordEnd } from "shared/utils/regexp";

export const ca_min_etwa = "(?:(?:ca|mind?|etwa?|ungefähr).? ?)?";
export const rx_temperature = "(?:(\\d+) ?(?:° ?c?| c| ?grad|celsius))" + rx_wordEnd;
export const rx_timeInWords =
  ca_min_etwa +
  `(?:(?<minMinutes>\\d+)(?: ?${rx_dashSign} ?(?<maxMinutes>\\d+))? ?min(uten?)?\\.?|(?<minHours>\\d+)(?: ?${rx_dashSign} ?(?<maxHours>\\d+))? ?(?:std\\.?|stunden?)|(?<minDays>\\d+)(?: ?${rx_dashSign} ?(?<maxDays>\\d+))? ?tage?)`;
export const rx_topUnderHeat =
  "(?:ober(?:hitze|-)?(?:[\\/|]| und |)unterhitze|(?:[ou][\\/|][ou](?:-Hitze)?))";
export const rx_rest = "(?:(?:ruhen|gehen|stehen|ziehen|aufgehen) lassen)";

// ----------------------------------------------------------------
// Fertige RegExp
// ----------------------------------------------------------------

export const REGEX_SPLIT_TITLE_FOR_RECIPE = /( - | – |[?!:§$%=|]| recipe| rezept)/gi;
