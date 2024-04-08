import { SortKey, SortType } from "../models/enum/sort.enum";
import { Sort } from "../models/sort.type";

export const SEARCH_SORT_TYPES_DATA: ReadonlyArray<Sort> = [
  {
    type: SortType.SORT_SEARCH_RESULTS,
    key: SortKey.SORT_SEARCH_RESULTS,
    text: "SORT.SEARCH_RESULTS",
    icon: "search",
    extraIcon: "sort-search-result",
  },
  {
    type: SortType.SORT_ALPHABET,
    key: SortKey.SORT_ALPHABET,
    text: "ALPHABET",
    icon: "alphabet",
    sortDirection: true,
  },
  {
    type: SortType.SORT_DIFFICULTY,
    key: SortKey.SORT_DIFFICULTY,
    text: "DIFFICULTY.",
    icon: "difficulty",
    sortDirection: true,
  },
  {
    type: SortType.SORT_RATING,
    key: SortKey.SORT_RATING,
    text: "RATING.",
    icon: "rating",
    sortDirection: true,
  },
  {
    type: SortType.SORT_PLANNED,
    key: SortKey.SORT_PLANNED,
    text: "HISTORY.PLANNED",
    icon: "calendar",
    sortDirection: true,
  },
  {
    type: SortType.SORT_PREPARED_QUANTITY,
    key: SortKey.SORT_PREPARED_QUANTITY,
    text: "PREPARED_QUANTITY",
    icon: "preparationHistory-prepared",
    sortDirection: true,
  },
  {
    type: SortType.SORT_LAST_PREPARED_DATE,
    key: SortKey.SORT_LAST_PREPARED_DATE,
    text: "LAST_PREPARED",
    icon: "calendar-checked",
    sortDirection: true,
  },
  {
    type: SortType.SORT_LAST_EDITED_DATE,
    key: SortKey.SORT_LAST_EDITED_DATE,
    text: "LAST_EDITED",
    icon: "last-edited",
    sortDirection: true,
  },
  {
    type: SortType.SORT_CREATED_DATE,
    key: SortKey.SORT_CREATED_DATE,
    text: "CREATED",
    icon: "added",
    sortDirection: true,
  },
  {
    type: SortType.SORT_PREPARATION_TIME,
    key: SortKey.SORT_PREPARATION_TIME,
    text: "PREPARATION_TIME.",
    icon: "time",
    sortDirection: true,
  },
  {
    type: SortType.SORT_INGREDIENTS_QUANTITY,
    key: SortKey.SORT_INGREDIENT_QUANTITY,
    text: "INGREDIENTS_QUANTITY.",
    icon: "ingredient",
    sortDirection: true,
  },
  {
    type: SortType.SORT_COSTS,
    key: SortKey.SORT_COSTS,
    text: "COST.",
    icon: "money",
    sortDirection: true,
  },
  {
    type: SortType.SORT_PORTIONS_LEFT,
    key: SortKey.SORT_PORTIONS_LEFT,
    text: "PORTION.LEFT.",
    icon: "portion-eat",
    sortDirection: true,
  },
];

export const SORT_INGREDIENTS_SHOPPING_LIST: ReadonlyArray<Sort> = [
  {
    type: SortType.SORT_CUSTOM,
    key: SortKey.SORT_CUSTOM,
    text: "SORT.CUSTOM",
    icon: "search",
    extraIcon: "sort-direction-desc",
  },
  {
    type: SortType.SORT_ALPHABET,
    key: SortKey.SORT_ALPHABET,
    text: "ALPHABET",
    icon: "alphabet",
    sortDirection: true,
  },
  {
    type: SortType.SORT_AVAILABLE,
    key: SortKey.SORT_AVAILABLE,
    text: "AVAILABLE.",
    icon: "available",
    sortDirection: true,
  },
];

export const SORT_INGREDIENTS_SHOPPING_LIST_BUY: ReadonlyArray<Sort> = [
  {
    type: SortType.SORT_CUSTOM,
    key: SortKey.SORT_CUSTOM,
    text: "SORT.CUSTOM",
    icon: "search",
    extraIcon: "sort-direction-desc",
  },
  {
    type: SortType.SORT_ALPHABET,
    key: SortKey.SORT_ALPHABET,
    text: "ALPHABET",
    icon: "alphabet",
    sortDirection: true,
  },
];

export const SORT_INGREDIENTS_SHOPPING_LIST_AVAILABLE: ReadonlyArray<Sort> = [
  {
    type: SortType.SORT_CUSTOM,
    key: SortKey.SORT_CUSTOM,
    text: "SORT.CUSTOM",
    icon: "search",
    extraIcon: "sort-direction-desc",
  },
  {
    type: SortType.SORT_ALPHABET,
    key: SortKey.SORT_ALPHABET,
    text: "ALPHABET",
    icon: "alphabet",
    sortDirection: true,
  },
  {
    type: SortType.SORT_USE_UNTIL,
    key: SortKey.SORT_USE_UNTIL,
    text: "DATE.USE_UNTIL.",
    icon: "calendar-until",
    sortDirection: true,
  },
];
