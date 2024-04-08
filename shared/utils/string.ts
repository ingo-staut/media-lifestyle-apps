import { ReplaceInTitleType } from "shared/models/enum/replace-fitting-type.enum";
import { DateFns } from "./date-fns";
import { REGEX_MORE_THAN_ONE_SPACE, REGEX_WORD_SPLIT } from "./regexp";

export const UNEQUAL = "≠";

/**
 * Beispiel: "hello world" => "Hello World"
 */
export function toTitleCase(text: string): string {
  if (text.length === 0) return text;

  return text.replace(/\w\S*/g, (str: string) => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  });
}

export function firstCharToTitleCase(text: string): string {
  if (text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.substring(1);
}

/**
 * Interpretiert einen String als Zahl, falls erfolgslos wird `null` zurückgegeben
 * @param text Teile des Texts werden interpretiert
 * @returns Zahl oder `null`
 */
export function getPriceOfString(text: string): number | null {
  const regex = "(\\d+(?:\\.|\\,)?\\d*) ?€";
  const match = text.match(
    // Zwei Kommazahlen hintereinander, das erste hat ein €-Zeichen
    RegExp(regex + "(?: ?(-|\\+) ?)?" + "(?:" + regex.replaceAll("€", "") + ")?")
  );
  if (match) {
    const first = +match[1].replace(",", ".");
    const aritmetic = match[2] === "-" || match[2] === "+";
    const second = +match[3]?.replace(",", ".");
    if (first) {
      if (aritmetic && match[3]) {
        return match[2] === "-" ? first - second : first + second;
      } else {
        return first;
      }
    }
  }
  return null;
}

/**
 * @param mainSeparator Falls dieses Zeichen vorkommt, wird es als Trennzeichen verwendet
 * @param separator Falls kein Trennzeichen gefunden wurde, wird dieses Zeichen verwendet
 * @param trimAll Alle Strings werden mit `trim()` bearbeitet
 * @param removeAllEmpty Alle leeren Strings werden entfernt
 * @returns Liste an Strings
 */
export function splitStringBySeparator(
  text: string,
  opts?: {
    mainSeparator?: string;
    separator?: string;
    trimAll?: boolean;
    removeAllEmpty?: boolean;
  }
): string[] {
  const { mainSeparator, separator, trimAll, removeAllEmpty } = opts ?? {};
  let split = text.trim().split(mainSeparator ?? ";");
  if (split.length === 1 && separator) split = text.trim().split(separator);

  if (trimAll) split = split.map((s) => s.trim());
  if (removeAllEmpty) split = split.filter((s) => s.length > 0);

  return split;
}

export function splitTags(text: string, separator?: string): string[] {
  return splitStringBySeparator(text, {
    mainSeparator: ";",
    separator,
    trimAll: true,
    removeAllEmpty: true,
  });
}

export function splitString(
  text: string,
  separators: string[],
  opts?: {
    cleanStringBefore?: boolean;
    cleanStringAll?: boolean;
    trimAll?: boolean;
    removeAllEmpty?: boolean;
  }
): string[] {
  const { cleanStringBefore, cleanStringAll, trimAll, removeAllEmpty } = opts ?? {
    cleanStringBefore: true,
    cleanStringAll: true,
    trimAll: false,
    removeAllEmpty: true,
  };

  if (cleanStringBefore) {
    text = cleanString(text);
  }

  if (separators.length === 0) return [text];

  const pattern = separators.map((value) => "\\" + value).join("|");
  let splitted = text.split(new RegExp(pattern));

  if (trimAll) {
    splitted = splitted.map((text) => text.trim());
  }

  if (cleanStringAll) {
    splitted = splitted.map((text) => cleanString(text));
  }

  if (removeAllEmpty) {
    splitted = splitted.filter((text) => text !== "");
  }

  return splitted;
}

/**
 * Alle Symbole werden für Regex ergänzt/escaped: `\` `^` `$` `*` `+` `?` `.` `(` `)` `|` `{` `}` `[` `]`
 */
export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

/**
 * Alle Buchstaben wie `è` `ê` `ì` `å` `æ` `ç` werden ersetzt
 */
export function forSearch(text: string): string {
  if (!text?.trim()) return text;

  return text
    .normalize("NFD")
    .replace(/[\u00AD\u002D\u2011]+/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * @param text Text, der vom User eingegeben wurde
 * @param textToCompare Text aus der DB / Umrechnungszutat / ...
 * @param alternativeNames Weitere Texte, ähnlich zu `textToCompare`
 * @param split `text` kann an beispielsweise ", " gesplittet werden
 * @returns `true`, wenn die beiden Text gleich (oder ähnlich) sind
 */
export function compareText(
  text: string,
  textToCompare: string,
  alternativeNames: string[] = [],
  split: string[] = []
): boolean {
  // Beide leer
  if (!text?.trim() && !textToCompare?.trim()) return true;
  // Einer von beiden leer
  if (!text?.trim() || !textToCompare?.trim()) return false;

  const isSame =
    text.normalize().toLowerCase()?.trim().replaceAll(/n$/gi, "") ===
      textToCompare.normalize().toLowerCase()?.trim().replaceAll(/n$/gi, "") ||
    alternativeNames.some(
      (alternativeName) =>
        alternativeName.normalize().toLowerCase()?.trim().replaceAll(/n$/gi, "") ===
        text.normalize().toLowerCase()?.trim().replaceAll(/n$/gi, "")
    );

  const allSeparatorsSplitRegex = RegExp(
    split.map((separator) => escapeRegExp(separator)).join("|")
  );

  if (!isSame) {
    return split.some(
      (separator) =>
        text
          .split(separator)[0]
          .replace(allSeparatorsSplitRegex, "")
          .normalize()
          .toLowerCase()
          .trim()
          .replaceAll(/n$/gi, "") ===
        textToCompare
          .split(separator)[0]
          .replace(allSeparatorsSplitRegex, "")
          .normalize()
          .toLowerCase()
          .trim()
          .replaceAll(/n$/gi, "")
    );
  }

  return isSame;
}

/**
 * @param text Text mit Platzhaltern wie `%1` `%2` usw.
 * @param replacers Platzhalter, die `%1` usw. ersetzen
 */
export function replaceAllPlaceholders(text: string, ...replacers: string[]) {
  replacers.forEach((replacer, index) => {
    text = text.replaceAll(`%${index + 1}`, replacer);
  });
  return text;
}

/**
 * @param text Text, in dem gesucht und erweitert wird
 * @param searchText Textbereich, der erweitert wird
 * @param before Text vor dem gefundenen `searchText`, _z.B.: "<mark>"_
 * @param after Text nach dem gefundenen `searchText`, _z.B.: "</mark>"_
 * @returns Text mit `before` und `after` Text um den gefundenen Text herum
 * @example "Hello World", "World" => "Hello <mark>World</mark>"
 */
export function extendSearchTextInTextAroundWithBeforeAndAfterText(
  text: string,
  searchText: string,
  before: string,
  after: string
) {
  searchText = searchText?.trim();

  if (!text?.trim()) return text;
  if (!searchText) return text;
  // Beide gleichzeitig nicht leer
  if (!before?.trim() && !after?.trim()) return text;

  return text
    .replaceAll(
      new RegExp("(" + getSplittedSearchText(escapeRegExp(searchText)).join("|") + ")", "gi"),
      `${before}$1${after}`
    )
    .replaceAll(`${after}${before}`, "");
}

export function replaceSelectionWithText(
  text: string,
  replaceText: string,
  selection?: { start?: number | null; end?: number | null }
) {
  const { start, end } = selection ?? {};
  const prefix = text.slice(0, start ?? -1);
  const suffix = text.slice(end ?? -1);
  return prefix + replaceText + suffix;
}

export function compareTextWithSearchValue(text: string, searchValue: string): number {
  if (!text?.trim() || !searchValue?.trim()) return 0;

  if (text === searchValue) return 100;

  text = forSearch(text);
  searchValue = forSearch(searchValue);

  if (!text || !searchValue) return 0;

  if (text === searchValue) return 90;

  if (text.includes(searchValue)) return 80;

  const textSplitted = getSplittedSearchText(text);
  const searchSplitted = getSplittedSearchText(searchValue);

  // `text` und `searchValue` müssen nicht weiter verfeinert werden,
  // da oben bereits alles lowerCase und spezielle Zeichen ersetzt
  if (searchSplitted.every((s) => textSplitted.every((t) => t === s))) return 70;

  if (searchSplitted.every((s) => textSplitted.every((t) => t.includes(s)))) return 65;

  if (searchSplitted.every((s) => textSplitted.some((t) => t.includes(s)))) return 60;

  const result = textSplitted.reduce(
    (prev, curr) => (curr in prev && prev[curr]++, prev),
    Object.fromEntries(searchSplitted.map((s) => [s, 0]))
  );

  const all = Object.values(result).length;
  const same = Object.values(result).reduce((prev, curr) => (prev += curr), 0);

  const verhaltnis = same / all;

  if (verhaltnis > 0.4) {
    return (verhaltnis * 100) / 2;
  }

  return 0;
}

function getSplittedSearchText(text: string): string[] {
  return text.split(REGEX_WORD_SPLIT).filter((t) => t.trim().length > 0);
}

function extractEmoji(text: string) {
  const match = text.match(/([\uD800-\uDBFF])/gi);
  if (match) return match[0];
  return null;
}

const FRACTIONS = new Map<string, { value: number; rounded: number }>([
  ["½", { rounded: 0.5, value: 1 / 2 }],
  ["¼", { rounded: 0.25, value: 1 / 4 }],
  ["¾", { rounded: 0.75, value: 3 / 4 }],
  ["⅛", { rounded: 0.125, value: 1 / 8 }],
  ["⅜", { rounded: 0.375, value: 3 / 8 }],
  ["⅝", { rounded: 0.625, value: 5 / 8 }],
  ["⅞", { rounded: 0.875, value: 7 / 8 }],
  ["⅕", { rounded: 0.2, value: 1 / 5 }],
  ["⅖", { rounded: 0.4, value: 2 / 5 }],
  ["⅗", { rounded: 0.6, value: 3 / 5 }],
  ["⅘", { rounded: 0.8, value: 4 / 5 }],
  ["⅓", { rounded: 0.333, value: 1 / 3 }],
  ["⅔", { rounded: 0.666, value: 2 / 3 }],
  ["⅙", { rounded: 0.166, value: 1 / 6 }],
  ["⅚", { rounded: 0.833, value: 5 / 6 }],
]);

const FRACTION_STRINGS = new Map<number, string>([
  [1 / 2, "½"],
  [1 / 4, "¼"],
  [3 / 4, "¾"],
  [1 / 8, "⅛"],
  [3 / 8, "⅜"],
  [5 / 8, "⅝"],
  [7 / 8, "⅞"],
  [1 / 5, "⅕"],
  [2 / 5, "⅖"],
  [3 / 5, "⅗"],
  [4 / 5, "⅘"],
  [1 / 3, "⅓"],
  [2 / 3, "⅔"],
  [1 / 6, "⅙"],
  [5 / 6, "⅚"],
]);

export function getDigitFromBeginningAndRemoveFromString(text: string) {
  const fromFractions = FRACTIONS.get(text.charAt(0));

  const regexDecimal = /^\d+(,|\.)\d+/; // 0.5 L Milch
  const regexFraction = /^(\d+)\/(\d+)/; // 1/2 TL Milch
  const regexRange = /^(\d+(,|\.)?\d*) ?- ?(\d+(,|\.)?\d*)/; // 0.5 - 1.5 L Milch
  const regexDigit = /^\d+/; // 10 L Milch

  const matchDecimal = text.match(regexDecimal);
  const matchFraction = text.match(regexFraction);
  const matchRange = text.match(regexRange);
  const matchDigit = text.match(regexDigit);

  const amount = matchRange
    ? Number(matchRange[1].replaceAll(",", ".")) + 0.5
    : fromFractions
    ? fromFractions.value
    : matchDecimal
    ? Number(matchDecimal[0].replaceAll(",", "."))
    : matchFraction
    ? +matchFraction[1] / +matchFraction[2]
    : matchDigit
    ? +matchDigit[0]
    : 0;

  const fractions = Array.from(FRACTION_STRINGS.values()).join("|");
  const regex = RegExp(`^(\\d+(,|\\.)?\\d*|${fractions}) ?(-|–) ?\\d+`);
  text = text.replace(regex, "").trim();

  if (fromFractions) text = text.substring(1).trim();
  text = text.replace(regexDecimal, "").trim();
  text = text.replace(regexFraction, "").trim();
  text = text.replace(regexRange, "").trim();
  text = text.replace(regexDigit, "").trim();

  return { amount, text };
}

export function getDigitAsString(number: number, locale: string): string {
  const fromFractions = FRACTION_STRINGS.get(number);

  return fromFractions ? fromFractions : number.toLocaleString(DateFns.getCompleteLocale(locale));
}

export function cleanString(text: string): string {
  if (!text) return text;
  if (!text.length) return text;

  return text.replaceAll(REGEX_MORE_THAN_ONE_SPACE, " ").trim();
}

export function getLongestString(strings: string[]) {
  return strings.reduce(
    (longest, current) => (current.length > longest.length ? current : longest),
    ""
  );
}

export function joinText(
  list: string[],
  separator: string,
  lastSeparator: string,
  showEntriesInQuotes: boolean = false
): string {
  const quotes = showEntriesInQuotes ? `"` : ``;
  return list.length <= 1
    ? quotes + list[0] + quotes
    : `${quotes}${list
        .slice(0, -1)
        .join(quotes + separator + quotes)}${quotes} ${lastSeparator} ${quotes}${
        list[list.length - 1]
      }${quotes}`;
}

export function joinTextWithComma(
  list: string[],
  andText: string,
  showEntriesInQuotes: boolean = false
): string {
  return joinText(list, ", ", andText, showEntriesInQuotes);
}

export function combinePairsInList(list: string[], combine: string = " "): string[] {
  const combinedList: string[] = [];

  for (let i = 0; i < list.length; i += 2) {
    if (i + 1 < list.length) {
      combinedList.push(list[i] + combine + list[i + 1]);
    } else {
      combinedList.push(list[i]);
    }
  }

  return combinedList;
}

function replaceUmlaut(text: string) {
  text = text.toLowerCase();
  text = text.replace("ß", "ss");
  text = text.replace("à", "a");
  text = text.replace("á", "a");
  text = text.replace("â", "a");
  text = text.replace("ã", "a");
  text = text.replace("ä", "ae");
  text = text.replace("å", "a");
  text = text.replace("æ", "ae");
  text = text.replace("ç", "c");
  text = text.replace("è", "e");
  text = text.replace("é", "e");
  text = text.replace("ê", "e");
  text = text.replace("ë", "e");
  text = text.replace("ì", "i");
  text = text.replace("í", "i");
  text = text.replace("î", "i");
  text = text.replace("ï", "i");
  text = text.replace("ð", "d");
  text = text.replace("ñ", "n");
  text = text.replace("ò", "o");
  text = text.replace("ó", "o");
  text = text.replace("ô", "o");
  text = text.replace("õ", "o");
  text = text.replace("ö", "oe");
  text = text.replace("ø", "o");
  text = text.replace("ù", "u");
  text = text.replace("ú", "u");
  text = text.replace("û", "u");
  text = text.replace("ü", "ue");
  text = text.replace("ý", "y");
  text = text.replace("þ", "p");
  text = text.replace("ÿ", "y");
  text = text.replace("ç", "c");
  text = text.replace("è", "e");
  text = text.replace("é", "e");
  text = text.replace("î", "i");
  return text;
}

export function replaceInTitle(
  title: string,
  replaceSpaceInTitle: string,
  replaceInTitleType: ReplaceInTitleType
): string {
  if (!title?.trim()) return title;

  switch (replaceInTitleType) {
    case ReplaceInTitleType.REPLACE_ONLY_SPACE:
      title = title.replaceAll(" ", replaceSpaceInTitle);
      break;
    case ReplaceInTitleType.REPLACE_ALL:
      title = replaceUmlaut(title);
      title = title.replaceAll(" ", replaceSpaceInTitle);
      title = title.replaceAll(RegExp("\\W+", "gi"), replaceSpaceInTitle); // Martina: Hill-Show -> martina-hill-show
      title = title.replaceAll(
        RegExp("\\ " + escapeRegExp(replaceSpaceInTitle) + "+", "gi"),
        replaceSpaceInTitle
      ); // ------ -> -
      break;
    case ReplaceInTitleType.REPLACE_SPACE_AND_LOWERCASE:
      title = replaceUmlaut(title);
      title = title.replaceAll(" ", replaceSpaceInTitle);
      break;
    default:
      break;
  }

  return title;
}

export function trimToString(text: string, find: string, simplify: boolean = true): string {
  const found: number = text.toLowerCase().indexOf(find.toLowerCase());

  if (found !== -1) {
    text = text.substring(0, found);
  }

  if (simplify) {
    text = text.replace(REGEX_MORE_THAN_ONE_SPACE, " ").trim();
  }

  return text;
}

export function toCamelCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getShortestText(string1: string, string2: string, notShorterThan: number): string {
  if (!string1?.trim()) return string2;
  if (!string2?.trim()) return string1;
  if (string1.length < notShorterThan && string2.length < notShorterThan) return string1;
  if (string1.length < notShorterThan) return string2;
  if (string2.length < notShorterThan) return string1;

  return string1.length < string2.length ? string1 : string2;
}
