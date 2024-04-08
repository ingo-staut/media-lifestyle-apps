import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { rx_wordBeginning, rx_wordEndnding } from "shared/utils/regexp";
import { escapeRegExp, forSearch } from "shared/utils/string";
import { Channel } from "../../models/channel.class";
import { NewsCategoryType } from "../../models/enum/news-category.enum";
import { Media } from "../../models/media.class";
import { News } from "../../models/news.class";
import { ChannelApiService } from "../channel.api.service";
import { MediaApiService } from "../media.api.service";
import { NewsSettingsApiService } from "../news-settings.api.service";
import { ColliderRssApiService } from "./rss-feeds/collider.rss.api.service";
import { DlfRssApiService } from "./rss-feeds/dlf.rss.api.service";
import { DwdlRssApiService } from "./rss-feeds/dwdl.rss.api.service";
import { FilmstartsRssApiService } from "./rss-feeds/filmstarts.rss.api.service";
import { KinoDeRssApiService } from "./rss-feeds/kino-de.rss.api.service";
import { MoviepilotRssApiService } from "./rss-feeds/moviepilot.rss.api.service";
import { SerienjunkiesRssApiService } from "./rss-feeds/serienjunkies.rss.api.service";

@Injectable({
  providedIn: "root",
})
export class NewsApiService {
  private responseSubject = new BehaviorSubject<News[]>([]);
  news$ = combineLatest([
    this.mediaApiService.media$,
    this.channelApiService.channels$,
    this.newsSettingsApiService.termsHideNews$,
    this.newsSettingsApiService.readNews$,
    this.dlfRssApiService.data$,
    this.dwdlRssApiService.data$,
    this.moviepilotRssApiService.data$,
    this.filmstartsRssApiService.data$,
    this.kinoDeRssApiService.data$,
    this.serienjunkiesRssApiService.data$,
    this.colliderRssApiService.data$,
  ]).pipe(
    map(([mediaList, channelList, termsHideNews, readNews, ...arrays]) => {
      const mediaListFiltered = mediaList.filter((media) => !media.hideFromNews);

      return (
        arrays
          .flat()
          .filter(
            (news) =>
              news.category !== NewsCategoryType.HIDE &&
              !termsHideNews.some((t) => news.title.toLowerCase().includes(t.toLowerCase())) &&
              !readNews.includes(news.id)
          )
          .map((news) => {
            news.mediaIds = [];
            const newsTmp = this.findMediaInNewsTitleOrText(news, mediaListFiltered);

            news.channelIds = [];
            return this.findChannelsInNewsTitleOrText(newsTmp, channelList);
          })
          // News mit vielen erkannten Serien / Filmen am Anfang
          .sort((a, b) => b.mediaIds.length - a.mediaIds.length)
      );
    })
  );

  newsWithMedia$ = this.news$.pipe(map((news) => news.filter((n) => n.mediaIds.length)));

  newsGeneral$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.NEWS && !n.mediaIds.length))
  );

  newsThisWeek$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.NEW_THIS_WEEK))
  );

  newsCritic$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.CRITIC_REVIEW))
  );

  newsInternational$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.INTERNATIONAL))
  );

  newsInTelevision$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.TELEVISION))
  );

  newsReportageMagazine$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.REPORTAGE_MAGAZINE))
  );

  newsStreaming$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.STREAMING))
  );

  newsTrailer$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.VIDEOS_TRAILER))
  );

  newsCinema$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.CINEMA))
  );

  newsFuture$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.FUTURE))
  );

  newsStartOfSeries$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.START_OF_SERIES))
  );

  newsSeriesOfSeason$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.START_OF_SEASON))
  );

  newsLists$ = this.news$.pipe(
    map((news) => news.filter((n) => n.category === NewsCategoryType.LISTS))
  );

  private findMediaInNewsTitleOrText(news: News, mediaList: Media[]) {
    const foundMediaList = mediaList.filter(
      (media) =>
        forSearch(news.title).includes(forSearch(media.name)) ||
        forSearch(news.text).includes(forSearch(media.name))
    );

    news.mediaIds = [...new Set([...news.mediaIds, ...foundMediaList.map((media) => media.id)])];

    return news;
  }

  private findChannelsInNewsTitleOrText(news: News, channelList: Channel[]) {
    const foundChannels = channelList.filter((channel) => {
      const terms = [channel.name, ...channel.alternativeNames];
      const termsEscaped = terms.map((term) => escapeRegExp(term)).join("|");
      const regex = RegExp(`${rx_wordBeginning}(${termsEscaped})${rx_wordEndnding}`, "i");
      return !!news.title.match(regex) || !!news.text.match(regex);
    });

    // Falls keine Nachrichten-Kategorie,
    // aber alle Sender "Streams" oder "Mediathek" sind,
    // dann zu Kategorie "Neu in Stream" zuordnen
    const foundChannelStreamOrMediaLibrary =
      news.category === NewsCategoryType.NEWS &&
      foundChannels.length &&
      foundChannels.every((channel) => channel.typeIsNotTelevision);

    if (foundChannelStreamOrMediaLibrary) {
      news.category = NewsCategoryType.STREAMING;
    }

    news.channelIds = [
      ...new Set([...news.channelIds, ...foundChannels.map((channel) => channel.id)]),
    ];

    return news;
  }

  constructor(
    private dwdlRssApiService: DwdlRssApiService,
    private dlfRssApiService: DlfRssApiService,
    private moviepilotRssApiService: MoviepilotRssApiService,
    private filmstartsRssApiService: FilmstartsRssApiService,
    private newsSettingsApiService: NewsSettingsApiService,
    private kinoDeRssApiService: KinoDeRssApiService,
    private serienjunkiesRssApiService: SerienjunkiesRssApiService,
    private mediaApiService: MediaApiService,
    private channelApiService: ChannelApiService,
    private colliderRssApiService: ColliderRssApiService
  ) {}

  request() {
    this.dwdlRssApiService.request();
    this.dlfRssApiService.request();
    this.serienjunkiesRssApiService.request();
    this.colliderRssApiService.request();
  }

  clear() {
    this.responseSubject.next([]);
  }
}
