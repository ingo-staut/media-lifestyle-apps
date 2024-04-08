import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SortingDirection } from "shared/models/enum/sort-direction.enum";
import { SortType } from "../../models/enum/sort.enum";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class SearchSortingService {
  // Sortierung
  private sortingTypeSubject = new BehaviorSubject<SortType>(SortType.SORT_SEARCH_RESULTS);
  sortingType$ = this.sortingTypeSubject.asObservable();
  get sortingTypeSnapshot() {
    return this.sortingTypeSubject.value;
  }

  // Aufsteigend / Absteigend
  private sortingDirectionSubject = new BehaviorSubject<SortingDirection>(SortingDirection.DESC);
  sortingDirection$ = this.sortingDirectionSubject.asObservable();
  get sortingDirectionSnapshot() {
    return this.sortingDirectionSubject.value;
  }

  setSorting(sortType: SortType): void {
    this.sortingTypeSubject.next(sortType);
  }

  setSortingDirection(direction: SortingDirection): void {
    return this.sortingDirectionSubject.next(direction);
  }

  nextSortingDirection() {
    this.sortingDirectionSubject.next(
      this.sortingDirectionSubject.value === SortingDirection.ASC
        ? SortingDirection.DESC
        : SortingDirection.ASC
    );
  }

  sortMedia = (sortingType: SortType, sortAsc: boolean) => (a: Media, b: Media) => {
    switch (sortingType) {
      case SortType.SORT_SEARCH_RESULTS:
        return b._searchMatchScore - a._searchMatchScore;
      case SortType.SORT_ALPHABET:
        return sortAsc ? b.name?.localeCompare(a.name) : a.name?.localeCompare(b.name);
      case SortType.SORT_RATING:
        return sortAsc ? a.rating - b.rating : b.rating - a.rating;
      case SortType.SORT_RATING_IMDB:
        return sortAsc
          ? (a.ratingImdb ?? 0) - (b.ratingImdb ?? 0)
          : (b.ratingImdb ?? 0) - (a.ratingImdb ?? 0);
      case SortType.SORT_RATING_METASCORE:
        return sortAsc
          ? (a.ratingMetascore ?? 0) - (b.ratingMetascore ?? 0)
          : (b.ratingMetascore ?? 0) - (a.ratingMetascore ?? 0);
      case SortType.SORT_RATING_WATCHABILITY:
        return sortAsc
          ? (a.ratingWatchability ?? 0) - (b.ratingWatchability ?? 0)
          : (b.ratingWatchability ?? 0) - (a.ratingWatchability ?? 0);
      case SortType.SORT_LAST_EDITED_DATE:
        return sortAsc
          ? a.editHistory[0].getTime() - b.editHistory[0].getTime()
          : b.editHistory[0].getTime() - a.editHistory[0].getTime();
      case SortType.SORT_CREATED_DATE:
        return sortAsc
          ? a.creationDate.getTime() - b.creationDate.getTime()
          : b.creationDate.getTime() - a.creationDate.getTime();
      case SortType.SORT_YEAR:
        return sortAsc
          ? (a.yearStart ?? 0) - (b.yearStart ?? 0)
          : (b.yearStart ?? 0) - (a.yearStart ?? 0);
      case SortType.SORT_AVAILABLE_UNTIL:
        return sortAsc
          ? (a.availableUntil?.getTime() ?? 0) - (b.availableUntil?.getTime() ?? 0)
          : (b.availableUntil?.getTime() ?? 0) - (a.availableUntil?.getTime() ?? 0);
      case SortType.SORT_RUNTIME:
        return sortAsc ? a.runtime - b.runtime : b.runtime - a.runtime;
      case SortType.SORT_NOTE:
        return sortAsc ? a.note?.localeCompare(b.note) : b.note?.localeCompare(a.note);
      case SortType.SORT_DISCOVERY_SOURCES:
        return sortAsc
          ? a.firstDiscoverySource?.localeCompare(b.firstDiscoverySource)
          : b.firstDiscoverySource?.localeCompare(a.firstDiscoverySource);
      case SortType.SORT_TAGLINE:
        return sortAsc ? a.tagline?.localeCompare(b.tagline) : b.tagline?.localeCompare(a.tagline);
      default:
        return 0;
    }
  };
}
