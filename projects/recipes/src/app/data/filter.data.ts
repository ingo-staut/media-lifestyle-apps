import { missedAndNextOnly, previousOnly } from "shared/data/date-ranges.data";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { getTitleOfUrl } from "shared/utils/url";
import { RATINGS } from "../../../../../shared/data/rating.data";
import { FilterGroupKey } from "../../../../../shared/models/enum/filter.enum";
import { findRatingsByType } from "../../../../../shared/models/enum/rating.enum";
import { findCategoriesByType } from "../models/enum/category.enum";
import { findDifficultiesByType } from "../models/enum/difficulty.enum";
import { IngredientConversionContentType } from "../models/enum/ingredient-conversion-content.enum";
import { FilterButtonTristate } from "../models/filter-button-tristate.type";
import { FilterButtonValue } from "../models/filter-button-value.type";
import { FilterDates } from "../models/filter-dates.type";
import { FilterMultiSelectDynamicData } from "../models/filter-multi-select-dynamic-data.type";
import { FilterMultiSelectSpecific } from "../models/filter-multi-select-specific.type";
import { FilterMultiSelect } from "../models/filter-multi-select.type";
import { FilterFunctions } from "../models/filter.functions";
import { Filter } from "../models/filter.type";
import { IngredientConversion } from "../models/ingredient-conversion.class";
import { Recipe } from "../models/recipe.class";
import { CATEGORIES } from "./category.data";
import { DIFFICULTIES } from "./difficulty.data";
import { CONTENTS_LIST } from "./ingredient-contents.data";

const filterButtonTristateDefault: FilterButtonTristate = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.TRISTATE,
  texts: ["", "", ""],
  icons: ["", "", ""],
  value: ButtonTristate.TRUE,
  show: false,
  _filterButtonTristate: "",
  func: () => true,
};

const filterButtonValueDefault: FilterButtonValue = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.VALUE,
  texts: ["", "", "", ""],
  icons: ["", "", "", ""],
  searchTerms: [],
  suffixShort: "",
  suffixLong: "",
  value: 0,
  min: false,
  show: false,
  hideNullValues: true,
  func: () => true,
};

const filterMultiSelectDefault: FilterMultiSelect = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.MULTISELECT,
  isString: false,
  texts: ["", "", "", ""],
  icons: ["", "", "", ""],
  groups: [],
  findByTypes: () => [],
  func: () => true,
  _filterMultiSelect: "",
  value: [0],
  show: false,
  noAvailable: false,
};

const filterMultiSelectSpecificDefault: FilterMultiSelectSpecific = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.MULTISELECT,
  texts: ["", "", "", ""],
  icons: ["", "", "", ""],
  groups: [],
  specialOppositeValues: [],
  // findByTypes: () => [],
  func: () => true,
  _filterMultiSelectSpecific: "",
  value: ["none"],
  show: false,
};

const filterMultiSelectDynamicDataDefault: FilterMultiSelectDynamicData = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.MULTISELECT,
  texts: ["", "", "", ""],
  icons: ["", "", "", ""],
  func: () => true,
  value: ["none"],
  dynamicDataIndex: 0,
  show: false,
  noAvailable: false,
};

const filterDatesDefault: FilterDates = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.DATES,
  texts: [""],
  icons: [""],
  data: [],
  _filterDates: "",
  func: () => true,
  value: "today",
  show: false,
  additionalTermsRequired: [],
};

