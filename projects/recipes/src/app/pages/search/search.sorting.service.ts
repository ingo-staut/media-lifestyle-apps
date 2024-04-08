import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SortingDirection } from "../../../../../../shared/models/enum/sort-direction.enum";
import { SortType } from "../../models/enum/sort.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Recipe } from "../../models/recipe.class";

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

  sortRecipes =
    (sortingType: SortType, sortAsc: boolean, ingredientsConversion: IngredientConversion[]) =>
    (a: Recipe, b: Recipe) => {
      switch (sortingType) {
        case SortType.SORT_SEARCH_RESULTS:
          return b._searchMatchScore - a._searchMatchScore;
        case SortType.SORT_ALPHABET:
          return sortAsc ? b.name?.localeCompare(a.name) : a.name?.localeCompare(b.name);
        case SortType.SORT_RATING:
          return sortAsc ? a.rating - b.rating : b.rating - a.rating;
        case SortType.SORT_DIFFICULTY:
          return sortAsc ? a.difficulty - b.difficulty : b.difficulty - a.difficulty;
        case SortType.SORT_LAST_PREPARED_DATE:
          return sortAsc
            ? a.lastPreparationDateTime - b.lastPreparationDateTime
            : b.lastPreparationDateTime - a.lastPreparationDateTime;
        case SortType.SORT_LAST_EDITED_DATE:
          return sortAsc
            ? a.editHistory[0].getTime() - b.editHistory[0].getTime()
            : b.editHistory[0].getTime() - a.editHistory[0].getTime();
        case SortType.SORT_PREPARED_QUANTITY:
          return sortAsc
            ? a.preparationHistory.length - b.preparationHistory.length
            : b.preparationHistory.length - a.preparationHistory.length;
        case SortType.SORT_CREATED_DATE:
          return sortAsc
            ? a.creationDate.getTime() - b.creationDate.getTime()
            : b.creationDate.getTime() - a.creationDate.getTime();
        case SortType.SORT_PREPARATION_TIME:
          return sortAsc
            ? a.totalPreparationDurationInMinutes - b.totalPreparationDurationInMinutes
            : b.totalPreparationDurationInMinutes - a.totalPreparationDurationInMinutes;
        case SortType.SORT_INGREDIENTS_QUANTITY:
          return sortAsc
            ? a.totalIngredientsAmount - b.totalIngredientsAmount
            : b.totalIngredientsAmount - a.totalIngredientsAmount;
        case SortType.SORT_PLANNED:
          return sortAsc
            ? a.firstPlannedDate.getTime() - b.firstPlannedDate.getTime()
            : b.firstPlannedDate.getTime() - a.firstPlannedDate.getTime();
        case SortType.SORT_COSTS:
          return sortAsc
            ? a.getNormalCost(ingredientsConversion) - b.getNormalCost(ingredientsConversion)
            : b.getNormalCost(ingredientsConversion) - a.getNormalCost(ingredientsConversion);
        case SortType.SORT_PORTIONS_LEFT:
          return sortAsc
            ? (a.lastPreparation?.portionsAvailable ?? 0) -
                (b.lastPreparation?.portionsAvailable ?? 0)
            : (b.lastPreparation?.portionsAvailable ?? 0) -
                (a.lastPreparation?.portionsAvailable ?? 0);
        default:
          return 0;
      }
    };
}
