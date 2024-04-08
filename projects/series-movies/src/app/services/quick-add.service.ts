import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { DateFns } from "shared/utils/date-fns";
import { MediaEnum } from "../../../../../shared/models/enum/media.enum";
import { getTelevisionByDateAndChannel } from "../../utils/quickaddbuttons";
import { Channel } from "../models/channel.class";
import { Media } from "../models/media.class";
import { ChannelApiService } from "./channel.api.service";
import { MediaApiService } from "./media.api.service";
import { QuickAddButtonService } from "./quick-add-button.service";
import { QuickAddButton } from "./request-apis/request.api.service";

@Injectable({
  providedIn: "root",
})
export class QuickAddService {
  private subject = new BehaviorSubject<QuickAddButton[]>([]);
  quickAddData$ = this.subject.asObservable();

  constructor(
    private mediaApiService: MediaApiService,
    private channelApiService: ChannelApiService,
    private quickAddButtonService: QuickAddButtonService,
    private notificationService: NotificationService
  ) {}

  interpretText(text: string): Media | null {
    const titles = this.extractTitles(text);

    if (!titles.length) {
      console.warn("Keine Titel erkannt!");
      return null;
    }

    const dates = DateFns.findDatesInString(text);

    if (!dates.length) {
      console.warn("Keine Datumsangaben erkannt!");
    }

    const mediaList = this.mediaApiService.mediaListSnapshot;
    const channelList = this.channelApiService.channelsSnapshot;

    const channelIds = Channel.findChannelIdsInTextAndList(channelList, text);
    const mostOccurringChannel = channelIds.length > 0 ? channelIds[0].channelId : undefined;

    const mediaIds = Media.findMediaIdsInText(titles, mediaList);
    const mostOccurringMedia = mediaIds.length > 0 ? mediaIds[0] : undefined;

    const newSeasonEpisodes = this.findSeasonInText(text);

    const type =
      text.toLowerCase().includes("staffel") ||
      text.toLowerCase().includes("season") ||
      text.toLowerCase().includes("episode") ||
      text.toLowerCase().includes("folgen")
        ? MediaEnum.SERIES
        : MediaEnum.MOVIE;

    if (mostOccurringMedia) {
      const quickAddButtons: QuickAddButton[] = [];

      newSeasonEpisodes.forEach((episodes) => {
        const m = new Media({
          id: "",
          type,
          seasons: [...mostOccurringMedia.seasons, { episodes, special: false }],
        });
        quickAddButtons.push(...this.quickAddButtonService.getQuickAddButton(m));
      });

      dates.slice(0, 3).forEach((date) => {
        const television = getTelevisionByDateAndChannel(
          mostOccurringMedia.type,
          date,
          mostOccurringChannel
        );
        const m = new Media({
          id: "",
          type,
          television,
        });
        quickAddButtons.push(...this.quickAddButtonService.getQuickAddButton(m));
      });

      this.subject.next(quickAddButtons);
      return mostOccurringMedia;
    }

    // Wenn keine Serie / Film gefunden wurde
    else {
      const quickAddButtons: QuickAddButton[] = [];

      newSeasonEpisodes.forEach((episodes) => {
        const m = new Media({
          id: "",
          type,
          seasons: [{ episodes, special: false }],
        });
        quickAddButtons.push(...this.quickAddButtonService.getQuickAddButton(m));
      });

      dates.slice(0, 3).forEach((date) => {
        const television = getTelevisionByDateAndChannel(type, date, mostOccurringChannel);
        const m = new Media({
          id: "",
          type,
          television,
        });
        quickAddButtons.push(...this.quickAddButtonService.getQuickAddButton(m));
      });

      this.subject.next(quickAddButtons);

      const m = new Media({
        id: "",
        type,
        name: titles.sort((a: string, b: string) => a.length - b.length)[0],
      });

      return m;
    }
  }

  private extractTitles(text: string): string[] {
    const rx_quotedWord = new RegExp('(?:"|„|“|`|\')([^"|„|“]{1,60})(?:"|„|“|`|\')', "g");
    const titlesList: string[] = [];

    let match;
    while ((match = rx_quotedWord.exec(text)) !== null) {
      titlesList.push(match[1]);
    }

    return titlesList;
  }

  clear() {
    this.subject.next([]);
  }

  private findSeasonInText(text: string) {
    const pattern: RegExp = /\b(\w+)(?:teilige?)\b/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      matches.push(match[1]);
    }

    const numbersAsText = [
      "",
      "ein",
      "zwei",
      "drei",
      "vier",
      "fünf",
      "sechs",
      "sieben",
      "acht",
      "neuen",
      "zehn",
      "elf",
      "zwölf",
    ];

    const newSeasonEpisodes = [
      ...new Set(
        matches.map((match) => numbersAsText.indexOf(match)).filter((season) => season > 1)
      ),
    ];

    return newSeasonEpisodes;
  }

  showNotificationIfMediaTypeNotTheSame(typeText: string, type: MediaEnum) {
    if (!typeText) return;

    const typeCompare = this.getMediaTypeFromResult(typeText);

    // Ist Serie, aber der gesetzte Typ ist keine Serie
    if (
      (typeCompare === MediaEnum.SERIES && type !== MediaEnum.SERIES) ||
      (typeCompare === MediaEnum.MOVIE && type !== MediaEnum.MOVIE)
    ) {
      this.notificationService.show(NotificationTemplateType.MEDIA_TYPE_NOT_SAME);
    }
  }

  getMediaTypeFromResult(typeText: string) {
    if (!typeText) return;

    typeText = typeText.toLowerCase();
    const seriesSearchTexts = ["tv_series", "series"];
    const movieSearchTexts = ["movie"];

    if (seriesSearchTexts.indexOf(typeText) !== -1) {
      return MediaEnum.SERIES;
    } else if (movieSearchTexts.indexOf(typeText) !== -1) {
      return MediaEnum.MOVIE;
    }

    return;
  }
}