export const FILTERS: Filter[] = [
  {
    ...filterDatesDefault,
    key: FilterKey.PREPARED_DATES,
    texts: ["HISTORY.PREPARED"],
    icons: ["preparationHistory-prepared"],
    extraIcon: "preparationHistory-prepared",
    data: previousOnly,
    func: (recipe: Recipe, filter: FilterDates) => {
      return FilterFunctions.filterDatesShowRecipe(recipe.preparedDates, filter);
    },
  },
  {
    ...filterDatesDefault,
    key: FilterKey.PLANNED_DATES,
    texts: ["HISTORY.PLANNED"],
    icons: ["calendar"],
    data: missedAndNextOnly,
    func: (recipe: Recipe, filter: FilterDates) => {
      return FilterFunctions.filterDatesShowRecipe(recipe.plannedDates, filter);
    },
  },
  {
    ...filterDatesDefault,
    key: FilterKey.EDITED_DATES,
    texts: ["LAST_EDITED"],
    additionalTermsRequired: ["edited", "bearbeitet", "editado", "édité"],
    icons: ["last-edited"],
    extraIcon: "last-edited",
    data: previousOnly,
    func: (recipe: Recipe, filter: FilterDates) => {
      return FilterFunctions.filterDatesShowRecipe(recipe.editHistory, filter);
    },
  },
  {
    ...filterDatesDefault,
    key: FilterKey.CREATED,
    texts: ["CREATED"],
    icons: ["added"],
    extraIcon: "added",
    data: previousOnly,
    func: (recipe: Recipe, filter: FilterDates) => {
      return FilterFunctions.filterDatesShowRecipe([recipe.creationDate], filter);
    },
  },
  {
    ...filterMultiSelectDynamicDataDefault,
    key: FilterKey.URLS,
    texts: ["URL.S", "URL.NOT", "DO_NOT_FILTER", "URL.CHOOSE"],
    icons: ["url", "url-not", "filter-not", "url"],
    extraIcons: ["url"],
    dynamicDataIndex: 0,
    noAvailable: true,
    func: (recipe: Recipe, filter: FilterMultiSelectDynamicData) => {
      if (!filter.show) return true;

      // Schaue ob der Filter in den urls des Rezeptes vorkommt
      return (
        recipe.urls.some((url) => {
          return filter.value?.some((value) => {
            if (typeof value === "string")
              return getTitleOfUrl(url.url).toLowerCase() === value.toLowerCase();
            return false;
          });
        }) ||
        filter.value.length === 0 ||
        filter.value[0] === "none" ||
        // Keine Urls
        (filter.value.includes("no") && recipe.urls.length === 0)
      );
    },
  },
  {
    ...filterMultiSelectDefault,
    key: FilterKey.CATEGORIES,
    texts: ["CATEGORY.", "", "DO_NOT_FILTER", "CATEGORY.CHOOSE"],
    icons: ["category", "", "filter-not", "category"],
    groups: CATEGORIES,
    noAvailable: false,
    findByTypes: findCategoriesByType,
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterMultiSelectShowRecipe(recipe.category, filter);
    },
  },
  {
    ...filterMultiSelectDefault,
    key: FilterKey.RATING,
    texts: ["RATING.", "RATING.NOT", "DO_NOT_FILTER", "RATING.CHOOSE"],
    icons: ["rating", "rating-not", "filter-not", "rating"],
    groups: RATINGS,
    noAvailable: true,
    findByTypes: findRatingsByType,
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterMultiSelectShowRecipe(recipe.rating, filter);
    },
  },
  {
    ...filterMultiSelectDefault,
    key: FilterKey.DIFFICULTIES,
    texts: ["DIFFICULTY.", "DIFFICULTY.NOT", "DO_NOT_FILTER", "DIFFICULTY.CHOOSE"],
    icons: ["difficulty", "difficulty-not", "filter-not", "difficulty"],
    value: [0],
    show: false,
    groups: DIFFICULTIES,
    noAvailable: true,
    findByTypes: findDifficultiesByType,
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterMultiSelectShowRecipe(recipe.difficulty, filter);
    },
  },
  {
    ...filterMultiSelectSpecificDefault,
    key: FilterKey.CONTENTS,
    texts: ["CONTENT.S", "", "DO_NOT_FILTER", "CONTENT.CHOOSE"],
    icons: ["contents", "", "filter-not", "contents"],
    value: ["none"],
    show: false,
    groups: CONTENTS_LIST,
    specialOppositeValues: [
      [IngredientConversionContentType.VEGAN, IngredientConversionContentType.VEGETARIAN],
    ],
    func: (
      recipe: Recipe,
      filter: FilterMultiSelectSpecific,
      ingredientsConversion: IngredientConversion[] = []
    ) => {
      return FilterFunctions.filterMultiSelectSpecificShowRecipe(
        recipe,
        filter,
        ingredientsConversion
      );
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.FAVORITE,
    texts: ["FAVORITE.", "FAVORITE.", "FAVORITE.NO"],
    icons: ["favorite", "favorite-filled", "favorite-not"],
    func: (recipe: any, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(recipe.favorite, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.PREPARED,
    texts: ["HISTORY.PREPARED", "HISTORY.PREPARED", "HISTORY.PREPARED_NOT"],
    icons: [
      "preparationHistory-prepared",
      "preparationHistory-prepared",
      "preparationHistory-prepared-no",
    ],
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(recipe.oncePrepared, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.PLANNED,
    texts: ["HISTORY.PLANNED", "HISTORY.PLANNED", "HISTORY.PLANNED_NOT"],
    icons: ["preparationHistory-planned", "preparationHistory-planned", "calendar-not"],
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(recipe.oncePlanned, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.BASIC_RECIPE,
    texts: ["RECIPE_BASIC", "RECIPE_BASIC", "RECIPE_BASIC_NO"],
    icons: ["recipe-basic", "recipe-basic-filled", "recipe-not"],
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(recipe.basic, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.NOTE,
    texts: ["NOTE.", "NOTE.", "NOTE.NO"],
    icons: ["note", "note-filled", "note-not"],
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(recipe.note.trim().length > 0, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.LINKED_RECIPES,
    texts: ["LINK.LINKED_RECIPES", "LINK.LINKED_RECIPES", "LINK.NO_LINKED_RECIPES"],
    icons: ["link", "link", "unlink"],
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(
        recipe.linkedRecipes.length > 0,
        filter
      );
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.IMAGE,
    texts: ["IMAGE.", "IMAGE.", "IMAGE.NO"],
    icons: ["image", "image-filled", "image-not"],
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(recipe.images.length > 0, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.TAGS,
    texts: ["TAGS", "TAGS", "TAGS_NO"],
    icons: ["tag", "tag-filled", "tag-not"],
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(recipe.tags.length > 0, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.ON_SHOPPINGLIST,
    texts: ["SHOPPING_LIST.ON", "SHOPPING_LIST.ON", "SHOPPING_LIST.ON_NO"],
    icons: ["shopping-cart", "shopping-cart-filled", "shopping-cart-not"],
    func: (recipe: Recipe, filter: any) => {
      return FilterFunctions.filterButtonTristateShowRecipe(!!recipe.isOnShoppingList, filter);
    },
  },
  {
    ...filterButtonValueDefault,
    key: FilterKey.COSTS,
    value: 5,
    texts: ["COST.", "COST.", "COST.NO", "COST.WITH"],
    icons: ["money", "money", "money", "money"],
    suffixShort: "€",
    suffixLong: "€",
    func: (recipe, filter, ingredientsConversion) => {
      if (!filter.show) return true;
      const costs = recipe.getCosts(ingredientsConversion);
      const cost = costs.normal;
      if (cost === 0 && filter.hideNullValues) return false;
      return (!filter.min && cost <= filter.value) || (filter.min && cost >= filter.value);
    },
  },
  {
    ...filterButtonValueDefault,
    key: FilterKey.INGREDIENTS_QUANTITY,
    value: 5,
    texts: [
      "INGREDIENT.S.",
      "INGREDIENTS_QUANTITY.",
      "INGREDIENTS_QUANTITY.NO",
      "INGREDIENTS_QUANTITY.WITH",
    ],
    icons: ["ingredient", "ingredient", "ingredient-not", "ingredient"],
    func: (recipe, filter, ingredientsConversion) => {
      const ingredientsCount = recipe.ingredientsCount;

      if (!filter.show) return true;
      if (ingredientsCount === 0 && filter.hideNullValues) return false;
      return (
        (!filter.min && ingredientsCount <= filter.value) ||
        (filter.min && ingredientsCount >= filter.value)
      );
    },
  },
  {
    ...filterButtonValueDefault,
    key: FilterKey.PREPARATION_TIME,
    value: 20,
    texts: [
      "PREPARATION_TIME.",
      "PREPARATION_TIME.",
      "PREPARATION_TIME.NO",
      "PREPARATION_TIME.WITH",
    ],
    icons: ["time", "time", "time-not", "time"],
    suffixLong: "TIME.MINUTES",
    suffixShort: "TIME.MINUTES_SHORT",
    sliderSteps: 5,
    sliderFormatAsDuration: true,
    func: (recipe, filter, ingredientsConversion) => {
      if (!filter.show) return true;
      if (recipe.totalPreparationDurationInMinutes === 0 && filter.hideNullValues) return false;
      return (
        ((!filter.min && recipe.totalPreparationDurationInMinutes <= filter.value) ||
          (filter.min && recipe.totalPreparationDurationInMinutes >= filter.value)) ??
        true
      );
    },
  },
  {
    ...filterButtonValueDefault,
    key: FilterKey.PORTIONS_LEFT,
    value: 1,
    min: true,
    texts: ["PORTION.LEFT.", "PORTION.LEFT.", "PORTION.LEFT.NO", "PORTION.LEFT.WITH"],
    icons: ["portion-eat", "portion-eat", "portion-eat-not", "portion-eat"],
    searchTerms: ["portionen übrig", "remaining portions", "left portions"],
    func: (recipe, filter) => {
      if (!filter.show) return true;
      if (!recipe.lastPreparation) return false;
      if (
        recipe.lastPreparation &&
        // 0, null
        !recipe.lastPreparation.portionsAvailable &&
        filter.hideNullValues
      )
        return false;

      return (
        ((!filter.min && (recipe.lastPreparation.portionsAvailable ?? 0) <= filter.value) ||
          (filter.min && (recipe.lastPreparation.portionsAvailable ?? 0) >= filter.value)) ??
        true
      );
    },
  },
];
