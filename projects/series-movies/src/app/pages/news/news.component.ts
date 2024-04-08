import { Component } from "@angular/core";
import { Observable, take } from "rxjs";
import { NEWS_CATEGORIES_TO_DISPLAY } from "../../data/news-category.data";
import { NewsCategoryType } from "../../models/enum/news-category.enum";
import { News } from "../../models/news.class";
import { NewsSettingsApiService } from "../../services/news-settings.api.service";
import { NewsApiService } from "../../services/request-apis/news.api.service";

@Component({
  selector: "app-news",
  templateUrl: "./news.component.html",
  styleUrls: ["./news.component.scss"],
})
export class NewsComponent {
  NewsCategoryType = NewsCategoryType;
  NEWS_CATEGORIES_TO_DISPLAY = NEWS_CATEGORIES_TO_DISPLAY;

  // ! Reihenfolge wie in News-Kategorie-Daten `NEWS_CATEGORIES`
  dataList = [
    this.newsApiService.newsWithMedia$,
    this.newsApiService.newsThisWeek$,
    this.newsApiService.newsCritic$,
    this.newsApiService.newsReportageMagazine$,
    // this.newsApiService.newsStreaming$,
    this.newsApiService.newsGeneral$,
    this.newsApiService.newsInternational$,
    this.newsApiService.newsTrailer$,
    this.newsApiService.newsCinema$,
    this.newsApiService.newsStartOfSeries$,
    this.newsApiService.newsSeriesOfSeason$,
    this.newsApiService.newsInTelevision$,
    this.newsApiService.newsFuture$,
    this.newsApiService.newsLists$,
  ];

  constructor(
    private newsSettingsApiService: NewsSettingsApiService,
    protected newsApiService: NewsApiService
  ) {
    this.newsApiService.request();
  }

  onMarkAllAsRead(data$: Observable<News[]>) {
    data$.pipe(take(1)).subscribe((newsList) => {
      this.newsSettingsApiService.read(newsList.map((news) => news.id));
    });
  }
}
