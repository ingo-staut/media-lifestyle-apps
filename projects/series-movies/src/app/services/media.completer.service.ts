import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { MediaApiService } from "./media.api.service";

@Injectable({
  providedIn: "root",
})
export class MediaCompleterService {
  constructor(private mediaApiService: MediaApiService) {}

  completerListMedia$ = this.mediaApiService.media$.pipe(
    map((mediaList) =>
      mediaList.map((media) => {
        const entry: CompleterEntry = {
          text: media.name,
          icons: [media.type.toLowerCase()],
        };
        return entry;
      })
    )
  );
}
