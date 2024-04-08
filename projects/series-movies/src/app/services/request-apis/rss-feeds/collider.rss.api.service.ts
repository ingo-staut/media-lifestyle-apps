import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Language } from "shared/models/enum/language.enum";
import { NewsCategoryType } from "../../../models/enum/news-category.enum";
import { NewsSourceType } from "../../../models/enum/news-source.enum";
import { News } from "../../../models/news.class";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL_XML } from "../request.api.service";

@Injectable({
  providedIn: "root",
})
export class ColliderRssApiService {
  private responseSubject = new BehaviorSubject<News[]>([]);
  data$ = this.responseSubject.asObservable();

  constructor(private requestService: RequestService) {}

  async request(): Promise<News[] | null> {
    return this.fetch(new URL("https://collider.com/feed/category/streaming-guides/"));
  }

  clear() {
    this.responseSubject.next([]);
  }

  private async fetch(url: URL): Promise<News[] | null> {
    console.log("Request url", url.href);

    return this.requestService
      .requestWithTimeout(CF_FETCH_URL_XML + encodeURIComponent(url.href), {
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

        const news = this.interpretResponse(data, url.href);
        this.responseSubject.next(news);

        return news;
      });
  }

  private interpretResponse(data: any, sourceUrl: string): News[] {
    try {
      const items = data.rss.channel[0].item as any[];
      return items.map((item) => {
        const news = new News({
          title: item.title[0],
          text: "",
          id: item.guid[0],
          url: item.link[0],
          date: new Date(item.pubDate[0]),
          source: NewsSourceType.COLLIDER,
          sourceUrl,
          category: NewsCategoryType.LISTS,
          image: item.enclosure[0].$.url,
          language: Language.GERMAN,
          hideActions: true,
        });

        return news;
      });
    } catch (error) {
      console.error("Fehler beim interpretieren der Daten", error);
      return [];
    }
  }
}
