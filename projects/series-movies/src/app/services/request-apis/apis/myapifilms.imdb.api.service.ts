import { Injectable } from "@angular/core";
import { Media } from "projects/series-movies/src/app/models/media.class";
import {
  appendGenresByTagContents,
  getLanguages,
  getTelevisionByDateAndChannel,
} from "projects/series-movies/src/utils/quickaddbuttons";
import { BehaviorSubject } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { Language } from "shared/models/enum/language.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { ReplaceInTitleType } from "shared/models/enum/replace-fitting-type.enum";
import { Url } from "shared/models/url.class";
import { NotificationService } from "shared/services/notification.service";
import { DateFns } from "shared/utils/date-fns";
import { replaceInTitle } from "shared/utils/string";
import { getIMDbUrlById } from "shared/utils/url.imdb";
import { MediaEnum } from "../../../../../../../shared/models/enum/media.enum";
import { findAllGenreIdsByNames } from "../../../data/genres.data";
import { DialogService } from "../../../dialogs/dialog/dialog.service";
import { QuickAddButtonService } from "../../quick-add-button.service";
import { QuickAddService } from "../../quick-add.service";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL, QuickAddButton, ResponseData } from "../request.api.service";
import { EpisodateSeasonsApiService } from "./episodate-seasons.api.service";
import { KinoCheckApiService } from "./kino-check.api.service";
import { MovieDatabaseSeasonsApiService } from "./movie-database.seasons.api.service";
import { MyApiFilmsTMDbApiService } from "./myapifilms.tmdb.api.service";

export type SearchResults = {
  entries: ResultEntry[];
};

export type ResultEntry = {
  media: Media;
  plot: string;
  idImdb: string;
};

@Injectable({
  providedIn: "root",
})
export class MyApiFilmsIMDbApiService {
  private readonly TOKEN = "5be8653a-4d9f-4164-85d9-c3d6adfb21df";
  private readonly HOST = "https://www.myapifilms.com/imdb/idIMDB";
  private readonly REPLACE_IN_TITLE = "+";
  private readonly KEY_TOKEN = "token";
  private readonly KEY_LIMIT = "limit";
  private readonly KEY_SEARCH_TERM = "title";
  private readonly KEY_ID = "idIMDB";
  private readonly KEY_SIMLIAR = "similarMovies";
  private readonly KEY_TAGS = "keyword";
  private readonly KEY_DIRECTORS = "directors";
  private readonly KEY_WRITERS = "writers";
  private readonly VALUE_SIMLIAR = "1";
  private readonly VALUE_TAGS = "1";
  private readonly VALUE_DIRECTORS = "1";
  private readonly VALUE_WRITERS = "1";

  private responseSearchResultsSubject = new BehaviorSubject<SearchResults | null>(null);
  searchResults$ = this.responseSearchResultsSubject.asObservable();

  private responseDataSubject = new BehaviorSubject<QuickAddButton[]>([]);
  detailedData$ = this.responseDataSubject.asObservable();

  constructor(
    private quickAddButtonService: QuickAddButtonService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private myApiFilmsTMDbApiService: MyApiFilmsTMDbApiService,
    private movieDatabaseSeasonsApiService: MovieDatabaseSeasonsApiService,
    private kinoCheckApiService: KinoCheckApiService,
    private quickAddService: QuickAddService,
    private requestService: RequestService,
    private episodateSeasonsApiService: EpisodateSeasonsApiService
  ) {}

  async requestSearchResults(title: string, type: MediaEnum): Promise<SearchResults | null> {
    const url = this.getSearchResultsUrl(title);

    return this.fetchSearchResults(url, type);
  }

