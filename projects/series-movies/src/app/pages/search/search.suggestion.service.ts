import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DISCOVERY_SOURCES } from "shared/data/discovery-source.data";
import { Action } from "shared/models/action.type";
import { DropdownData } from "shared/models/dropdown.type";
import { DiscoverySource } from "shared/models/enum/discovery-source.enum";
import { DateFns } from "shared/utils/date-fns";
import { getRandomElementsFromList } from "shared/utils/list";
import { roundToNextNumber } from "shared/utils/number";
import { GENRES } from "../../data/genres.data";
import { GenreType } from "../../models/enum/genre.enum";
import { Genre } from "../../models/genre.class";
import { RoutingService } from "../../services/routing.service";

@Injectable({
  providedIn: "root",
})
export class SearchSuggestionService {
  readonly SUGGESTION_GENRES = [
    GenreType.COMEDY,
    GenreType.ACTION,
    GenreType.SPY,
    GenreType.SCIENCE_FICTION,
    GenreType.LGBTQ,
    GenreType.ANIME,
    GenreType.DOCUMENTARY,
  ];

  readonly SUGGESTIONS: Action[] = [
    ...GENRES.filter((genre) => this.SUGGESTION_GENRES.includes(genre.type)).map((genre) =>
      this.suggestionGenre(genre)
    ),
  ];

  readonly DISCOVERY_SOURCES: Action[] = [
    ...DISCOVERY_SOURCES.map((source) => this.suggestionSource(source)),
  ];

  private randomSuggestionsSubject = new BehaviorSubject<Action[]>([]);
  randomSuggestions$ = this.randomSuggestionsSubject.asObservable();

  private get showWatchUntilSuggestion() {
    const startWatchUntil = DateFns.addMinutesToDate(
      DateFns.setTimeStringToDate(new Date(), "22:30"),
      -DateFns.hoursToMinutes(5)
    );

    const endWatchUntil = DateFns.addMinutesToDate(
      DateFns.setTimeStringToDate(new Date(), "22:30"),
      -30
    );

    return DateFns.isDateTimeBetweenDates(new Date(), startWatchUntil, endWatchUntil);
  }

  constructor(private routingService: RoutingService) {}

  nextRandomSuggestion() {
    const randomSuggestions = getRandomElementsFromList(this.SUGGESTIONS, 2).concat(
      getRandomElementsFromList(this.DISCOVERY_SOURCES, 1)
    );
    this.appendShowWatchUntilSuggestion(randomSuggestions);
    this.randomSuggestionsSubject.next(randomSuggestions);
  }

  private appendShowWatchUntilSuggestion(suggestions: Action[]) {
    if (!this.showWatchUntilSuggestion) return;

    const startDate = new Date();
    const endDate = DateFns.setTimeStringToDate(new Date(), "22:45");
    const durationInMinutes = DateFns.getDurationBetweenDatesInMinutes(endDate, startDate);
    const durationInMinutesRounded = roundToNextNumber(durationInMinutes, 5);

    const suggestionWatchMovieUntilTime: Action = {
      id: "",
      text: "SUGGESTION.GOOD_MOVIES_WATCH_UNTIL_VALUE",
      textReplace: "22:30",
      icon: "time",
      func: () => {
        this.routingService.navigateToUrl(
          `/search?sort=rating-imdb&layout=list&media-type=movie&status=current,explore&runtime=${durationInMinutesRounded}:max:hideNullValues`
        );
      },
    };

    suggestions.push(suggestionWatchMovieUntilTime);
  }

  private suggestionGenre(genre: Genre) {
    const data: Action = {
      id: "",
      text: "SUGGESTION.GOOD_MOVIES_GENRE_VALUE",
      textReplace: genre.name,
      icon: genre.icon,
      func: () => {
        this.routingService.navigateToUrl(
          `/search?sort=rating-imdb&layout=list&media-type=movie&status=current,explore&genres=${genre.type}&rating-imdb=7:min:hideNullValues`
        );
      },
    };

    return data;
  }

  private suggestionSource(source: DropdownData<DiscoverySource, string>) {
    const data: Action = {
      id: "",
      text: "SUGGESTION.MOVIES_DISCOVERY_SOURCE_VALUE",
      textReplace: source.name,
      icon: source.icon,
      func: () => {
        this.routingService.navigateToUrl(
          `/search?asc=true&sort=created-date&layout=grid&sources=${source.key}`
        );
      },
    };

    return data;
  }
}
