import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { syntaxHighlight } from "shared/utils/json-highligh";
import {
  compareText,
  extendSearchTextInTextAroundWithBeforeAndAfterText,
  joinTextWithComma,
  trimToString,
} from "shared/utils/string";

@Pipe({
  name: "cutString",
})
export class SplitStringPipe implements PipeTransform {
  /**
   * Schneidet den Text vom ersten Vorkommen des Splitters bis zum Ende ab
   * @param splitter An dieser Stelle wird der Text abgeschnitten
   * @param cut Ob überhaupt getrennt werden sollen
   * @param length Anzahl existierender Elemente
   * @param threshold Wert ab dem geteilt wird
   * @returns
   */
  transform(
    text: string,
    splitter: string,
    cut: boolean = true,
    length: number = 0,
    threshold: number = 0
  ): string {
    return cut ? (length >= threshold ? text.split(splitter)[0] : text) : text;
  }
}

@Pipe({
  name: "highlightQuotesInText",
})
export class HighlightQuotesInTextPipe implements PipeTransform {
  transform(text: string): string {
    return text?.replaceAll(RegExp('(".*")', "gi"), "<strong>$1</strong>");
  }
}

@Pipe({
  name: "firstCharToLowercase",
})
export class FirstCharToLowercasePipe implements PipeTransform {
  transform(text: string, locale: string): string {
    if (!text) return text;

    // Erster
    return locale === "de" ? text : text[0].toLowerCase() + text.substring(1);
  }
}

@Pipe({
  name: "toLowercase",
})
export class ToLowercasePipe implements PipeTransform {
  transform(text: string, locale: string): string {
    if (!text) return text;
    if (locale !== "de") return text.toLowerCase();
    return text;
  }
}

@Pipe({
  name: "extendText",
})
export class ExtendTextPipe implements PipeTransform {
  transform(text: string, replaceText: string, before: string, after: string): string {
    return extendSearchTextInTextAroundWithBeforeAndAfterText(text, replaceText, before, after);
  }
}

@Pipe({
  name: "equal",
})
export class EqualPipe implements PipeTransform {
  transform(text: string, textToCompare: string, strict = true): boolean {
    return strict ? text === textToCompare : compareText(text, textToCompare);
  }
}

@Pipe({
  name: "syntaxHighlight",
})
export class SyntaxHighlightPipe implements PipeTransform {
  transform(text: string): string {
    return syntaxHighlight(text);
  }
}

@Pipe({
  name: "joinTextWithComma",
})
export class JoinTextWithCommaPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(texts: string[], locale: string): string {
    return joinTextWithComma(texts, this.translateService.instant("AND"));
  }
}

@Pipe({
  name: "trimToString",
})
export class TrimToStringPipe implements PipeTransform {
  transform(text: string, find: string, simplify: boolean = true): string {
    return trimToString(text, find, simplify);
  }
}

@Pipe({
  name: "replaceAll",
})
export class ReplaceAllPipe implements PipeTransform {
  transform(text: string, replace: string, replaceWith: string): string {
    return text?.replaceAll(replace, replaceWith);
  }
}
