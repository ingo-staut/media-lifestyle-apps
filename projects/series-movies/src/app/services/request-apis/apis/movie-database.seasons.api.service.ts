import { Injectable } from "@angular/core";
import { Media } from "projects/series-movies/src/app/models/media.class";
import { BehaviorSubject } from "rxjs";
import { MediaEnum } from "../../../../../../../shared/models/enum/media.enum";
import { Season } from "../../../models/season.type";
import { QuickAddButtonService } from "../../quick-add-button.service";
import { QuickAddButton, ResponseData } from "../request.api.service";
import { RapidApiService } from "./rapid.api.service";

@Injectable({
  providedIn: "root",
})
export class MovieDatabaseSeasonsApiService {
  private responseSubject = new BehaviorSubject<QuickAddButton[]>([]);
  seasons$ = this.responseSubject.asObservable();

  constructor(
    private rapidApiService: RapidApiService,
    private quickAddButtonService: QuickAddButtonService
  ) {}

  async request(idImdb: string, type: MediaEnum): Promise<ResponseData | null> {
    try {
      const data = await this.rapidApiService.request(
        idImdb,
        "https://moviesdatabase.p.rapidapi.com/titles/series/",
        "moviesdatabase.p.rapidapi.com"
      );

      if (!data) return null;

      console.log("Response data", data);

      const quickAddData = this.interpretResponse(data, type);
      this.responseSubject.next(quickAddData);

      return { idImdb, quickAddData };
    } catch (error) {
      console.error("Error occurred during request:", error);
      throw error;
    }
  }

  clear() {
    this.responseSubject.next([]);
  }

  private interpretResponse(data: any, type: MediaEnum): QuickAddButton[] {
    try {
      const array = data.results as any[];

      const special = false;
      const seasons: Season[] = [];
      let lastSeasonCount: number = 1;
      let lastEpisodeCount: number = 0;
      array.forEach((item: any, index) => {
        const correctSeason = item.seasonNumber !== "\\N";

        if (lastSeasonCount !== item.seasonNumber && correctSeason) {
          seasons.push({ special, episodes: lastEpisodeCount });
        }
        if (index === array.length - 1) {
          seasons.push({
            special,
            episodes: correctSeason ? item.episodeNumber : lastEpisodeCount,
          });
        }

        lastSeasonCount = item.seasonNumber;
        lastEpisodeCount = item.episodeNumber;
      });

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
}
