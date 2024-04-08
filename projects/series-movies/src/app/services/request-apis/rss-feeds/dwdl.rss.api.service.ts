import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { isSeriesOrMovie } from "projects/series-movies/src/utils/string";
import { BehaviorSubject } from "rxjs";
import { Language } from "shared/models/enum/language.enum";
import { REGEX_QUOTES, REGEX_TEXT_IN_QUOTES } from "shared/utils/regexp";
import { firstCharToTitleCase } from "shared/utils/string";
import { findNewsCategoryByText, newsCategoryById } from "../../../data/news-category.data";
import { NewsCategoryType } from "../../../models/enum/news-category.enum";
import { NewsSourceType } from "../../../models/enum/news-source.enum";
import { News } from "../../../models/news.class";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL_XML } from "../request.api.service";

@Injectable({
  providedIn: "root",
})
export class DwdlRssApiService {
  private responseSubject = new BehaviorSubject<News[]>([]);
  data$ = this.responseSubject.asObservable();

  constructor(private translateService: TranslateService, private requestService: RequestService) {}

  async request(): Promise<News[] | null> {
    return this.fetch(new URL("https://www.dwdl.de/rss/allethemen.xml"));
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
        const categoryFound = firstCharToTitleCase(this.categoryFromUrl(item.link[0]));
        const category = findNewsCategoryByText(categoryFound);
        const news = new News({
          title: item.title[0],
          text: item.description[0],
          id: item.guid[0],
          url: item.link[0],
          author: this.authorFromUrl(item.author[0]),
          date: new Date(item.pubDate[0]),
          category,
          categorySub: this.getCategorySub(category, categoryFound),
          source: NewsSourceType.DWDL,
          sourceUrl,
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

  private categoryFromUrl(url: string) {
    const match = url.match(/www\.dwdl\.de\/([^/]+)\//);
    if (!match) return "";

    return match[1];
  }

  private authorFromUrl(url: string) {
    const match = url.match(/\((.*)\)/);
    if (!match) return "";

    return match[1];
  }

  private getCategorySub(category: NewsCategoryType, categoryText: string) {
    if (
      category !== NewsCategoryType.HIDE &&
      this.translateService.instant(newsCategoryById(category).name).toLowerCase() !==
        categoryText.toLowerCase()
    ) {
      return categoryText;
    }

    return;
  }

  private extractMediaNames(title: string, text: string) {
    const match = title.match(REGEX_TEXT_IN_QUOTES);
    if (
      match &&
      !(
        (title.startsWith('"') || title.startsWith("„")) &&
        (title.endsWith('"') || title.endsWith("“"))
      )
    ) {
      return [{ name: match[0].replaceAll(REGEX_QUOTES, ""), type: isSeriesOrMovie(text) }];
    }

    return [];
  }
}
