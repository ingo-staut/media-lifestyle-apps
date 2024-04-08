import { REGEX_SPACES_OR_TAB } from "shared/utils/regexp";
import { combinePairsInList } from "shared/utils/string";
import { getAllSearchTerms } from "../../utils/translation";

const NUTRITION_NAMES = new Map<keyof Nutrition, { text: string; additionalTerms: string[] }>([
  ["calories", { text: "NUTRITION.CALORIES", additionalTerms: [] }],
  ["fat", { text: "NUTRITION.FAT", additionalTerms: [] }],
  ["saturatedFat", { text: "NUTRITION.SATURATED_FAT", additionalTerms: [] }],
  ["carbohydrate", { text: "NUTRITION.CARBOHYDRATE", additionalTerms: [] }],
  ["fiber", { text: "NUTRITION.FIBER", additionalTerms: [] }],
  ["sugar", { text: "NUTRITION.SUGAR", additionalTerms: [] }],
  ["protein", { text: "NUTRITION.PROTEIN", additionalTerms: ["eiweiss"] }],
  ["sodium", { text: "NUTRITION.SODIUM", additionalTerms: [] }],
  ["potassium", { text: "NUTRITION.POTASSIUM", additionalTerms: [] }],
  ["calcium", { text: "NUTRITION.CALCIUM", additionalTerms: [] }],
  ["iron", { text: "NUTRITION.IRON", additionalTerms: [] }],
  ["cholesterol", { text: "NUTRITION.CHOLESTEROL", additionalTerms: [] }],
]);

export class Nutrition {
  servingSize: string | null;

  calories: number | null; // In kcal

  fat: number | null;
  saturatedFat: number | null;

  carbohydrate: number | null;
  fiber: number | null; // = Ballaststoffe
  sugar: number | null;

  protein: number | null;

  sodium: number | null; // = Natrium // In Milligramm
  potassium: number | null; // = Kalium // In Milligramm
  calcium: number | null; // In Milligramm
  iron: number | null; // In Milligramm

  cholesterol: number | null;

  constructor(nutrition: {
    servingSize?: string;

    calories?: number;

    fat?: number;
    saturatedFat?: number;

    carbohydrate?: number;
    fiber?: number;
    sugar?: number;

    protein?: number;

    sodium?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;

    cholesterol?: number;
  }) {
    this.servingSize = nutrition.servingSize || "";
    // Werte können NaN sein, deshalb "||"
    this.calories = nutrition.calories || null;

    this.fat = nutrition.fat || null;
    this.saturatedFat = nutrition.saturatedFat || null;

    this.carbohydrate = nutrition.carbohydrate || null;
    this.fiber = nutrition.fiber || null;
    this.sugar = nutrition.sugar || null;

    this.protein = nutrition.protein || null;

    this.sodium = nutrition.sodium || null;
    this.potassium = nutrition.potassium || null;
    this.calcium = nutrition.calcium || null;
    this.iron = nutrition.iron || null;

    this.cholesterol = nutrition.cholesterol || null;
  }

  static getNutritionOfMultilineText(text: string): Nutrition | null {
    try {
      let lines = text.split("\n");

      // Jede gerade Zeile beginnt mit einer Zahl
      const everyEvenLineHasDigitPercentage =
        lines.filter((line, index) => (index % 2 === 0 ? true : line.match(/^\d/))).length /
        lines.length;

      // Jede ungerade Zeile beginnt mit Text
      const everyOddLineHasDigitPercentage =
        lines.filter((line, index) => (index % 2 === 0 ? line.match(RegExp(/^[a-z]/, "gi")) : true))
          .length / lines.length;

      if (everyEvenLineHasDigitPercentage > 0.7 && everyOddLineHasDigitPercentage > 0.7) {
        lines = combinePairsInList(lines, "\t");
      }

      const nutrition = new Nutrition({});

      lines.forEach((line) => {
        const data = line.split(REGEX_SPACES_OR_TAB);
        const name = data[0].trim();
        const number = Number(data[1].split(" ")[0].trim());

        NUTRITION_NAMES.forEach((value, key) => {
          const terms = getAllSearchTerms(value.text);
          const includes =
            terms.includes(name.toLowerCase()) ||
            value.additionalTerms.includes(name.toLowerCase());

          if (includes) (nutrition as any)[key] = number;
        });
      });

      return nutrition;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
