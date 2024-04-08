import isEqual from "lodash.isequal";
import { GroupType } from "shared/models/enum/type-group.enum";
import { Url } from "shared/models/url.class";
import { DateFns } from "shared/utils/date-fns";
import { CONTENTS } from "../data/ingredient-contents.data";
import { CategoryType, findCategoryGroupTypeByType } from "./enum/category.enum";
import { IngredientConversionContentType } from "./enum/ingredient-conversion-content.enum";
import { PreparationHistoryType } from "./enum/preparation-history.enum";
import { IngredientConversion } from "./ingredient-conversion.class";
import { Ingredient } from "./ingredient.class";
import { Instruction } from "./instruction.class";
import { Nutrition } from "./nutrition.type";
import { PreparationHistoryEntry } from "./preparation-history.class";
import { RecipeOnShoppingList } from "./recipe-shoppinglist.type";
import { Utensil } from "./utensil.class";

export class Recipe {
  id: string;
  name: string;
  note: string;
  amountText: string;
  amountNumber: number;
  portions: number;
  tags: string[];
  category: CategoryType;
  difficulty: number;
  rating: number;
  instructions: Instruction[];
  images: string[];
  favorite: boolean;
  preparationHistory: PreparationHistoryEntry[];
  urls: Url[];
  linkedRecipes: string[];
  variants: string[];
  editHistory: Date[];
  isOnShoppingList: RecipeOnShoppingList | null;
  basic: boolean;
  nutritionDetails: Nutrition[];
  cuisines: string[];
  _searchMatchScore: number;

  private _costs?: { normal: number; perPortion: number; max: number };

  private _ingredientsCount?: number;
  private _categoryGroupType?: GroupType;
  private _totalPreparationDuration?: number;

  private _isVegan?: boolean;
  private _isVegetarian?: boolean;

  constructor(recipe: {
    id?: string;
    name?: string;
    note?: string;
    amountText?: string;
    amountNumber?: number;
    portions?: number;
    tags?: string[];
    category?: CategoryType;
    difficulty?: number;
    rating?: number;
    instructions?: Instruction[];
    images?: string[];
    favorite?: boolean;
    preparationHistory?: PreparationHistoryEntry[];
    urls?: Url[];
    linkedRecipes?: string[];
    variants?: string[];
    editHistory?: Date[];
    isOnShoppingList?: RecipeOnShoppingList | null;
    basic?: boolean;
    nutritionDetails?: Nutrition[];
    cuisines?: string[];
  }) {
    this.id = recipe.id ?? "";
    this.name = recipe.name ?? "";
    this.note = recipe.note ?? "";
    this.amountText = recipe.amountText ?? "";
    this.amountNumber = recipe.amountNumber ?? 1;
    this.portions = recipe.portions ?? 1;
    this.tags = recipe.tags ?? [];
    this.category = recipe.category ?? 0;
    this.difficulty = recipe.difficulty ?? 0;
    this.rating = recipe.rating ?? 0;
    this.instructions = recipe.instructions ?? [];
    this.images = recipe.images ?? [];
    this.favorite = recipe.favorite ?? false;
    this.preparationHistory = recipe.preparationHistory ?? [];
    this.urls = recipe.urls ?? [];
    this.linkedRecipes = recipe.linkedRecipes ?? [];
    this.variants = recipe.variants ?? [];
    this.editHistory = recipe.editHistory ?? [];
    this.isOnShoppingList = recipe.isOnShoppingList ?? null;
    this.basic = recipe.basic ?? false;
    this.nutritionDetails = recipe.nutritionDetails ?? [];
    this.cuisines = recipe.cuisines ?? [];
  }

  get ingredientsCount(): number {
    if (this._ingredientsCount !== undefined) return this._ingredientsCount;

    this._ingredientsCount = this.ingredients.length;
    return this._ingredientsCount;
  }

