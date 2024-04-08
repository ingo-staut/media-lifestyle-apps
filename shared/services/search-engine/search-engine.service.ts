import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { MenuItem, sortByFavorite } from "../../models/menu-item.type";
import { SearchEngine, getMenuItem } from "../../models/search-engine.type";
import { SearchEngineApiService } from "./search-engine.api.service";

@Injectable({
  providedIn: "root",
})
export class SearchEngineService {
  constructor(private searchEngineApiService: SearchEngineApiService) {}

  searchEnginesMenu$ = this.searchEngineApiService.searchEngines$.pipe(
    map((searchEngines) => {
      const list: MenuItem<SearchEngine>[] = searchEngines.map((searchEngine) => {
        return getMenuItem(searchEngine);
      });
      // Liste nach Favoriten sortieren
      list.sort(sortByFavorite);
      return list;
    })
  );
}
