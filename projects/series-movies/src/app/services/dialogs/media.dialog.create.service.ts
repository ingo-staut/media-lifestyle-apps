import { Injectable } from "@angular/core";
import { DialogAction } from "shared/models/dialog-action.type";
import { SearchEngineApiService } from "shared/services/search-engine/search-engine.api.service";
import { firstCharToTitleCase } from "shared/utils/string";
import { URL_FAVICON, getTitleOfUrl, getUrlsFromClipboard } from "shared/utils/url";
import { MediaEnum } from "../../../../../../shared/models/enum/media.enum";
import { FunctionsDialogService } from "../../dialogs/functions-dialog/functions-dialog.service";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { Episode } from "../../models/episode.class";
import { Media } from "../../models/media.class";
import { MediaImportService } from "../media.import.service";
import { QuickAddService } from "../quick-add.service";

@Injectable({
  providedIn: "root",
})
export class MediaDialogCreateService {
  constructor(
    private mediaImportService: MediaImportService,
    private quickAddService: QuickAddService,
    private functionsDialogService: FunctionsDialogService,
    private mediaDialogService: MediaDialogService,
    private searchEngineApiService: SearchEngineApiService
  ) {}

  async open(searchText: string) {
    searchText = searchText?.trim();

    const urls = await this.getUrlsListFromClipboard();

    const url = [...(urls.urlsInfo ?? []), ...(urls.urlsVideo ?? []), ...(urls.urlsWatch ?? [])][0];

    const text = await navigator.clipboard.readText();

    const movie = this.mediaImportService.readInMovie(text);
    const series = this.mediaImportService.readInSeries(text);

    const mediaQuickAdd = this.quickAddService.interpretText(text);
    let media: Media | null = null;
    let mediaFromSearch: Media | null = null;

    // Erstellen: Normal
    const actions: DialogAction[] = [
      {
        key: "create-series",
        text: "SERIES.",
        icon: "series",
        autoFocus: true,
      },
      {
        key: "create-movie",
        text: "MOVIE.",
        icon: "movie",
      },
    ];

    // Erstellen mit URL
    if (url) {
      const subImage = URL_FAVICON + url.url;
      const subText = getTitleOfUrl(url.url);

      actions.push(
        ...[
          {
            key: "create-series-by-url",
            text: "SERIES.FROM_URL",
            subText,
            subImage,
            icon: "series",
            autoFocus: true,
          },
          {
            key: "create-movie-by-url",
            text: "MOVIE.FROM_URL",
            subText,
            subImage,
            icon: "movie",
          },
        ]
      );
    }

    // Importieren: Serie
    if (series) {
      actions.push({
        key: "import-series-or-movie",
        text: "SETTINGS.IMPORT_ACTION_AND_SAVE",
        subText: series.name,
        icon: "series",
      });

      media = series;
    }

    // Importieren: Film
    if (movie) {
      actions.push({
        key: "import-series-or-movie",
        text: "SETTINGS.IMPORT_ACTION_AND_SAVE",
        subText: movie.name,
        icon: "movie",
      });

      media = movie;
    }

    // Erstellen mit Suchtext
    if (searchText) {
      searchText = firstCharToTitleCase(searchText);

      actions.push(
        ...[
          {
            key: "series-from-search",
            text: "SERIES.FROM_SEARCH",
            subText: searchText,
            icon: "series",
          },
          {
            key: "movie-from-search",
            text: "MOVIE.FROM_SEARCH",
            subText: searchText,
            icon: "movie",
          },
        ]
      );

      mediaFromSearch = new Media({ name: searchText, id: "", type: MediaEnum.MOVIE });
    }

    // Erstellen aus Text
    if (!series && !movie && mediaQuickAdd) {
      actions.push({
        key: "create-series-or-movie-from-text",
        text: (mediaQuickAdd.isMovie ? "MOVIE" : "SERIES") + ".FROM_TEXT",
        subText: mediaQuickAdd.name,
        icon: mediaQuickAdd.isMovie ? "movie" : "series",
      });
    }

    // Erstellungsdialog öffnen
    this.functionsDialogService
      .open({
        title: "CREATE",
        actions,
      })
      .subscribe(async (result) => {
        if (result) {
          await this.openCreateDialogByKey(
            result,
            searchText,
            media,
            mediaFromSearch,
            mediaQuickAdd
          );
        }
      });
  }

