import { Injectable } from "@angular/core";
import { Media } from "projects/series-movies/src/app/models/media.class";
import { BehaviorSubject } from "rxjs";
import { ReplaceInTitleType } from "shared/models/enum/replace-fitting-type.enum";
import { replaceInTitle } from "shared/utils/string";
import { MediaEnum } from "../../../../../../../shared/models/enum/media.enum";
import { Season } from "../../../models/season.type";
import { QuickAddButtonService } from "../../quick-add-button.service";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL, QuickAddButton } from "../request.api.service";

interface Episode {
  season: number;
  episode: number;
  name: string;
  air_date: string;
}

@Injectable({
  providedIn: "root",
})
export class EpisodateSeasonsApiService {
  private readonly URL_EPISODATE_DETAILS = "https://www.episodate.com/api/show-details?q=";
  private readonly REPLACE_IN_TITLE = "-";

  private responseSubject = new BehaviorSubject<QuickAddButton[]>([]);
  seasons$ = this.responseSubject.asObservable();

  constructor(
    private requestService: RequestService,
    private quickAddButtonService: QuickAddButtonService
  ) {}

  async request(title: string, type: MediaEnum): Promise<QuickAddButton[] | null> {
    const url = this.getUrl(title);

    return this.requestService
      .requestWithTimeout(CF_FETCH_URL + encodeURIComponent(url), {
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

        console.log("Response data", url, data);

        const entries = this.interpretResponse(data, type);
        this.responseSubject.next(entries);

        return entries;
      });
  }

  getUrl(title: string) {
    title = replaceInTitle(title, this.REPLACE_IN_TITLE, ReplaceInTitleType.REPLACE_ALL);

    return this.URL_EPISODATE_DETAILS + title;
  }

  clear() {
    this.responseSubject.next([]);
  }

  private interpretResponse(data: any, type: MediaEnum): QuickAddButton[] {
    try {
      const obj = data.tvShow as any;
      const episodes = obj.episodes as any[];

      const seasons: Season[] = this.getSeasons(episodes);

      const media = new Media({
        id: "",
        type,
        seasons: seasons.filter((season) => season.episodes > 2),
      });

      const quickAddData = this.quickAddButtonService.getQuickAddButton(media);

      return quickAddData;
    } catch (error) {
      console.error("Fehler beim interpretieren der Daten", error);
      return [];
    }
  }

  private getSeasons(data: Episode[]) {
    const seasonsMap = new Map<number, number>();

    data.forEach((episode) => {
      const season = episode.season;
      seasonsMap.set(season, (seasonsMap.get(season) || 0) + 1);
    });

    const seasons: Season[] = [];
    seasonsMap.forEach((episodeCount) => {
      seasons.push({
        special: false,
        episodes: episodeCount,
      });
    });

    return seasons;
  }
}
