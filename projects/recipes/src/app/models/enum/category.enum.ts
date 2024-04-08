import { getAllSearchTerms } from "projects/recipes/src/utils/translation";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import {
  findByText,
  findByType,
  findByTypes,
  findGroupByEntryType,
} from "../../../../../../shared/models/type.function";
import { CATEGORIES } from "../../data/category.data";

/**
 * Kategorietyp welcher in der DB gespeichert wird
 */
export enum CategoryType {
  NONE = 0,
  SALAD = 1,
  SOUP = 2,
  SANDWICH = 3,
  SAUCE = 4,
  CASSEROLE = 5,
  PASTA = 6,
  PAN_DISH = 7,
  BURGER = 8,
  PIZZA = 9,
  OVEN_DISH = 10,
  CAKE = 11,
  CUPCAKE = 12,
  ICE_CREAM = 13,
  COOKIE = 14,
  COCKTAIL = 15,
  SMOOTHIE = 16,
  JUICE = 17,
  WAFFFLES = 18,
  CUTLETS = 19,
  BREAD = 20,
}

export const findCategoryByType = (type: CategoryType): Entry<CategoryType> => {
  return findByType<CategoryType>(type, CATEGORIES, "CATEGORY.CHOOSE");
};

export const findCategoriesByType = (types: CategoryType[]): Entry<CategoryType>[] => {
  return findByTypes<CategoryType>(types, CATEGORIES, "CATEGORY.CHOOSE");
};

export const findCategoryByText = (text: string): Entry<CategoryType> => {
  return findByText<CategoryType>(text, CATEGORIES);
};

export const CATEGORY_SEARCH_TERMS = CATEGORIES.flatMap((group) =>
  group.entries.flatMap((entry) => [...getAllSearchTerms(entry.name)])
);

export function findCategoryInTitle(text: string) {
  const entry = findCategoryByText(text);
  return entry.type === 0
    ? null
    : {
        category: entry.type,
        amountText:
          entry.defaultValues?.find((t) => text.toLowerCase().includes(t.toLowerCase())) ??
          (entry.defaultValues && entry.defaultValues.length
            ? entry.defaultValues.at(0)
            : undefined),
        defaultPortion: entry.defaultPortion,
      };
}

export const findCategoryGroupTypeByType = (type: CategoryType): Group<CategoryType> | null => {
  return findGroupByEntryType<CategoryType>(CATEGORIES, type);
};