  async requestSearchResultsWithNotificationAndDialog(title: string, type: MediaEnum) {
    const url = this.getSearchResultsUrl(title);

    this.fetchSearchResults(url, type).then((data) => {
      if (!data || !data.entries.length) {
        this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);
        return;
      }

      this.openApiSearchResults(data, type);
    });
  }

  openApiSearchResults(data: SearchResults, type: MediaEnum) {
    const d: DialogData<string> = {
      title: "SERIES_AND_MOVIES",
      icons: ["media"],
      objectLists: [
        {
          placeholder: "SEARCH_RESULTS",
          data: data.entries.map((entry) => entry.media),
        },
      ],
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
    };

    this.dialogService.open(d).subscribe((data) => {
      if (data?.actionApply) {
        const id = data.objectListInputs[0].id;

        this.requestAllDetailsById(id, type);
      }
    });
  }

  requestAllDetailsById(id: string, type: MediaEnum) {
    // Film: IMDb + TMDb
    if (type === MediaEnum.MOVIE) {
      this.myApiFilmsTMDbApiService.requestDetailsById(id, type).then((data) => {
        if (!data) {
          this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);
          return;
        }

        if (data.idImdb) this.requestsById(data.idImdb, type, data.title);
      });
      this.requestDetailsById(id, type).then((data) => {
        if (!data) {
          this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);
          return;
        }

        if (data.idImdb) this.requestsById(data.idImdb, type, data.title);
      });
    }

    // serie: Nur IMDb
    else {
      this.requestDetailsById(id, type).then((data) => {
        if (!data) {
          this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);
          return;
        }

        if (data.idImdb) this.requestsById(data.idImdb, type, data.title);
      });
    }
  }

  async requestDetailsById(id: string, type: MediaEnum): Promise<ResponseData | null> {
    const url = this.getDetailsByIdUrl(id);

    return this.fetchDetailsById(url, type);
  }

  clearAll() {
    this.responseSearchResultsSubject.next(null);
    this.responseDataSubject.next([]);
  }

  private requestsById(id: string, type: MediaEnum, title?: string) {
    // Staffeln finden nur für Serien
    if (type === MediaEnum.SERIES) {
      this.movieDatabaseSeasonsApiService.request(id, type).catch(() => {
        // Staffel konnte mit API nicht gefunden werden,
        // andere API nehmen
        if (title) this.episodateSeasonsApiService.request(title, type);
      });
    }

    // Trailer von KinoCheck,
    // falls keine englischen Trailer gefunden wurden,
    // dann nach deutschen Trailern suchen
    this.kinoCheckApiService.requestDetailsById(id, type).catch(() => {
      this.kinoCheckApiService.requestDetailsById(id, type, { language: Language.GERMAN });
    });
  }

  private async fetchSearchResults(url: URL, type: MediaEnum): Promise<SearchResults | null> {
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

        const entries = this.interpretResponseSearchResults(data, type);
        const searchResults = { entries: entries };
        this.responseSearchResultsSubject.next(searchResults);

        return searchResults;
      });
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

  private getSearchResultsUrl(title: string): URL {
    // https://www.myapifilms.com/imdb/idIMDB?title=100+dinge&limit=5&token=5be8653a-4d9f-4164-85d9-c3d6adfb21df
    const url = new URL(this.HOST);
    title = replaceInTitle(title, this.REPLACE_IN_TITLE, ReplaceInTitleType.REPLACE_ALL);

    url.searchParams.set(this.KEY_SEARCH_TERM, title);
    url.searchParams.set(this.KEY_TOKEN, this.TOKEN);
    url.searchParams.set(this.KEY_LIMIT, "5");

    return url;
  }

  private getDetailsByIdUrl(id: string): URL {
    // https://www.myapifilms.com/imdb/idIMDB?idIMDB=tt1839578&limit=5&token=5be8653a-4d9f-4164-85d9-c3d6adfb21df&similarMovies=1&keyword=1&directors=1&writers=1
    const url = new URL(this.HOST);

    url.searchParams.set(this.KEY_ID, id);
    url.searchParams.set(this.KEY_TOKEN, this.TOKEN);
    url.searchParams.set(this.KEY_SIMLIAR, this.VALUE_SIMLIAR);
    url.searchParams.set(this.KEY_TAGS, this.VALUE_TAGS);
    url.searchParams.set(this.KEY_DIRECTORS, this.VALUE_DIRECTORS);
    url.searchParams.set(this.KEY_WRITERS, this.VALUE_WRITERS);

    return url;
  }

  private interpretResponseSearchResults(data: any, type: MediaEnum): ResultEntry[] {
    const entries = data.data.movies as any[];
    const resultEntries: ResultEntry[] = [];
    entries.forEach((entry) => {
      try {
        const name = entry.title;
        const nameOriginal = entry.originalTitle;
        const yearStart = entry.year;
        const yearEnd = type === MediaEnum.MOVIE ? undefined : entry.endYear;
        const plot = entry.simplePlot;
        const ratingImdb = entry.rating < 0 ? null : entry.rating;
        const ratingMetascore = entry.metascore < 0 ? null : entry.metascore;
        const images = entry.urlPoster ? [entry.urlPoster] : [];
        const genreIds = entry.genres
          ? findAllGenreIdsByNames(entry.genres as string[])
          : undefined;
        const idImdb = entry.idIMDB;
        const urlsInfo: Url[] = [new Url({ url: getIMDbUrlById(idImdb) })];

        const typeFromSearch = this.quickAddService.getMediaTypeFromResult(entry.type);

        const media = new Media({
          id: idImdb,
          type: typeFromSearch ?? type,
          name,
          nameOriginal,
          yearStart,
          yearEnd,
          ratingImdb,
          ratingMetascore,
          urlsInfo,
          images,
          genreIds,
        });

        const resultEntry: ResultEntry = {
          media,
          idImdb,
          plot,
        };

        resultEntries.push(resultEntry);
      } catch (error) {
        console.error("Fehler beim interpretieren der Daten", error);
      }
    });

    return resultEntries;
  }

  private interpretResponseDetailsById(data: any, type: MediaEnum): ResponseData {
    try {
      const entry = (data.data.movies as any[])[0];
      const name = entry.title;
      const nameOriginal = entry.originalTitle;
      const runtime = entry.runtime;
      const yearStart = entry.year;
      const yearEnd = type === MediaEnum.MOVIE ? undefined : entry.endYear;
      const ratingImdb = entry.rating < 0 ? null : entry.rating;
      const ratingMetascore = entry.metascore < 0 ? null : entry.metascore;
      const images = entry.urlPoster ? [entry.urlPoster] : [];
      let genreIds = entry.genres ? findAllGenreIdsByNames(entry.genres as string[]) : undefined;
      const tags = entry.keywords ? (entry.keywords as string[]) : undefined;
      const idImdb = entry.idIMDB;
      const urlsInfo: Url[] = [new Url({ url: getIMDbUrlById(idImdb) })];
      const releaseDate = DateFns.getDateFromString(entry.releaseDate, "yyyyMMdd", new Date());
      const languages: string[] = getLanguages(entry.languages as string[]);
      const countries = entry.countries as string[];

      let television = releaseDate ? getTelevisionByDateAndChannel(type, releaseDate) : null;

      if (genreIds && tags) genreIds = appendGenresByTagContents(genreIds, tags);

      // ! similar movies

      // ! writers

      const media = new Media({
        id: "",
        type,
        name,
        nameOriginal,
        yearStart,
        yearEnd,
        runtime,
        genreIds,
        images,
        urlsInfo,
        ratingImdb,
        ratingMetascore,
        tags,
        television,
        languages,
        countries,
      });

      const quickAddData = this.quickAddButtonService.getQuickAddButton(media);

      return { idImdb, title: name, quickAddData };
    } catch (error) {
      console.error("Fehler beim interpretieren der Daten", error);
      return { idImdb: "", quickAddData: [] };
    }
  }
}
