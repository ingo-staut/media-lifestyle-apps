// ----------------------------------------------------------------
// RegExp als Text für den RegExp-Contructor (überall `\` => `\\`)
// ----------------------------------------------------------------
export const rx_dashSign = "(?:-|–)";
export const rx_wordEnd = "($| |\\n|\\.)";
export const rx_bracketAround = "\\(?(?:%1)\\)?";
export const rx_wordBeginning = "(\\W|^)";
export const rx_wordEndnding = "(\\W|$)";

// ----------------------------------------------------------------
// Fertige RegExp
// ----------------------------------------------------------------

export const REGEX_SPLIT_SENTENCE =
  /(?<!bzw|ca|usw|s\.o|d\.h|tipp)(^|[\n\f\r\!\.\:\?]\s?)(?=[A-Z])/gi;
export const REGEX_WORD_SPLIT = /( |-|–)/i;
export const REGEX_PRICE = /\d+((\.|\,)\d+)?/gi;
export const REGEX_MORE_THAN_ONE_SPACE = /\s+/gi;
export const REGEX_WORD_END_SPLIT = / |\n|\.|,/gi;
export const REGEX_QUOTES = /„|"|“/gi;
export const REGEX_TEXT_IN_QUOTES = /(?:„|")([^"“]+)(?:"|“)/gi;

export const REGEX_NOT_NONE = /^(?!none$).*$/;
export const REGEX_SPACES_OR_TAB = /\s{2,}|\t/gi; // Mehr als ein Leerzeichen oder Tabulator
