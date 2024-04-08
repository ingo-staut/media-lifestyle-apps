import { DatePipe } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { DateFns } from "./date-fns";

export function getEditHistoryText(
  editHistory: Date[],
  translateService: TranslateService,
  datePipe: DatePipe
): string {
  const html_lineBreak = "<br />";
  const locale = translateService.currentLang;
  const entries: { date: Date; count: number }[] = [];
  editHistory.forEach((entry) => {
    if (entries.length && DateFns.isSameDate(entry, entries[entries.length - 1].date)) {
      entries[entries.length - 1].count = entries[entries.length - 1].count + 1;
    } else {
      entries.push({ date: entry, count: 1 });
    }
  });

  const texts = entries.map(
    (entry) =>
      entry.count.toString() +
      "x " +
      (entry.count > 9 ? "" : "&nbsp;&nbsp;") +
      datePipe.transform(entry.date, "shortDate", undefined, locale) +
      " – " +
      DateFns.formatDate(entry.date, locale, translateService, { onlyDate: true })
  );

  let text = texts.join(html_lineBreak);

  if (editHistory.length > 1) {
    const lastChange = datePipe.transform(editHistory[0], "short", undefined, locale)!;

    const creationDate = datePipe.transform(
      editHistory[editHistory.length - 1],
      "short",
      undefined,
      locale
    )!;

    text =
      "<span class='text-color-1'>" +
      translateService.instant("LAST_EDITED") +
      ": " +
      lastChange +
      " – " +
      DateFns.formatDate(editHistory[0], locale, translateService, {
        onlyDate: true,
      }) +
      html_lineBreak +
      html_lineBreak +
      translateService.instant("CREATED") +
      ": " +
      creationDate +
      " – " +
      DateFns.formatDate(editHistory[editHistory.length - 1], locale, translateService, {
        onlyDate: true,
      }) +
      "</span>" +
      html_lineBreak +
      html_lineBreak +
      "<hr class='border-color-white'>" +
      html_lineBreak +
      text;
  }

  return text;
}
