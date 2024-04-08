import { Injectable } from "@angular/core";
import { Media } from "projects/series-movies/src/app/models/media.class";
import { getTelevisionByDateAndChannel } from "projects/series-movies/src/utils/quickaddbuttons";
import { BehaviorSubject } from "rxjs";
import { ReplaceInTitleType } from "shared/models/enum/replace-fitting-type.enum";
import { Url } from "shared/models/url.class";
import { DateFns } from "shared/utils/date-fns";
import { replaceInTitle } from "shared/utils/string";
import { getIMDbUrlById } from "shared/utils/url.imdb";
import { MediaEnum } from "../../../../../../../shared/models/enum/media.enum";
import { findAllGenreIdsByNames } from "../../../data/genres.data";
import { QuickAddButtonService } from "../../quick-add-button.service";
import { QuickAddService } from "../../quick-add.service";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL, QuickAddButton, ResponseData } from "../request.api.service";

export enum OMDBApiSearchKey {
  TITLE = "t",
  SEARCH = "s",
}

enum OMDBApiType {
  SERIES = "series",
  MOVIE = "movie",
}

@Injectable({
  providedIn: "root",
})
export class OmdbApiService {
  private readonly TOKEN = "SECRET";
  private readonly TOKEN_KEY = "apikey";
  private readonly KEY_TYPE = "type";
  private readonly KEY_YEAR = "year";
  private readonly REPLACE_IN_TITLE = "+";

  private responseSubject = new BehaviorSubject<QuickAddButton[]>([]);
  generalData$ = this.responseSubject.asObservable();

  private responseJsonSubject = new BehaviorSubject<any>(null);
  generalDataJson$ = this.responseJsonSubject.asObservable();

  constructor(
    private quickAddButtonService: QuickAddButtonService,
    private quickAddService: QuickAddService,
    private requestService: RequestService
  ) {}

  async request(
    title: string,
    type: MediaEnum,
    optionals?: { year?: number; searchKey?: OMDBApiSearchKey }
  ): Promise<ResponseData | null> {
    const { year, searchKey } = optionals ?? {};
    const omdbType = this.getOMDbType(type);
    const url = this.getUrl(searchKey ?? OMDBApiSearchKey.TITLE, title, omdbType, year);

    return this.fetch(url, type);
  }

  clear() {
    this.responseSubject.next([]);
    this.responseJsonSubject.next([]);
  }

  private async fetch(url: URL, type: MediaEnum): Promise<ResponseData | null> {
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

        this.responseJsonSubject.next(data);

        if (data.Response === "True") {
          const { idImdb, quickAddData } = this.interpretResponse(data, type);
          this.responseSubject.next(quickAddData);

          return { idImdb, quickAddData };
        } else {
          console.error("Response error", url.href);

          return null;
        }
      });
  }

  private getUrl(
    searchKey: OMDBApiSearchKey,
    title: string,
    type?: OMDBApiType,
    year?: number
  ): URL {
    // https://www.omdbapi.com/?t=person+of+interest&apikey=e5cbc6cd
    const url = new URL("https://www.omdbapi.com");
    title = replaceInTitle(title, this.REPLACE_IN_TITLE, ReplaceInTitleType.REPLACE_ALL);

    url.searchParams.set(this.TOKEN_KEY, this.TOKEN);
    url.searchParams.set(searchKey, title);
    if (type) url.searchParams.set(this.KEY_TYPE, type);
    if (year) url.searchParams.set(this.KEY_YEAR, year.toString());

    return url;
  }

  private getOMDbType(type: MediaEnum) {
    switch (type) {
      case MediaEnum.SERIES:
        return OMDBApiType.SERIES;
      case MediaEnum.MOVIE:
        return OMDBApiType.MOVIE;
      default:
        return undefined;
    }
  }

  private interpretResponse(data: any, type: MediaEnum): ResponseData {
    try {
      const name = data.Title;
      const yearStart = +data.Year.split("–")[0];
      const yearEnd = type === MediaEnum.MOVIE ? undefined : +data.Year.split("–")[1];
      const runtime = +data.Runtime.replaceAll(" min", "");
      const genreIds = findAllGenreIdsByNames(data.Genre.split(", "));
      const images = data?.Poster !== "N/A" ? [data.Poster] : [];
      const ratingImdb = data?.Metascore !== "N/A" ? Number(data.imdbRating) : null;
      const ratingMetascore = data?.Metascore !== "N/A" ? Number(data.Metascore) : null;
      const idImdb = data.imdbID;
      const urlsInfo: Url[] = [new Url({ url: getIMDbUrlById(idImdb) })];
      const releaseDate = DateFns.getDateFromString(data.releaseDate, "dd MMM yyyy", new Date());

      let television = releaseDate ? getTelevisionByDateAndChannel(type, releaseDate) : null;

      this.quickAddService.showNotificationIfMediaTypeNotTheSame(data.Type, type);

      const media = new Media({
        id: "",
        type,
        name,
        yearStart,
        yearEnd,
        runtime,
        genreIds,
        images,
        urlsInfo,
        ratingImdb,
        ratingMetascore,
        television,
      });

      const quickAddData = this.quickAddButtonService.getQuickAddButton(media);

      return { idImdb, title: name, quickAddData };
    } catch (error) {
      console.error("Fehler beim interpretieren der Daten", error);
      return { idImdb: "", quickAddData: [] };
    }
  }
}
