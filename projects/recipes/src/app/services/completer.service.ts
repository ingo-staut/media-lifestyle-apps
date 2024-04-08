import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { map, startWith } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";

@Injectable({
  providedIn: "root",
})
export class CompleterService {
  constructor(private translateService: TranslateService) {}

  completerListDates$ = this.translateService.onLangChange.pipe(
    startWith(null),
    map(() => {
      const entries: CompleterEntry[] = [];

      const beforeYesterday = this.translateService.instant("DATE.BEFORE_YESTERDAY");
      const yesterday = this.translateService.instant("DATE.YESTERDAY");
      const today = this.translateService.instant("DATE.TODAY");
      const tomorrow = this.translateService.instant("DATE.TOMORROW");
      const afterTomorrow = this.translateService.instant("DATE.AFTER_TOMORROW");

      entries.push({
        text: today,
        icons: ["calendar-today"],
      });
      entries.push({
        text: yesterday,
        icons: ["calendar-yesterday"],
      });
      entries.push({
        text: beforeYesterday,
        icons: ["calendar-yesterday"],
      });
      entries.push({
        text: tomorrow,
        icons: ["calendar-tomorrow"],
      });
      entries.push({
        text: afterTomorrow,
        icons: ["calendar-tomorrow"],
      });

      return entries;
    })
  );
}
