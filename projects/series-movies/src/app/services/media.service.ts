import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DateFns } from "shared/utils/date-fns";
import { Media } from "../models/media.class";
import { MediaApiService } from "./media.api.service";

@Injectable({
  providedIn: "root",
})
export class MediaService {
  readonly GO_BACK_MAX_DAYS = 20;

  constructor(private mediaApiService: MediaApiService) {}

  lastEditedMedia$ = this.mediaApiService.media$.pipe(
    map((mediaList) => {
      for (var i = 0; i < this.GO_BACK_MAX_DAYS; i++) {
        const list = mediaList
          .filter((media) =>
            DateFns.isSameDate(media.editHistory[0], DateFns.addDaysToDate(new Date(), -i))
          )
          .sort(Media.sortByEditHistoryDescending);

        if (list.length) {
          return list;
        }
      }

      return [];
    })
  );
}
