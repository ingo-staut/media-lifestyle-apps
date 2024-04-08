import { Injectable } from "@angular/core";
import { isSeriesOrMovie } from "projects/series-movies/src/utils/string";
import { BehaviorSubject } from "rxjs";
import { Language } from "shared/models/enum/language.enum";
import { REGEX_QUOTES, REGEX_TEXT_IN_QUOTES } from "shared/utils/regexp";
import { findNewsCategoryByLongText } from "../../../data/news-category.data";
import { NewsSourceType } from "../../../models/enum/news-source.enum";
import { News } from "../../../models/news.class";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL_XML } from "../request.api.service";

@Injectable({
  providedIn: "root",
})
export class SerienjunkiesRssApiService {
  private responseSubject = new BehaviorSubject<News[]>([]);
  data$ = this.responseSubject.asObservable();

  constructor(private requestService: RequestService) {}

  async request(): Promise<News[] | null> {
    return this.fetch(new URL("https://www.serienjunkies.de/news/rssfeed.xml"));
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
        const category = findNewsCategoryByLongText(item.title[0]);
        const news = new News({
          title: item.title[0],
          text: item.description[0],
          id: item.guid[0],
          url: item.link[0],
          author: item["dc:creator"] ? item["dc:creator"][0] : undefined,
          date: new Date(item.pubDate[0]),
          source: NewsSourceType.SERIENJUNKIES,
          sourceUrl,
          category,
          mediaSuggestions: this.extractMediaNames(
            item.title[0],
            item.title[0] + " " + item.description[0]
          ),
          language: Language.GERMAN,
        });

        return news;
      });
    } catch (error) {
      console.error("Fehler beim interpretieren der Daten", error);
      return [];
    }
  }

  private extractMediaNames(title: string, text: string) {
    const index = title.indexOf(":");
    if (index !== -1) {
      return [{ name: title.slice(0, index), type: isSeriesOrMovie(text) }];
    }

    const matchInText = text.match(REGEX_TEXT_IN_QUOTES);
    if (matchInText) {
      return [{ name: matchInText[0].replaceAll(REGEX_QUOTES, ""), type: isSeriesOrMovie(text) }];
    }

    return [];
  }
}
