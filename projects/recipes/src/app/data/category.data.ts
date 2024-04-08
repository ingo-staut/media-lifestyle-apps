import { GroupType } from "shared/models/enum/type-group.enum";
import { Group } from "shared/models/type-group.type";
import { QuickAddDropdownFilterFromSearch } from "../../../../../shared/models/search-filter.type";
import { getQuickAddDropdownMultipleSelectFilterFromSearch } from "../../../../../shared/models/type.function";

// !WARNING: Dieser Typ ist ein Duplikat
// !Nicht verwenden
enum CategoryType {
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

/**
 * Kategorien, sortiert nach Überbegriffen
 * Icon = Nummer des CategorieType
 */
export const CATEGORIES: ReadonlyArray<Group<CategoryType>> = [
  {
    name: "CATEGORY.APPETIZERS",
    icon: "category-pre",
    additionalSearchTerms: ["Vorspeise"],
    type: GroupType.PRE,
    entries: [
      {
        name: "CATEGORY.SALAD",
        type: CategoryType.SALAD,
        icon: "category-salad",
      },
      {
        name: "CATEGORY.SOUP",
        type: CategoryType.SOUP,
        icon: "category-soup",
        defaultPortion: 1,
      },
      {
        name: "CATEGORY.SANDWICH",
        type: CategoryType.SANDWICH,
        icon: "category-sandwich",
        defaultValues: ["Sandwiches"],
      },
      {
        name: "CATEGORY.SAUCE",
        type: CategoryType.SAUCE,
        icon: "category-sauce",
      },
    ],
  },
  {
    name: "CATEGORY.MAIN",
    icon: "category-main",
    type: GroupType.MAIN,
    entries: [
      {
        name: "CATEGORY.CASSEROLE",
        type: CategoryType.CASSEROLE,
        icon: "category-casserole",
        defaultValues: ["Auflaufformen"],
        defaultPortion: 1,
      },
      {
        name: "CATEGORY.PASTA",
        type: CategoryType.PASTA,
        icon: "category-pasta",
      },
      {
        name: "CATEGORY.PAN_DISH",
        type: CategoryType.PAN_DISH,
        icon: "category-pan-dish",
      },
      {
        name: "CATEGORY.BURGER",
        type: CategoryType.BURGER,
        icon: "category-burger",
        additionalSearchTerms: ["Tacos"],
        defaultValues: ["Burger", "Tacos"],
      },
      { name: "CATEGORY.PIZZA", type: CategoryType.PIZZA, icon: "category-pizza" },
      {
        name: "CATEGORY.OVEN_DISH",
        type: CategoryType.OVEN_DISH,
        icon: "category-oven-dish",
      },
      {
        name: "CATEGORY.BREAD",
        type: CategoryType.BREAD,
        icon: "category-bread",
        defaultValues: ["Brot"],
        defaultPortion: 1,
      },
    ],
  },
  {
    name: "CATEGORY.DESSERT",
    icon: "category-after",
    type: GroupType.AFTER,
    entries: [
      {
        name: "CATEGORY.CAKE",
        type: CategoryType.CAKE,
        icon: "category-cake",
        defaultValues: ["Kuchen"],
        defaultPortion: 1,
      },
      {
        name: "CATEGORY.CUPCAKE",
        type: CategoryType.CUPCAKE,
        icon: "category-cupcake",
        defaultValues: ["Muffins"],
      },
      {
        name: "CATEGORY.ICE_CREAM",
        type: CategoryType.ICE_CREAM,
        icon: "category-ice-cream",
      },
      {
        name: "CATEGORY.CUTLETS",
        type: CategoryType.CUTLETS,
        icon: "category-cutlets",
        additionalSearchTerms: ["Schnittchen", "Brownie"],
        defaultValues: ["Schnitten", "Brownies"],
      },
      {
        name: "CATEGORY.COOKIE",
        type: CategoryType.COOKIE,
        icon: "category-cookie",
        additionalSearchTerms: ["Kekse"],
        defaultValues: ["Plätzchen"],
      },
      {
        name: "CATEGORY.WAFFLES",
        type: CategoryType.WAFFFLES,
        icon: "category-waffles",
        defaultValues: ["Waffeln", "Pfannkuchen"],
      },
    ],
  },
  {
    name: "CATEGORY.DRINKS",
    icon: "category-drinks",
    type: GroupType.DRINKS,
    entries: [
      {
        name: "CATEGORY.JUICE",
        type: CategoryType.JUICE,
        icon: "category-juice",
      },
      {
        name: "CATEGORY.COCKTAIL",
        type: CategoryType.COCKTAIL,
        icon: "category-cocktail",
      },
      {
        name: "CATEGORY.SMOOTHIE",
        type: CategoryType.SMOOTHIE,
        icon: "category-smoothie",
      },
    ],
  },
];

export const CATEGORIES_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH: ReadonlyArray<
  QuickAddDropdownFilterFromSearch<number>
> = getQuickAddDropdownMultipleSelectFilterFromSearch(CATEGORIES, "category");
