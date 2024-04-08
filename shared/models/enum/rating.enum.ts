import { Entry } from "shared/models/type-entry.type";
import { RATINGS } from "../../data/rating.data";
import { findByType, findByTypes } from "../type.function";

/**
 * Kategorietyp welcher in der DB gespeichert wird
 */
export enum RatingType {
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

export const findRatingByType = (type: RatingType): Entry<RatingType> => {
  return findByType<RatingType>(
    type,
    RATINGS,
    "RATING.CHOOSE",
    "RATING.NOT",
    "rating",
    "rating-not"
  );
};

export const findRatingsByType = (types: RatingType[]): Entry<RatingType>[] => {
  return findByTypes<RatingType>(
    types,
    RATINGS,
    "RATING.CHOOSE",
    "RATING.NOT",
    "rating",
    "rating-not"
  );
};

export enum RatingIndex {
  OWN,
  WATCHABILITY,
  IMDB,
  METASCORE,
}
