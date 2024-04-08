import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Rating } from "shared/models/rating.type";
import { Group } from "shared/models/type-group.type";
import { QuickAddDropdownFilterFromSearch } from "../models/search-filter.type";
import { getQuickAddDropdownMultipleSelectFilterFromSearch } from "../models/type.function";

// !WARNING: Dieser Typ ist ein Duplikat
// !Nicht verwenden
enum RatingType {
  NONE = 0,
  RATING_0 = -1,
  RATING_1 = 1,
  RATING_2 = 2,
  RATING_3 = 3,
  RATING_4 = 4,
  RATING_5 = 5,
  RATING_6 = 6,
  RATING_7 = 7,
  RATING_8 = 8,
  RATING_9 = 9,
  RATING_10 = 10,
}

// !WARNING: Dieser Typ ist ein Duplikat
// !Nicht verwenden
enum RatingIndex {
  OWN,
  WATCHABILITY,
  IMDB,
  METASCORE,
}

export const RATINGS: ReadonlyArray<Group<RatingType>> = [
  {
    name: "RATING.GOOD_NOT",
    icon: "rating",
    additionalSearchTerms: ["Schlecht", "Bad", "Mauvais", "Malo"],
    entries: [
      { name: "1", type: RatingType.RATING_1, icon: "rating" },
      { name: "2", type: RatingType.RATING_2, icon: "rating" },
      { name: "3", type: RatingType.RATING_3, icon: "rating" },
    ],
  },
  {
    name: "RATING.GOOD_MIDDLE",
    icon: "rating-half",
    additionalSearchTerms: ["Mittelgut", "Middle", "Average", "Moyen", "Medio"],
    entries: [
      { name: "4", type: RatingType.RATING_4, icon: "rating-half" },
      { name: "5", type: RatingType.RATING_5, icon: "rating-half" },
      { name: "6", type: RatingType.RATING_6, icon: "rating-half" },
      { name: "7", type: RatingType.RATING_7, icon: "rating-half" },
    ],
  },
  {
    name: "RATING.GOOD",
    icon: "rating-full",
    additionalSearchTerms: ["Gut", "Good", "Bon", "Bueno"],
    entries: [
      { name: "8", type: RatingType.RATING_8, icon: "rating-full" },
      { name: "9", type: RatingType.RATING_9, icon: "rating-full" },
      { name: "10", type: RatingType.RATING_10, icon: "rating-full" },
    ],
  },
];

export const RATINGS_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH: ReadonlyArray<
  QuickAddDropdownFilterFromSearch<number>
> = getQuickAddDropdownMultipleSelectFilterFromSearch(RATINGS, FilterKey.RATING);

export const RATING_DATA = new Map<RatingIndex, Rating>([
  [
    RatingIndex.OWN,
    {
      threshold_good: 7,
      threshold_bad: 4,
      icon_good: "rating-full",
      icon_medium: "rating-half",
      icon_bad: "rating",
      icon_default: "rating",

      text: "RATING.",
      icon: "rating",
      iconDialog: "rating",
      max: 10,
      sliderSteps: 1,
      suffix: "/10",
      searchEngineIncludes: "",
    },
  ],
  [
    RatingIndex.WATCHABILITY,
    {
      threshold_good: 6,
      threshold_bad: 4,
      icon_good: "watch-filled",
      icon_medium: "watch-half",
      icon_bad: "watch",
      icon_default: "watch",

      text: "RATING.WATCHABILITY.",
      icon: "watch",
      iconDialog: "watch",
      max: 10,
      sliderSteps: 1,
      suffix: "/10",
      searchEngineIncludes: "",
    },
  ],
  [
    RatingIndex.IMDB,
    {
      threshold_good: 6.5,
      threshold_bad: 4,
      icon_good: "rating-full",
      icon_medium: "rating-half",
      icon_bad: "rating",
      icon_default: "rating",

      text: "RATING.IMDB.",
      icon: "imdb",
      iconDialog: "imdb-color",
      max: 10,
      sliderSteps: 0.1,
      suffix: "/10",
      searchEngineIncludes: "imdb",
    },
  ],
  [
    RatingIndex.METASCORE,
    {
      threshold_good: 60,
      threshold_bad: 40,
      icon_good: "good",
      icon_medium: "middle",
      icon_bad: "bad",
      icon_default: "rating",

      text: "RATING.METASCORE.",
      icon: "metascore",
      iconDialog: "metascore-color",
      max: 100,
      sliderSteps: 1,
      suffix: "/100",
      searchEngineIncludes: "metacritic",
    },
  ],
]);