  get categoryGroupType(): GroupType {
    if (this._categoryGroupType !== undefined) return this._categoryGroupType;

    this._categoryGroupType = findCategoryGroupTypeByType(this.category)?.type!;
    return this._categoryGroupType;
  }

  get totalPreparationDurationInMinutes(): number {
    if (this._totalPreparationDuration !== undefined) return this._totalPreparationDuration;

    this._totalPreparationDuration = this.calculateTotalPreparationDurationInMinutes;
    return this._totalPreparationDuration;
  }

  get lastPreparationDateTime(): number {
    const lastPreparation = [...this.preparationHistory]
      .sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      })
      .find((preparation) => preparation.type === PreparationHistoryType.PREPARED);
    return lastPreparation?.date.getTime() ?? 0;
  }

  get lastPreparationDate(): Date {
    const lastPreparation = [...this.preparationHistory]
      .sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      })
      .find((preparation) => preparation.type === PreparationHistoryType.PREPARED);
    return lastPreparation?.date ?? new Date(-1);
  }

  get lastPreparation(): PreparationHistoryEntry | undefined {
    const lastPreparation = [...this.preparationHistory]
      .sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      })
      .find((preparation) => preparation.type === PreparationHistoryType.PREPARED);
    return lastPreparation;
  }

  get lastPlannedDate(): Date {
    const lastPlanned = [...this.preparationHistory]
      .sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      })
      .find((preparation) => preparation.type === PreparationHistoryType.PLANNED);
    return lastPlanned?.date ?? new Date(-1);
  }

  get lastPlannedIndex() {
    return this.preparationHistory.reduce((latestIndex, entry, currentIndex) => {
      if (
        entry.type === "PLANNED" &&
        (latestIndex === -1 || entry.date > this.preparationHistory[latestIndex].date)
      ) {
        return currentIndex;
      } else {
        return latestIndex;
      }
    }, -1);
  }

  get firstPlannedDate(): Date {
    const firstPlanned = [...this.preparationHistory]
      .sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      })
      .find((preparation) => preparation.type === PreparationHistoryType.PLANNED);
    return firstPlanned?.date ?? new Date(-1);
  }

  get lastEditedDate(): Date {
    return this.editHistory[0] ?? new Date(-1);
  }

  get creationDate(): Date {
    return this.editHistory[this.editHistory.length - 1] ?? new Date(-1);
  }

  get ingredients(): Ingredient[] {
    return this.instructions.map((instruction) => instruction.ingredients).flat();
  }

  get utensils(): Utensil[] {
    return this.instructions.map((instruction) => instruction.utensils).flat();
  }

  get totalIngredientsAmount() {
    return this.ingredients.length;
  }

  private get calculateTotalPreparationDurationInMinutes(): number {
    const totalPreparationTime = this.instructions.reduce((pre, cur) => {
      return (pre += Math.max(cur.maxTime ?? 0, cur.minTime ?? 0));
    }, 0);
    return totalPreparationTime;
  }

  get oncePrepared(): boolean {
    return this.preparationHistory.some((prep) => prep.type === PreparationHistoryType.PREPARED);
  }

  get oncePortionsLeft(): boolean {
    return this.preparationHistory.some(
      (prep) => prep.type === PreparationHistoryType.PREPARED && !!prep.portionsAvailable
    );
  }

  get oncePlanned(): boolean {
    return this.preparationHistory.some((prep) => prep.type === PreparationHistoryType.PLANNED);
  }

  get isPannedToday(): boolean {
    return this.preparationHistory.some(
      (prep) => prep.type === PreparationHistoryType.PLANNED && DateFns.isToday(prep.date)
    );
  }

  get isPlannedTomorrow(): boolean {
    return this.preparationHistory.some(
      (prep) => prep.type === PreparationHistoryType.PLANNED && DateFns.isTomorrow(prep.date)
    );
  }

  get plannedDates(): Date[] {
    return this.preparationHistory
      .filter((prep) => prep.type === PreparationHistoryType.PLANNED)
      .map((prep) => prep.date);
  }

  get preparedDates(): Date[] {
    return this.preparationHistory
      .filter((prep) => prep.type === PreparationHistoryType.PREPARED)
      .map((prep) => prep.date);
  }

  static sortByRatingDescending = (recipe: Recipe, other: Recipe) =>
    (other.rating ?? 0) - (recipe.rating ?? 0);

  static sortByPreparationDurationDescending = (recipe: Recipe, other: Recipe) =>
    other.totalPreparationDurationInMinutes - recipe.totalPreparationDurationInMinutes;

  static sortByPreparationDurationAscending = (recipe: Recipe, other: Recipe) =>
    recipe.totalPreparationDurationInMinutes - other.totalPreparationDurationInMinutes;

  static sortByEditHistoryDescending = (recipe: Recipe, other: Recipe) =>
    other.editHistory[0].getTime() - recipe.editHistory[0].getTime();

  /**
   * ! Bei jedem Rezept wurde bereits `getCosts` aufgerufen
   */
  static sortByCostDescending = (recipe: Recipe, other: Recipe) =>
    (other.getCosts([]).normal ?? 0) - (recipe.getCosts([]).normal ?? 0);

  static sortByCostAscending = (recipe: Recipe, other: Recipe) =>
    (recipe.getCosts([]).normal ?? 0) - (other.getCosts([]).normal ?? 0);

  veganPercentage(ingredientsConversion: IngredientConversion[], getTrueIfNoType: boolean = false) {
    const ingredients = this.ingredients;

    let veganCount = 0;
    ingredients.forEach((ingredient) => {
      if (new Ingredient(ingredient).isVegan(ingredientsConversion, getTrueIfNoType)) {
        veganCount++;
      } else {
      }
    });

    return veganCount / ingredients.length;
  }

  private isVegan(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    const ingredients = this.ingredients;

    // Wenn keine Zutaten, dann schauen ob im Titel "vegan" steht
    if (!ingredients.length) return this.name.toLowerCase().includes("vegan");

    return ingredients.every((ingredient) =>
      new Ingredient(ingredient).isVegan(ingredientsConversion, getTrueIfNoType)
    );
  }

  getIsVegan(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ): boolean {
    if (this._isVegan !== undefined) return this._isVegan;

    this._isVegan = this.isVegan(ingredientsConversion, getTrueIfNoType);
    return this._isVegan;
  }

  private isVegetarian(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean = false
  ) {
    const ingredients = this.ingredients;

    // Wenn keine Zutaten, dann schauen ob im Titel "vegan" steht
    if (!ingredients.length)
      return (
        this.name.toLowerCase().includes("vegan") || this.name.toLowerCase().includes("vegetarisch")
      );

    return ingredients.every((ingredient) =>
      new Ingredient(ingredient).isVegetarian(ingredientsConversion, getTrueIfNoType)
    );
  }

  getIsVegetarian(ingredientsConversion: IngredientConversion[], getTrueIfNoType: boolean = false) {
    if (this._isVegetarian !== undefined) return this._isVegetarian;

    this._isVegetarian = this.isVegetarian(ingredientsConversion, getTrueIfNoType);
    return this._isVegetarian;
  }

  getMostlyContentsTypeObject(
    ingredientsConversion: IngredientConversion[],
    getTrueIfNoType: boolean
  ) {
    if (this.isVegan(ingredientsConversion, getTrueIfNoType)) {
      return CONTENTS.get(IngredientConversionContentType.VEGAN);
    }
    if (this.isVegetarian(ingredientsConversion, getTrueIfNoType)) {
      return CONTENTS.get(IngredientConversionContentType.VEGETARIAN);
    }

    return null;
  }

  containsAlcohol(ingredientsConversion: IngredientConversion[]) {
    return this.ingredients.some((ingredient) =>
      new Ingredient(ingredient).containsAlcohol(ingredientsConversion)
    );
  }

  containsSugar(ingredientsConversion: IngredientConversion[]) {
    return this.ingredients.some((ingredient) =>
      new Ingredient(ingredient).containsSugar(ingredientsConversion)
    );
  }

  containsFructose(ingredientsConversion: IngredientConversion[]) {
    return this.ingredients.some((ingredient) =>
      new Ingredient(ingredient).containsFructose(ingredientsConversion)
    );
  }

  containsLactose(ingredientsConversion: IngredientConversion[]) {
    return this.ingredients.some((ingredient) =>
      new Ingredient(ingredient).containsLactose(ingredientsConversion)
    );
  }

  containsGluten(ingredientsConversion: IngredientConversion[]) {
    return this.ingredients.some((ingredient) =>
      new Ingredient(ingredient).containsGluten(ingredientsConversion)
    );
  }

  containsSugarIfNotDessertAndNoSugarIfDessert(ingredientsConversion: IngredientConversion[]) {
    const containsSugar = this.ingredients.some((ingredient) =>
      new Ingredient(ingredient).containsSugar(ingredientsConversion)
    );

    const group = findCategoryGroupTypeByType(this.category);
    if (!group) return null;

    // Wenn Zucker, aber kein Nachtisch
    if (containsSugar && group.type !== GroupType.AFTER) {
      return { ...CONTENTS.get(IngredientConversionContentType.SUGAR), not: false };
    }
    // Wenn kein Zucker, aber Nachtisch
    if (!containsSugar && group.type === GroupType.AFTER) {
      return { ...CONTENTS.get(IngredientConversionContentType.SUGAR), not: true };
    }

    return null;
  }

  getCosts(ingredientsConversion: IngredientConversion[]) {
    if (this._costs != undefined) return this._costs;

    this._costs = this.getRecipeCosts(ingredientsConversion);
    return this._costs;
  }

  getNormalCost(ingredientsConversion: IngredientConversion[]): number {
    return this.getCosts(ingredientsConversion).normal;
  }

  getRecipeCosts(ingredientsConversion: IngredientConversion[]) {
    return this.ingredients.reduce(
      (previous, current) => {
        const costs = IngredientConversion.getMostFittingPrices(
          current,
          this.portions,
          ingredientsConversion
        );
        if (!costs) return previous;

        const cost = {
          normal: previous.normal + costs.normal,
          perPortion: previous.perPortion + costs.perPortion,
          max: previous.max + costs.max,
        };
        return cost;
      },
      { normal: 0, perPortion: 0, max: 0 }
    );
  }

  getTotalPreparationTimeAsDate(): Date {
    return DateFns.addMinutesToCurrentDate(this.totalPreparationDurationInMinutes);
  }

  getPlannedDetails(locale: string) {
    const allPlanned = this.preparationHistory.filter(
      (preparation) => preparation.type === PreparationHistoryType.PLANNED
    );
    if (allPlanned.length === 0) return null;
    if (allPlanned.length === 1) {
      const date = allPlanned[0].date;
      if (DateFns.isYesterday(date))
        return { icon: "calendar-yesterday", text: "HISTORY.PLANNED_YESTERDAY" };
      if (DateFns.isToday(date)) return { icon: "calendar-today", text: "HISTORY.PLANNED_TODAY" };
      if (DateFns.isTomorrow(date))
        return { icon: "calendar-tomorrow", text: "HISTORY.PLANNED_TOMORROW" };
      return { icon: "calendar", text: DateFns.formatDateShort(date, locale) };
    }
    return { icon: "calendar-days", text: "HISTORY.PLANNED_MULTIPLE" };
  }

  isEqualTo(other: Recipe) {
    var equal = true;
    var message: { key: string; this: any; other: any }[] = [];
    if (this.id !== other.id) {
      equal = false;
      message.push({ key: "ID", this: this.id, other: other.id });
    }
    if (this.name !== other.name) {
      equal = false;
      message.push({ key: "TITLE", this: this.name, other: other.name });
    }
    if (this.basic !== other.basic) {
      equal = false;
      message.push({ key: "RECIPE_BASIC", this: this.basic, other: other.basic });
    }
    if (this.note !== other.note) {
      equal = false;
      message.push({ key: "NOTE.", this: this.note, other: other.note });
    }
    if (this.amountText !== other.amountText) {
      equal = false;
      message.push({ key: "PORTION.UNIT", this: this.amountText, other: other.amountText });
    }
    if (this.amountNumber !== other.amountNumber) {
      equal = false;
      message.push({ key: "AMOUNT", this: this.amountNumber, other: other.amountNumber });
    }
    if (this.portions !== other.portions) {
      equal = false;
      message.push({ key: "PORTION.S", this: this.portions, other: other.portions });
    }
    if (!isEqual(this.tags, other.tags)) {
      equal = false;
      message.push({ key: "TAGS", this: this.tags, other: other.tags });
    }
    if (this.category !== other.category) {
      equal = false;
      message.push({ key: "CATEGORY.", this: this.category, other: other.category });
    }
    if (this.difficulty !== other.difficulty) {
      equal = false;
      message.push({ key: "DIFFICULTY.", this: this.difficulty, other: other.difficulty });
    }
    if (this.rating !== other.rating) {
      equal = false;
      message.push({ key: "RATING.", this: this.rating, other: other.rating });
    }
    // ! "Variants" werden nicht verglichen
    if (!Instruction.isEqual(this.instructions, other.instructions)) {
      equal = false;
      message.push({ key: "INSTRUCTION.S", this: this.instructions, other: other.instructions });
    }
    if (!isEqual(this.images, other.images)) {
      equal = false;
      message.push({ key: "IMAGE.S", this: this.images, other: other.images });
    }
    if (this.favorite !== other.favorite) {
      equal = false;
      message.push({ key: "FAVORITE.", this: this.favorite, other: other.favorite });
    }
    if (!PreparationHistoryEntry.isEqual(this.preparationHistory, other.preparationHistory)) {
      equal = false;
      message.push({
        key: "HISTORY.",
        this: this.preparationHistory,
        other: other.preparationHistory,
      });
    }
    if (!isEqual(this.urls, other.urls)) {
      equal = false;
      message.push({ key: "URL.S", this: this.urls, other: other.urls });
    }
    if (!isEqual(this.linkedRecipes, other.linkedRecipes)) {
      equal = false;
      message.push({
        key: "LINK.LINKED_RECIPES",
        this: this.linkedRecipes,
        other: other.linkedRecipes,
      });
    }
    // if (!isEqual(this.variants, other.variants)) {
    //   equal = false;
    //   message.push({ key: "variants,", this: this.variants, other: other.variants });
    // }
    if (!isEqual(this.isOnShoppingList, other.isOnShoppingList)) {
      equal = false;
      message.push({
        key: "SHOPPING_LIST",
        this: this.isOnShoppingList,
        other: other.isOnShoppingList,
      });
    }
    if (
      !(
        (!this.nutritionDetails || !this.nutritionDetails.length) &&
        (!other.nutritionDetails || !other.nutritionDetails.length)
      ) &&
      !isEqual(this.nutritionDetails, other.nutritionDetails)
    ) {
      equal = false;
      message.push({
        key: "NUTRITION.S",
        this: this.nutritionDetails,
        other: other.nutritionDetails,
      });
    }

    return {
      equal,
      messages: message.map((m) => m.key),
      diff: message,
    };
  }

  static sortByName = (a: Recipe, b: Recipe) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  };

  static onePortionLessLeft(recipe: Recipe) {
    if (recipe.lastPreparation && recipe.lastPreparation.portionsAvailable) {
      recipe.lastPreparation.portionsAvailable = Math.max(
        recipe.lastPreparation.portionsAvailable - 1,
        0
      );
    }
  }
}
