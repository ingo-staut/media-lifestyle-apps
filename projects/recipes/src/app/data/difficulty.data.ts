import { Group } from "shared/models/type-group.type";
import { QuickAddDropdownFilterFromSearch } from "../../../../../shared/models/search-filter.type";
import { getQuickAddDropdownMultipleSelectFilterFromSearch } from "../../../../../shared/models/type.function";

// !WARNING: Dieser Typ ist ein Duplikat
// !Nicht verwenden
enum DifficultyType {
  NONE = 0,
  DIFFICULTY_0 = -1,
  DIFFICULTY_1 = 1,
  DIFFICULTY_2 = 2,
  DIFFICULTY_3 = 3,
  DIFFICULTY_4 = 4,
  DIFFICULTY_5 = 5,
  DIFFICULTY_6 = 6,
  DIFFICULTY_7 = 7,
  DIFFICULTY_8 = 8,
  DIFFICULTY_9 = 9,
  DIFFICULTY_10 = 10,
}

export const DIFFICULTIES: ReadonlyArray<Group<DifficultyType>> = [
  {
    name: "DIFFICULTY.EASY",
    icon: "difficulty",
    additionalSearchTerms: ["Einfach", "Leicht", "Easy", "Facile", "Fácil"],
    entries: [
      { name: "1", type: DifficultyType.DIFFICULTY_1, icon: "difficulty" },
      { name: "2", type: DifficultyType.DIFFICULTY_2, icon: "difficulty" },
      { name: "3", type: DifficultyType.DIFFICULTY_3, icon: "difficulty" },
    ],
  },
  {
    name: "DIFFICULTY.MIDDLE",
    icon: "difficulty-half",
    additionalSearchTerms: ["Mittelschwer", "Medium", "Moyenne", "Medio"],
    entries: [
      { name: "4", type: DifficultyType.DIFFICULTY_4, icon: "difficulty-half" },
      { name: "5", type: DifficultyType.DIFFICULTY_5, icon: "difficulty-half" },
      { name: "6", type: DifficultyType.DIFFICULTY_6, icon: "difficulty-half" },
      { name: "7", type: DifficultyType.DIFFICULTY_7, icon: "difficulty-half" },
    ],
  },
  {
    name: "DIFFICULTY.DIFFICULT",
    icon: "difficulty-full",
    additionalSearchTerms: ["Schwer", "Hard", "Difficult", "Difficile", "Difícil"],
    entries: [
      { name: "8", type: DifficultyType.DIFFICULTY_8, icon: "difficulty-full" },
      { name: "9", type: DifficultyType.DIFFICULTY_9, icon: "difficulty-full" },
      { name: "10", type: DifficultyType.DIFFICULTY_10, icon: "difficulty-full" },
    ],
  },
];

export const DIFFICULTIES_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH: ReadonlyArray<
  QuickAddDropdownFilterFromSearch<number>
> = getQuickAddDropdownMultipleSelectFilterFromSearch(DIFFICULTIES, "difficulty");
