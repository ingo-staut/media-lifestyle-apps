import { Injectable } from "@angular/core";
import { isSeriesOrMovie } from "projects/series-movies/src/utils/string";
import { BehaviorSubject } from "rxjs";
import { Language } from "shared/models/enum/language.enum";
import { REGEX_QUOTES, REGEX_TEXT_IN_QUOTES } from "shared/utils/regexp";
import { NewsSourceType } from "../../../models/enum/news-source.enum";
import { News } from "../../../models/news.class";
import { RequestService } from "../../request.service";
import { CF_FETCH_URL_XML } from "../request.api.service";

@Injectable({
  providedIn: "root",
})
export class DlfRssApiService {
  private responseSubject = new BehaviorSubject<News[]>([]);
  data$ = this.responseSubject.asObservable();

  constructor(private requestService: RequestService) {}

  async request(): Promise<News[] | null> {
    return this.fetch(new URL("https://www.deutschlandfunkkultur.de/film-serie-100.rss"));
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
        const text = this.textFromDescription(item.description[0]);
        const news = new News({
          title: item.title[0],
          text,
          id: item.guid[0]._,
          url: item.link[0],
          date: new Date(item.pubDate[0]),
          source: NewsSourceType.DLF_KULTUR,
          sourceUrl,
          mediaSuggestions: this.extractMediaNames(item.title[0], item.title[0] + " " + text),
          image: this.imageFromDescription(item.description[0]),
          language: Language.GERMAN,
        });

        return news;
      });
    } catch (error) {
      console.error("Fehler beim interpretieren der Daten", error);
      return [];
    }
  }

  private imageFromDescription(description: string) {
    const match = description.match(/src="([^"]*)"/);
    if (!match) return "";

    return match[1];
  }

  private textFromDescription(description: string) {
    const match = description.match(/>([^><]+)</);
    if (!match) return "";

    return match[1];
  }

  private extractMediaNames(title: string, text: string) {
    const match = title.match(REGEX_TEXT_IN_QUOTES);
    if (match) {
      return [{ name: match[0].replaceAll(REGEX_QUOTES, ""), type: isSeriesOrMovie(text) }];
    }

    const matchInText = text.match(REGEX_TEXT_IN_QUOTES);
    if (matchInText) {
      return [{ name: matchInText[0].replaceAll(REGEX_QUOTES, ""), type: isSeriesOrMovie(text) }];
    }

    return [];
  }
}
