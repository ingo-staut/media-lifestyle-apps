import { Injectable } from "@angular/core";
import { Media } from "projects/series-movies/src/app/models/media.class";
import { MediaEnum } from "../../../../../../shared/models/enum/media.enum";
import { LoadingService } from "../../components/loading/loading.service";
import { EpisodateSeasonsApiService } from "./apis/episodate-seasons.api.service";
import { KinoCheckApiService } from "./apis/kino-check.api.service";
import { MovieDatabaseSeasonsApiService } from "./apis/movie-database.seasons.api.service";
import { MyApiFilmsIMDbApiService } from "./apis/myapifilms.imdb.api.service";
import { MyApiFilmsTMDbApiService } from "./apis/myapifilms.tmdb.api.service";
import { OmdbApiService } from "./apis/omdb.api.service";
import { YoutubeApiService } from "./apis/youtube.api.service";

export enum Strategy {
  APPEND = "APPEND",
  REPLACE = "REPLACE",
}

export type QuickAddButton = {
  key: keyof Media;
  value: any;
  text?: string;
  tooltip?: string;
  icons?: string[];
  images?: string[];
  strategy: Strategy;
  appendAtFront?: boolean;
};

export type ResponseData = {
  idImdb?: string;
  title?: string;
  quickAddData: QuickAddButton[];
};

export const CF_URL = "";
export const CF_FETCH_URL = CF_URL + "fetchUrl?url=";
export const CF_FETCH_URL_XML = CF_URL + "fetchUrlXML?url=";
export const CF_RAPID_API = CF_URL + "fetchUrlRapidAPI";

@Injectable({
  providedIn: "root",
})
export class RequestApiService {
  constructor(
    private omdbApiService: OmdbApiService,
    private movieDatabaseSeasonsApiService: MovieDatabaseSeasonsApiService,
    private myApiFilmsIMDbApiService: MyApiFilmsIMDbApiService,
    private myApiFilmsTMDbApiService: MyApiFilmsTMDbApiService,
    private kinoCheckApiService: KinoCheckApiService,
    private youtubeApiService: YoutubeApiService,
    private episodateApiService: EpisodateSeasonsApiService,
    private loadingService: LoadingService
  ) {}

  requestAll(title: string, type: MediaEnum) {
    this.omdbApiService.request(title, type).then((data) => {
      if (!data) {
        // Suche mit Titel
        this.myApiFilmsIMDbApiService.requestSearchResultsWithNotificationAndDialog(title, type);
      } else {
        // Suche mit gefundener IMDb-ID
        if (data.idImdb) this.myApiFilmsIMDbApiService.requestAllDetailsById(data.idImdb, type);
      }
    });
  }

  clearAll() {
    this.omdbApiService.clear();
    this.movieDatabaseSeasonsApiService.clear();
    this.myApiFilmsIMDbApiService.clearAll();
    this.myApiFilmsTMDbApiService.clearAll();
    this.kinoCheckApiService.clearAll();
    this.youtubeApiService.clearAll();
    this.episodateApiService.clear();

    this.loadingService.reset();
  }
}
