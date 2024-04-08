import { Injectable } from "@angular/core";
import { Media } from "projects/series-movies/src/app/models/media.class";
import { getTelevisionByDateAndChannel } from "projects/series-movies/src/utils/quickaddbuttons";
import { BehaviorSubject } from "rxjs";
import { DateFns } from "shared/utils/date-fns";
import { getNameOfYoutubeTrailerTitle } from "shared/utils/youtube";
import { MediaEnum } from "../../../../../../../shared/models/enum/media.enum";
import { Channel } from "../../../models/channel.class";
import { ChannelApiService } from "../../channel.api.service";
import { QuickAddButtonService } from "../../quick-add-button.service";
import { RequestService } from "../../request.service";
import { QuickAddButton } from "../request.api.service";

export const CF_URL = "";
export const CF_YOUTUBE_API = CF_URL + "fetchYouTubeData?id=";

@Injectable({
  providedIn: "root",
})
export class YoutubeApiService {
  private responseDataSubject = new BehaviorSubject<QuickAddButton[]>([]);
  data$ = this.responseDataSubject.asObservable();

  constructor(
    private quickAddButtonService: QuickAddButtonService,
    private channelApiService: ChannelApiService,
    private requestService: RequestService
  ) {}

  requestById(youtubeId: string, type: MediaEnum) {
    return this.fetch(youtubeId, type);
  }

  private async fetch(youtubeId: string, type: MediaEnum) {
    return this.requestService
      .requestWithTimeout(CF_YOUTUBE_API + encodeURIComponent(youtubeId), {
        method: "GET",
        credentials: "include",
      })
      .then((response) => {
        if (!response) return null;

        console.log("Request url (complete)", response.url);

        return response.json();
      })
      .then((data) => {
        if (!data) return null;

        console.log("Response data", youtubeId, data);

        const entries = this.interpretResponse(data, type);
        this.responseDataSubject.next(entries);

        return entries;
      });
  }

  clearAll() {
    this.responseDataSubject.next([]);
  }

  interpretResponse(data: any, type: MediaEnum): QuickAddButton[] {
    const details = (data.items as any[])[0];
    const channelTitle = details.snippet.channelTitle;
    const description = details.snippet.description;
    const youtubeId = details.ID;
    const title = details.snippet.title;
    const tags = details.snippet.tags as string[];

    console.log(tags);

    const name = getNameOfYoutubeTrailerTitle(title);
    const dates = DateFns.findDatesInString(description);

    const channelIds = Channel.findChannelIdsInTextAndList(
      this.channelApiService.channelsSnapshot,
      title,
      tags
    );
    const mostOccurringChannel = channelIds.length > 0 ? channelIds[0].channelId : undefined;

    const television = getTelevisionByDateAndChannel(type, dates[0], mostOccurringChannel);

    const media = new Media({ id: "", type, name, television });

    const quickAddData = this.quickAddButtonService.getQuickAddButton(media);

    return quickAddData;
  }
}
