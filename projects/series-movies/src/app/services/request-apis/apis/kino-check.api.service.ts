import { Injectable } from "@angular/core";
import { Media } from "projects/series-movies/src/app/models/media.class";
import { BehaviorSubject } from "rxjs";
import { Language } from "shared/models/enum/language.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { Url } from "shared/models/url.class";
import { getYoutubeUrlById } from "shared/utils/url.youtube";
import { MediaEnum } from "../../../../../../../shared/models/enum/media.enum";
import { QuickAddButtonService } from "../../quick-add-button.service";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL, QuickAddButton, ResponseData } from "../request.api.service";

enum KinoCheckApiType {
  SERIES = "shows",
  MOVIE = "movies",
}

enum KinoCheckApiLanguage {
  ENGLISH = "en",
  GERMAN = "de",
}

@Injectable({
  providedIn: "root",
})
export class KinoCheckApiService {
  private readonly HOST = "https://api.kinocheck.de/";
  private readonly KEY_LANGUAGE = "language";
  private readonly KEY_ID_TYPE = "imdb_id";

  private responseDataSubject = new BehaviorSubject<QuickAddButton[]>([]);
  detailedData$ = this.responseDataSubject.asObservable();

  constructor(
    private quickAddButtonService: QuickAddButtonService,
    private requestService: RequestService
  ) {}

  async requestDetailsById(
    id: string,
    type: MediaEnum,
    optionals?: { language: Language }
  ): Promise<ResponseData | null> {
    const { language } = optionals ?? {};

    // Englisch ist Standard, wenn nichts angegeben wird
    let lang = language === Language.GERMAN ? KinoCheckApiLanguage.GERMAN : undefined;
    let t = type === MediaEnum.MOVIE ? KinoCheckApiType.MOVIE : KinoCheckApiType.SERIES;

    const url = this.getDetailsByIdUrl(id, t, lang);

    return this.fetchDetailsById(url, type);
  }

  clearAll() {
    this.responseDataSubject.next([]);
  }

  private async fetchDetailsById(url: URL, type: MediaEnum): Promise<ResponseData | null> {
    console.log("Request url", url.href);

    return this.requestService
      .requestWithTimeout(CF_FETCH_URL + encodeURIComponent(url.href), {
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

        console.log("Response data", url.href, data);

        const quickAddData = this.interpretResponseDetailsById(data, type);
        this.responseDataSubject.next(quickAddData.quickAddData);

        return quickAddData;
      });
  }

  private getDetailsByIdUrl(
    id: string,
    type: KinoCheckApiType,
    language?: KinoCheckApiLanguage
  ): URL {
    // https://api.kinocheck.de/shows?imdb_id=tt19854762
    const url = new URL(this.HOST + type);

    url.searchParams.set(this.KEY_ID_TYPE, id);

    if (language) url.searchParams.set(this.KEY_LANGUAGE, language);

    return url;
  }

  private interpretResponseDetailsById(data: any, type: MediaEnum): ResponseData {
    try {
      const entry = data;
      const idImdb = entry.imdb_id;

      const youtubeVideoId = entry.trailer ? entry.trailer.youtube_video_id : undefined;

      // Trailer im Typ finden
      let urlKeysTrailer: string[] = [];

      if (youtubeVideoId) {
        urlKeysTrailer.push(youtubeVideoId);
      }

      if (Array.isArray(entry.videos)) {
        urlKeysTrailer.concat(
          new Array(...entry.videos)
            .filter(
              (video) =>
                new Array(...video.categories).includes("Trailer") ||
                video.title.toLowerCase().includes("trailer")
            )
            .map((video) => video.youtube_video_id) as string[]
        );

        if (!urlKeysTrailer.length) {
          urlKeysTrailer.concat(
            new Array(...entry.videos).map((video) => video.youtube_video_id) as string[]
          );
        }
      }

      urlKeysTrailer = [...new Set([...urlKeysTrailer])];

      const urlsVideo = urlKeysTrailer.map((urlKey) => {
        const data = new Url({ url: getYoutubeUrlById(urlKey), type: UrlType.TRAILER });
        return data;
      });

      const media = new Media({
        id: "",
        type,
        urlsVideo,
      });

      const quickAddData = this.quickAddButtonService.getQuickAddButton(media);

      return { idImdb, quickAddData };
    } catch (error) {
      console.error("Fehler beim interpretieren der Daten", error);
      return { idImdb: "", quickAddData: [] };
    }
  }
}
