import { Injectable } from "@angular/core";
import { Media } from "projects/series-movies/src/app/models/media.class";
import {
  appendGenresByTagContents,
  getCountriesWithObjects,
  getLanguages,
  getTelevisionByDateAndChannel,
} from "projects/series-movies/src/utils/quickaddbuttons";
import { BehaviorSubject } from "rxjs";
import { findLanguageByText } from "shared/data/language.data";
import { UrlType } from "shared/models/enum/url-type.enum";
import { Url } from "shared/models/url.class";
import { DateFns } from "shared/utils/date-fns";
import { getIMDbUrlById } from "shared/utils/url.imdb";
import { getYoutubeUrlById } from "shared/utils/url.youtube";
import { MediaEnum } from "../../../../../../../shared/models/enum/media.enum";
import { findAllGenreIdsByNames } from "../../../data/genres.data";
import { QuickAddButtonService } from "../../quick-add-button.service";
import { QuickAddService } from "../../quick-add.service";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL, QuickAddButton, ResponseData } from "../request.api.service";

@Injectable({
  providedIn: "root",
})
export class MyApiFilmsTMDbApiService {
  private readonly URL_IMAGE = "https://image.tmdb.org/t/p/original"; // + Bilddateinamen
  private readonly TOKEN = "5be8653a-4d9f-4164-85d9-c3d6adfb21df";
  private readonly HOST = "https://www.myapifilms.com/tmdb/movieInfoImdb";
  private readonly KEY_TOKEN = "token";
  private readonly KEY_ID = "idIMDB";
  private readonly KEY_TAGS = "keywords";
  private readonly KEY_CREW = "credits";
  private readonly KEY_IMAGES = "images";
  private readonly KEY_VIDEOS = "videos";
  private readonly VALUE_TAGS = "1";
  private readonly VALUE_CREW = "1";
  private readonly VALUE_IMAGES = "1";
  private readonly VALUE_VIDEOS = "1";

  private responseDataSubject = new BehaviorSubject<QuickAddButton[]>([]);
  detailedData$ = this.responseDataSubject.asObservable();

  constructor(
    private quickAddButtonService: QuickAddButtonService,
    private quickAddService: QuickAddService,
    private requestService: RequestService
  ) {}

  async requestDetailsById(id: string, type: MediaEnum): Promise<ResponseData | null> {
    const url = this.getDetailsByIdUrl(id);

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

  private getDetailsByIdUrl(id: string): URL {
    // https://www.myapifilms.com/tmdb/movieInfoImdb?idIMDB=tt1375666&images=1&keywords=1&videos=1&token=5be8653a-4d9f-4164-85d9-c3d6adfb21df
    const url = new URL(this.HOST);

    url.searchParams.set(this.KEY_ID, id);
    url.searchParams.set(this.KEY_TOKEN, this.TOKEN);
    url.searchParams.set(this.KEY_TAGS, this.VALUE_TAGS);
    // url.searchParams.set(this.KEY_CREW, this.KEY_CREW);
    url.searchParams.set(this.KEY_IMAGES, this.VALUE_IMAGES);
    url.searchParams.set(this.KEY_VIDEOS, this.VALUE_VIDEOS);

    return url;
  }

  private interpretResponseDetailsById(data: any, type: MediaEnum): ResponseData {
    try {
      const entry = data.data;
      if (!entry) return { idImdb: "", quickAddData: [] };
      const name = entry.title;
      const nameOriginal = entry.original_title;
      const runtime = entry.runtime;
      const yearStart =
        DateFns.getDateOfStringWithFormatting(entry.release_date, "yyyy-MM-dd")?.getFullYear() ?? 0;
      const ratingImdb = entry.rating < 0 ? null : entry.rating;

      const images: string[] = [];

      if (Array.isArray(entry.images)) {
        new Array(...entry.images).forEach((image) => {
          if (image.image_type === "POSTER") images.push(this.URL_IMAGE + image.file_path);
        });

        // Nur die ersten 3
        images.splice(3);

        new Array(...entry.images).forEach((image) => {
          if (image.image_type === "BACKDROP") images.push(this.URL_IMAGE + image.file_path);
        });

        // Nur die ersten 6 (Also maximal 3 Poster und 3 Backdrops)
        images.splice(6);
      }

      let genreIds = findAllGenreIdsByNames((entry.genres as any[]).map((genre) => genre.name));
      const tags = (entry.keywords as any[]).map((keyword) => keyword.name);
      const idImdb = entry.imdb_id;
      const urlsInfo: Url[] = [new Url({ url: getIMDbUrlById(idImdb) })];
      const releaseDate = DateFns.getDateFromString(entry.releaseDate, "yyyy-MM-dd", new Date());
      const tagline = entry.tagline;
      const languages_tmp: string[] = entry.original_language
        ? getLanguages([entry.original_language])
        : [];

      const additionalLanguages = (entry.spoken_languages as any[]).map(
        (language: any) => language.name
      ) as string[];
      languages_tmp.push(...getLanguages(additionalLanguages));

      const languages = [...new Set(languages_tmp)];

      const countries = getCountriesWithObjects(entry.production_countries as any[]);

      let television = releaseDate ? getTelevisionByDateAndChannel(type, releaseDate) : null;

      if (genreIds && tags) genreIds = appendGenresByTagContents(genreIds, tags);

      // Trailer im Typ finden
      let urlKeysTrailer: string[] = [];

      if (Array.isArray(entry.videos)) {
        urlKeysTrailer = new Array(...entry.videos)
          .filter(
            (video) =>
              video.site.toLowerCase() === "youtube" && video.type.toLowerCase().includes("trailer")
          )
          .map((video) => video.key) as string[];

        if (!urlKeysTrailer.length) {
          // Trailer im Namen finden
          urlKeysTrailer = new Array(...entry.videos)
            .filter(
              (video) =>
                video.site.toLowerCase() === "youtube" &&
                video.name.toLowerCase().includes("trailer")
            )
            .map((video) => video.key) as string[];
        }
      }

      const urlsVideo = urlKeysTrailer.map((urlKey) => {
        const data = new Url({
          url: getYoutubeUrlById(urlKey),
          type: UrlType.TRAILER,
          language: findLanguageByText(languages[0])?.key,
        });
        return data;
      });

      this.quickAddService.showNotificationIfMediaTypeNotTheSame(entry.type, type);

      // ! similar movies

      // ! status <- z.B.: "Released"

      const media = new Media({
        id: "",
        type,
        name,
        nameOriginal,
        yearStart,
        runtime,
        genreIds,
        images,
        urlsInfo,
        urlsVideo,
        ratingImdb,
        tags,
        television,
        tagline,
        languages,
        countries,
      });

      const quickAddData = this.quickAddButtonService.getQuickAddButton(media);

      return { idImdb, title: name, quickAddData };
    } catch (error) {
      console.error("Fehler beim interpretieren der Daten", error);
      return { quickAddData: [] };
    }
  }
}
