import { Entry } from "shared/models/type-entry.type";
import { findByType, findByTypes } from "../../../../../../shared/models/type.function";
import { DIFFICULTIES } from "../../data/difficulty.data";

export enum DifficultyType {
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

export const findDifficultyByType = (type: DifficultyType): Entry<DifficultyType> => {
  return findByType<DifficultyType>(type, DIFFICULTIES, "CATEGORY.CHOOSE");
};

export const findDifficultiesByType = (types: DifficultyType[]): Entry<DifficultyType>[] => {
  return findByTypes<DifficultyType>(types, DIFFICULTIES, "DIFFICULTY.CHOOSE", "DIFFICULTY.NOT");
};