  async openCreateDialogByKey(
    key: string,
    searchText: string,
    media?: Media | null,
    mediaFromSearch?: Media | null,
    mediaQuickAdd?: Media | null
  ) {
    switch (key) {
      case "more":
        this.open(searchText);
        break;

      case "create-series":
        this.createSeries();
        break;

      case "create-movie":
        this.createMovie();
        break;

      case "create-series-by-url":
        await this.createSeriesByUrl();
        break;

      case "create-movie-by-url":
        await this.createMovieByUrl();
        break;

      case "import-series-or-movie":
        this.importSeriesOrMovie(media);
        break;

      case "create-series-or-movie-from-text":
        this.quickAddFromText(mediaQuickAdd);
        break;

      case "series-from-search":
        if (mediaFromSearch) {
          this.createSeriesBySearchText(mediaFromSearch);
        }
        break;

      case "movie-from-search":
        if (mediaFromSearch) {
          this.createMovieBySearchText(mediaFromSearch);
        }
        break;

      default:
        break;
    }
  }

  private createSeries() {
    this.mediaDialogService.openAndReloadData(new Media({ id: "", type: MediaEnum.SERIES }), {
      openEditTitle: true,
    });
  }

  private createMovie() {
    this.mediaDialogService.openAndReloadData(new Media({ id: "", type: MediaEnum.MOVIE }), {
      openEditTitle: true,
    });
  }

  private async createSeriesByUrl() {
    const urls = await this.getUrlsListFromClipboard();

    const series = new Media({
      id: "",
      type: MediaEnum.SERIES,
      seasons: [{ episodes: 0, special: false }],
      currentEpisode: new Episode({ season: 1, episode: 0 }),
      urlsVideo: urls.urlsVideo,
      urlsInfo: urls.urlsInfo,
      urlsWatch: urls.urlsWatch,
    });

    this.mediaDialogService.openAndReloadData(series, { add: true });
  }

  private async createMovieByUrl() {
    const urls = await this.getUrlsListFromClipboard();

    const movie = new Media({
      id: "",
      type: MediaEnum.MOVIE,
      urlsVideo: urls.urlsVideo,
      urlsInfo: urls.urlsInfo,
      urlsWatch: urls.urlsWatch,
    });

    this.mediaDialogService.openAndReloadData(movie, { add: true });
  }

  private importSeriesOrMovie(media?: Media | null) {
    if (media)
      this.mediaDialogService.openAndReloadData(media, { add: true, triggerQuickAdd: true });
  }

  private getUrlsListFromClipboard() {
    return getUrlsFromClipboard(this.searchEngineApiService.searchEnginesSnapshot);
  }

  private quickAddFromText(media?: Media | null) {
    if (media)
      this.mediaDialogService.openAndReloadData(media, {
        add: media.id === "",
        triggerQuickAdd: true,
      });
  }

  private createSeriesBySearchText(media: Media) {
    this.createSeriesOrMovieBySearchText(MediaEnum.SERIES, media);
  }

  private createMovieBySearchText(media: Media) {
    this.createSeriesOrMovieBySearchText(MediaEnum.MOVIE, media);
  }

  private createSeriesOrMovieBySearchText(type: MediaEnum, media: Media) {
    media.type = type;
    this.mediaDialogService.openAndReloadData(media, {
      add: media.id === "",
      triggerQuickAdd: true,
    });
  }
}
