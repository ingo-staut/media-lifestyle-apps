import { Injectable } from "@angular/core";
import { Firestore, collection, doc, getDocs, setDoc } from "@angular/fire/firestore";
import { cloneDeep } from "lodash";
import { BehaviorSubject, map } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { SearchEngine } from "../../models/search-engine.type";

@Injectable({
  providedIn: "root",
})
export class SearchEngineApiService {
  private readonly COLLECTION_SEARCH_ENGINES = "search-engines";
  private readonly COLLECTION_ID_SEARCH_ENGINES = "12749f72-f0c8-11ed-a05b-0242ac120003";

  private searchEnginesSubject = new BehaviorSubject<SearchEngine[]>([]);
  searchEngines$ = this.searchEnginesSubject
    .asObservable()
    .pipe(map((searchEngines) => searchEngines.sort((a, b) => a.name?.localeCompare(b.name))));

  get searchEnginesSnapshot() {
    return this.searchEnginesSubject.value;
  }

  constructor(private firestore: Firestore, private notificationService: NotificationService) {}

  setSearchEngines(searchEngines: SearchEngine[]) {
    this.searchEnginesSubject.next(searchEngines);
  }

  async getSearchEngines() {
    const db = collection(this.firestore, this.COLLECTION_SEARCH_ENGINES);
    const data = await getDocs(db);
    const searchEnginesOneItemList = data.docs.map(
      (item) => (item.data() as { engines: SearchEngine[] }).engines
    );
    this.searchEnginesSubject.next(searchEnginesOneItemList[0]);
  }

  private async addOrUpdateSearchEngines(searchEngines: SearchEngine[]) {
    const data = this.convertSearchEnginesToDTO(cloneDeep(searchEngines));
    await setDoc(
      doc(this.firestore, this.COLLECTION_SEARCH_ENGINES, this.COLLECTION_ID_SEARCH_ENGINES),
      data
    );
  }

  saveAndReloadSearchEngines(searchEngines: SearchEngine[]) {
    this.addOrUpdateSearchEngines(searchEngines)
      .then(() => {
        this.searchEnginesSubject.next(searchEngines);
        this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
          messageReplace: "SEARCHENGINE.S",
          icon: "search-engine",
        });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  private convertSearchEnginesToDTO(searchEngines: SearchEngine[]) {
    return {
      ["engines"]: searchEngines.map((item) => {
        return this.convertSearchEngineToDTO(item);
      }),
    };
  }

  private convertSearchEngineToDTO(searchEngine: SearchEngine) {
    return {
      ...searchEngine,
    };
  }
}
