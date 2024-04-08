import { Component, Input } from "@angular/core";
import { ShowInSearchKey } from "projects/series-movies/src/app/models/show-in-search.enum";
import { DiscoverySource } from "shared/models/enum/discovery-source.enum";
import { SearchFilterService } from "../../pages/search/search.filter.service";
import { MediaApiService } from "../../services/media.api.service";
import { RoutingService } from "../../services/routing.service";

@Component({
  selector: "app-button-show-in-search [key]",
  templateUrl: "./button-show-in-search.component.html",
  styleUrls: ["./button-show-in-search.component.scss"],
})
export class ButtonShowInSearchComponent {
  @Input() key: ShowInSearchKey;
  @Input() valueReplace?: string;
  @Input() marginRightPx: number;
  @Input() marginLeftPx: number;
  @Input() value?: string;

  readonly searchUrl = "/search?";

  constructor(
    private routingService: RoutingService,
    private searchFilterService: SearchFilterService,
    private mediaApiService: MediaApiService
  ) {}

  click() {
    this.searchFilterService.removeAllFilters();
    this.searchFilterService.resetResultCount();

    switch (this.key) {
      case "LAST_EDITED":
        this.routingService.navigateToUrl(this.searchUrl + "edited-dates=today");
        break;
      case "LAST_EDITED_VALUE":
        const params = `edited-dates=${
          this.valueReplace === "0"
            ? "today"
            : this.valueReplace === "1"
            ? "yesterday"
            : this.valueReplace
            ? "previous-days:" + this.valueReplace
            : "today"
        }`;
        this.routingService.navigateToUrl(this.searchUrl + params);
        break;
      case "AVAILABLE_UNTIL":
        this.routingService.navigateToUrl(this.searchUrl + "available-until=next-days:14");
        break;
      case "GERMAN_NOT_WATCHED_MOVIES":
        this.routingService.navigateToUrl(
          this.searchUrl + "media-type=movie&languages=de&status=current,explore"
        );
        break;
      case "GERMAN_NOT_WATCHED_SERIES":
        this.routingService.navigateToUrl(
          this.searchUrl + "media-type=series&languages=de&status=current,explore"
        );
        break;
      case "LGBTQ_EXPLORE":
        this.routingService.navigateToUrl(
          this.searchUrl + "sort=year&status=current,explore&genres=lgbtq"
        );
        break;
      case "FAVORITE":
        this.routingService.navigateToUrl(this.searchUrl + "favorite=true");
        break;
      case "EPISODES_IN_TELEVISION_TODAY":
        this.routingService.navigateToUrl(
          this.searchUrl + "episodes-currently-in-television=today"
        );
        break;
      case "EPISODES_IN_TELEVISION_TOMORROW":
        this.routingService.navigateToUrl(
          this.searchUrl + "episodes-currently-in-television=tomorrow"
        );
        break;
      case "EPISODES_IN_TELEVISION_NEXT_X_DAYS":
        this.routingService.navigateToUrl(
          this.searchUrl + "episodes-currently-in-television=next-days:7"
        );
        break;
      case "EPISODES_IN_TELEVISION_MISSED":
        this.routingService.navigateToUrl(
          this.searchUrl + "media-type=series&episodes-currently-in-television=missed"
        );
        break;
      case "TOP_SERIES_SORT_IMDB":
        this.routingService.navigateToUrl(
          this.searchUrl +
            `sort=rating-imdb&layout=list&status=current,explore&media-type=series&years=year-range:${
              new Date().getFullYear() - 1
            }-${new Date().getFullYear()}`
        );
        break;
      case "TOP_MOVIES_SORT_IMDB":
        this.routingService.navigateToUrl(
          this.searchUrl +
            `sort=rating-imdb&layout=list&status=current,explore&media-type=movie&years=year-range:${
              new Date().getFullYear() - 1
            }-${new Date().getFullYear()}`
        );
        break;
      case "OLD_SERIES_SORT_IMDB":
        this.routingService.navigateToUrl(
          this.searchUrl +
            `sort=rating-imdb&layout=list&status=explore&media-type=series&years=year-range:-${
              new Date().getFullYear() - 2
            }`
        );
        break;
      case "OLD_MOVIES_SORT_IMDB":
        this.routingService.navigateToUrl(
          this.searchUrl +
            `sort=rating-imdb&layout=list&status=explore&media-type=movie&years=year-range:-${
              new Date().getFullYear() - 2
            }`
        );
        break;
      case "SORT_METASCORE":
        this.routingService.navigateToUrl(
          this.searchUrl +
            "sort=rating-metascore&layout=list&status=current,explore&rating-metascore=1:min:hideNullValues"
        );
        break;
      case "SORT_RATING_WATCHABILITY":
        this.routingService.navigateToUrl(
          this.searchUrl +
            "sort=rating-watchability&status=explore&rating-watchability=6:min:hideNullValues"
        );
        break;
      case "KINO_PLUS":
        this.routingService.navigateToUrl(
          this.searchUrl + "sources=kino-plus%2B&sort=rating-metascore&status=current,explore"
        );
        break;
      case "CSB":
        this.routingService.navigateToUrl(
          this.searchUrl + "sources=csb&sort=rating-metascore&status=current,explore"
        );
        break;
      case "OTHER_DISCOVERY_SOURCES":
        const otherSources = this.mediaApiService.searchFilterSourcesSnapshot[0].entries
          .filter(
            (s) =>
              s.type !== DiscoverySource.REDDIT &&
              s.type !== DiscoverySource.CSB &&
              s.type !== DiscoverySource.KINO_PLUS
          )
          .map((s) => s.type);

        this.routingService.navigateToUrl(
          this.searchUrl +
            `sources=${otherSources.join(",")}&sort=rating-metascore&status=current,explore`
        );
        break;
      case "SOURCE_VALUE":
        if (!this.value) return;

        this.routingService.navigateToUrl(
          this.searchUrl + `sources=${this.value}&sort=rating-metascore&status=current,explore`
        );
        break;
      case "MOVIE_MISSED":
      case "MOVIE_NEW_IN_STREAM":
        this.routingService.navigateToUrl(
          this.searchUrl + "media-type=movie&channel-types=stream&status=current"
        );
        break;
      case "MOVIE_CURRENTLY_IN_THEATERS":
        this.routingService.navigateToUrl(
          this.searchUrl + "media-type=movie&channel-types=cinema&status=current"
        );
        break;
      case "MOVIE_COMING_SOON_TO_THEATERS":
        this.routingService.navigateToUrl(
          this.searchUrl + "media-type=movie&channel-types=cinema&status=future"
        );
        break;
      case "MOVIE_COMING_SOON_TO_TELEVISION":
        this.routingService.navigateToUrl(
          this.searchUrl + "media-type=movie&channel-types=television-channel&status=future"
        );
        break;
      case "INTERNATIONAL":
        this.routingService.navigateToUrl(
          this.searchUrl + "international=true&status=current,explore"
        );
        break;

      default:
        break;
    }
  }
}
