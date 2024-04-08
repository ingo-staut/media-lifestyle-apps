import { Injectable } from "@angular/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { defaultIfEmpty, map, shareReplay, startWith } from "rxjs";
import { DateFns } from "shared/utils/date-fns";

@Injectable({
  providedIn: "root",
})
export class LocaleService {
  constructor(private translateService: TranslateService) {}

  locale$ = this.translateService.onLangChange.asObservable().pipe(
    // WORKAROUND: Wenn Suche initial geladen wird
    startWith({ lang: this.translateService.currentLang } as LangChangeEvent),
    // Neue Subscriber bekommen den letzten Wert
    shareReplay(1),
    // Wenn kein Wert vorhanden ist,
    // dann den aktuellen Wert zurückgeben
    defaultIfEmpty({ lang: this.translateService.currentLang } as LangChangeEvent),
    map((langChangeEvent: LangChangeEvent) => langChangeEvent.lang)
  );

  hourFormat$ = this.locale$.pipe(map((locale) => DateFns.getHourFormat(locale)));
}
