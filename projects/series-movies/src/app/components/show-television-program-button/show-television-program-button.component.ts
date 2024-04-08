import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MenuItem } from "shared/models/menu-item.type";
import { LocaleService } from "shared/services/locale.service";
import { UrlService } from "shared/services/url.service";
import { DateFns } from "shared/utils/date-fns";
import { URL_REPLACER_SEARCHTEXT } from "shared/utils/url";

enum ProgramType {
  HOERZU = "HOERZU",
  TV_DE = "TV_DE",
  TV_SPIELFILM = "TV_SPIELFILM",
}

type Program = {
  url: string;
  format: string;
};

type ProgramMenuItemClickedType = { event?: MouseEvent; value: Program };

@Component({
  selector: "show-television-program-button[locale]",
  templateUrl: "./show-television-program-button.component.html",
  styleUrls: ["./show-television-program-button.component.scss"],
})
export class ShowTelevisionProgramButton implements OnChanges {
  @Input() date: Date | null;
  @Input() multipleDays?: number;
  @Input() locale: string | null;

  menuItems: MenuItem<Program>[] = [];

  constructor(
    private urlService: UrlService,
    protected localeService: LocaleService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["locale"]?.currentValue) {
      this.menuItems = [
        {
          id: "",
          text: this.date
            ? DateFns.formatDateExtraShortWithShortDay(this.date, this.locale ?? "de")
            : this.translateService.instant("DATE.NEXT_X_DAYS", { days: this.multipleDays }),
          value: { url: "", format: "" },
          groupKey: "date",
        },
        {
          id: ProgramType.HOERZU,
          text: "Hörzu",
          image: "https://www.appgefahren.de/wp-content/uploads/2018/04/hoerzu-ipad-icon.jpg",
          value: {
            url: `https://www.hoerzu.de/tv-programm/${URL_REPLACER_SEARCHTEXT}/`,
            format: "dd.MM.yyyy",
          },
        },
        {
          id: ProgramType.TV_DE,
          text: "TV.de",
          image: "https://cfwebsites-71f3.kxcdn.com/static/images/site_icon/favicon.png",
          value: { url: `https://tv.de/programm/${URL_REPLACER_SEARCHTEXT}`, format: "dd.MM.yyyy" },
        },
        {
          id: ProgramType.TV_SPIELFILM,
          text: "TV Spielfilm",
          image: "https://www.turi2.de/wp-content/uploads/2015/03/TV-Spielfilm.jpg",
          value: {
            url: `https://www.tvspielfilm.de/tv-programm/tv-sender/?page=1&date=${URL_REPLACER_SEARCHTEXT}`,
            format: "yyyy-MM-dd",
          },
        },
      ];
    }
  }

  click(event: ProgramMenuItemClickedType) {
    if (this.multipleDays && !this.date) {
      this.openMultipleNextDays(this.multipleDays, event);
      return;
    }

    this.openByDate(this.date, event);
  }

  openMultipleNextDays(multipleDays: number, data: ProgramMenuItemClickedType) {
    if (!multipleDays) return;

    // +1 wegen inkl. Heute // z.B.: Bei nächsten 14 Tagen, 15 URLs öffnen
    for (let i = 0; i < multipleDays + 1; i++) {
      const startDate = DateFns.addDaysToDate(new Date(), i);
      const url = data.value.url.replaceAll(
        URL_REPLACER_SEARCHTEXT,
        DateFns.formatDateByFormatString(startDate, data.value.format)
      );

      this.urlService.openOrCopyUrl({ url, event: data.event });
    }
  }

  openByDate(date: Date | null, data: ProgramMenuItemClickedType) {
    if (!date) return;

    const url = data.value.url.replaceAll(
      URL_REPLACER_SEARCHTEXT,
      DateFns.formatDateByFormatString(date, data.value.format)
    );

    this.urlService.openOrCopyUrl({ url, event: data.event });
  }
}
