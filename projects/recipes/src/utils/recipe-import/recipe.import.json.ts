import * as cheerio from "cheerio";
import { cloneDeep } from "lodash";
import { Url } from "shared/models/url.class";
import { isListOfObjects, isListOfStrings } from "shared/utils/list";
import { findMostFrequentNumber, roundToNearestNumber } from "shared/utils/number";
import { compareText, firstCharToTitleCase } from "shared/utils/string";
import {
  CategoryType,
  findCategoryByText,
  findCategoryInTitle,
} from "../../app/models/enum/category.enum";
import { Ingredient } from "../../app/models/ingredient.class";
import { Instruction } from "../../app/models/instruction.class";
import { Nutrition } from "../../app/models/nutrition.type";
import { Recipe } from "../../app/models/recipe.class";
import { UtensilObject } from "../../app/models/utensil-object.class";
import { Utensil } from "../../app/models/utensil.class";
import { trimRecipeTitle } from "./recipe.import";

interface RecipeInstruction {
  text: string;
  name?: string;
}

interface HowToStep extends RecipeInstruction {
  "@type": string;
  url?: string;
}

interface HowToSection {
  "@type": string;
  name: string;
  itemListElement: HowToStep[];
}

function getTimeFromString(time: string) {
  if (!time) return 0;

  const match = time.match(/PT(\d+)M/);
  if (!match) return 0;

  return +match[1];
}

function getTimesFromRecipeData(recipeData: any) {
  const prepTime = getTimeFromString(recipeData.prepTime);
  const cookTime = getTimeFromString(recipeData.cookTime);
  const totalTime = getTimeFromString(recipeData.totalTime);

  if (prepTime || cookTime) {
    return { prepTime, cookTime };
  } else if (totalTime) {
    return {
      prepTime: totalTime / 3, // 1/3
      cookTime: (totalTime / 3) * 2, // 2/3
    };
  }

  return;
}

function setTimesToInstructions(recipeData: any, instructions: Instruction[]): Instruction[] {
  const times = getTimesFromRecipeData(recipeData);
  if (!times) return instructions;

  const instructionsCountWithNoTimeAndNotServing = instructions.reduce(
    (prev, curr) =>
      (prev = curr.minTime || curr.name.toLowerCase().includes("servieren") ? prev : prev + 1),
    0
  );

  if (instructionsCountWithNoTimeAndNotServing === 0) return instructions;

  const prepTimeCount =
    instructionsCountWithNoTimeAndNotServing / 3 >= 1
      ? Math.trunc(instructionsCountWithNoTimeAndNotServing / 3)
      : 1;
  const cookTimeCount = instructionsCountWithNoTimeAndNotServing - prepTimeCount;

  const prepTimePerInstruction = roundToNearestNumber(times.prepTime / prepTimeCount, 5);
  const cookTimePerInstruction = roundToNearestNumber(times.cookTime / cookTimeCount, 5);

  const prepTimes: number[] = new Array(prepTimeCount).fill(prepTimePerInstruction);
  const cookTimes: number[] = new Array(cookTimeCount).fill(cookTimePerInstruction);

  const timeList = [...prepTimes, ...cookTimes];

  return instructions.map((instruction) => {
    if (instruction.minTime) return instruction;

    const time = timeList.shift();
    instruction.minTime = time;
    return instruction;
  });
}

function getAmountTextAndNumber(recipeData: any): {
  amountText?: string;
  amountNumber?: number;
  defaultPortion?: number;
} {
  let { amountText, defaultPortion } = findCategoryInTitle(recipeData.name) ?? {};

  if (!recipeData.recipeYield) return { amountText };

  if (typeof recipeData.recipeYield === "number") {
    return { amountNumber: recipeData.recipeYield, amountText, defaultPortion };
  }

  if (typeof recipeData.recipeYield === "string") {
    const amount = recipeData.recipeYield.split(" ");
    return {
      amountNumber: +amount[0],
      amountText:
        amount.length && !amount.includes("Portion") && !amount.includes("Stück")
          ? amount[1]
          : amountText,
      defaultPortion,
    };
  }

  if (!Array.isArray(recipeData.recipeYield)) return {};

  if (recipeData.recipeYield.length !== 2) return {};

  const amountTextTmp = recipeData.recipeYield[1]?.split(" ").slice(1).join(" ");
  const amountNumber = +recipeData.recipeYield[1]?.split(" ")[0];

  // Portionentext
  if (!amountTextTmp.includes("Portion") && !amountTextTmp.includes("Stück")) {
    amountText = amountTextTmp;
  }

  return { amountText, amountNumber, defaultPortion };
}

function getCuisines(recipeData: any) {
  if (!recipeData.recipeCuisine) return [];

  const cuisines =
    typeof recipeData.recipeCuisine === "string"
      ? ([recipeData.recipeCuisine] as string[])
      : (recipeData.recipeCuisine as string[]);

  return cuisines
    .map((cuisine) => cuisine.replaceAll("deutsche Rezepte", "Deutsch"))
    .map((cuisine) => firstCharToTitleCase(cuisine));
}

function getVideoUrls(recipeData: any): Url[] {
  if (!recipeData.video) return [];

  if (!recipeData.contentUrl) return [];

  return [new Url({ url: recipeData.contentUrl, note: "Video" })];
}

function getNutritionDetails(recipeData: any): Nutrition[] {
  if (!recipeData.nutrition) return [];

  const nutrition = new Nutrition({
    servingSize: recipeData.nutrition.servingSize,

    calories:
      typeof recipeData.nutrition.calories === "number"
        ? recipeData.nutrition.calories
        : parseFloat(recipeData.nutrition.calories?.split(" ")[0]),

    fat:
      typeof recipeData.nutrition.fatContent === "number"
        ? recipeData.nutrition.fatContent
        : parseFloat(recipeData.nutrition.fatContent?.split(" ")[0]),
    saturatedFat:
      typeof recipeData.nutrition.saturatedFatContent === "number"
        ? recipeData.nutrition.saturatedFatContent
        : parseFloat(recipeData.nutrition.saturatedFatContent?.split(" ")[0]),

    carbohydrate:
      typeof recipeData.nutrition.carbohydrateContent === "number"
        ? recipeData.nutrition.carbohydrateContent
        : parseFloat(recipeData.nutrition.carbohydrateContent?.split(" ")[0]),
    fiber:
      typeof recipeData.nutrition.fiberContent === "number"
        ? recipeData.nutrition.fiberContent
        : parseFloat(recipeData.nutrition.fiberContent?.split(" ")[0]),
    sugar:
      typeof recipeData.nutrition.sugarContent === "number"
        ? recipeData.nutrition.sugarContent
        : parseFloat(recipeData.nutrition.sugarContent?.split(" ")[0]),

    protein:
      typeof recipeData.nutrition.proteinContent === "number"
        ? recipeData.nutrition.proteinContent
        : parseFloat(recipeData.nutrition.proteinContent?.split(" ")[0]),

    sodium:
      typeof recipeData.nutrition.sodiumContent === "number"
        ? recipeData.nutrition.sodiumContent
        : parseFloat(recipeData.nutrition.sodiumContent?.split(" ")[0]),
    potassium:
      typeof recipeData.nutrition.potassiumContent === "number"
        ? recipeData.nutrition.potassiumContent
        : parseFloat(recipeData.nutrition.potassiumContent?.split(" ")[0]),
    calcium:
      typeof recipeData.nutrition.calciumContent === "number"
        ? recipeData.nutrition.calciumContent
        : parseFloat(recipeData.nutrition.calciumContent?.split(" ")[0]),
    iron:
      typeof recipeData.nutrition.ironContent === "number"
        ? recipeData.nutrition.ironContent
        : parseFloat(recipeData.nutrition.ironContent?.split(" ")[0]),

    cholesterol:
      typeof recipeData.nutrition.cholesterolContent === "number"
        ? recipeData.nutrition.cholesterolContent
        : parseFloat(recipeData.nutrition.cholesterolContent?.split(" ")[0]),
  });

  return [nutrition];
}

/**
 * @deprecated
 */
function getPersonDetails(jsonContent: any): Url[] {
  if (!jsonContent["@graph"]) return [];

  const personData = (jsonContent["@graph"] as any[]).find((json) => json["@type"] === "Person");
  if (!personData) return [];

  const url = personData.url ?? personData["@id"] ?? undefined;
  if (!url) return [];

  // Name als Notiz
  const note = personData.name ?? undefined;

  const personUrl = new Url({ url, note });
  const personUrls = personData.sameAs
    ? (personData.sameAs as string[]).map((url) => new Url({ url, note }))
    : [];

  personUrls.unshift(personUrl);

  return personUrls;
}

function getInstructions(instructions: any): Instruction[] {
  if (!Array.isArray(instructions)) return [];

  if (isListOfStrings(instructions)) {
    return Instruction.getInstructionsWithDetailsAndTitleOfStringList(instructions);
  }

  const result: Instruction[] = [];
  let currentSectionName: string | undefined = undefined;

  instructions.forEach((instruction: HowToStep | HowToSection) => {
    if (instruction["@type"] === "HowToStep") {
      const { text, name } = instruction as HowToStep;
      const finalName = name !== text && name ? name : currentSectionName;
      result.push(new Instruction({ text, name: finalName }));
    } else if (instruction["@type"] === "HowToSection") {
      const { name: sectionName, itemListElement } = instruction as HowToSection;
      currentSectionName = sectionName.includes("*") ? undefined : sectionName;

      itemListElement.forEach((step) => {
        const { text, name } = step;
        const finalName = name !== text && name ? name : currentSectionName;
        result.push(new Instruction({ text, name: finalName }));
      });
    }
  });

  return result.map((instruction) => {
    instruction.name = instruction.name
      .replaceAll(/für d.. ?/gi, "")
      .replaceAll(/: ?$/gi, "")
      .replaceAll("Zum Schluss", "Servieren");
    return instruction;
  });
}

function getJsonContentFromScriptTag(data: string, first: boolean = false) {
  const $ = cheerio.load(data);
  const script = first
    ? $('script[type="application/ld+json"]').first()
    : $('script[type="application/ld+json"]').last();

  if (!script || script.length <= 0) {
    return;
  }

  return JSON.parse((script.html() || "").replaceAll("\n", " "));
}

function getCategory(recipeData: any, keywords: string[]) {
  if (!recipeData.recipeCategory) return findCategoryInTitle(recipeData.name)?.category;

  const categories =
    typeof recipeData.recipeCategory === "string"
      ? ([recipeData.recipeCategory] as string[])
      : (recipeData.recipeCategory as string[]);

  const categoriesFiltered = categories
    .map((category) => findCategoryByText(category)?.type)
    .filter((category): category is CategoryType => !!category);

  const categoryFromTitle = findCategoryInTitle(recipeData.name)?.category;
  if (categoryFromTitle) {
    categoriesFiltered.push(categoryFromTitle);
  }

  const categoriesFromKeywords = keywords
    .map((keyword) => findCategoryByText(keyword)?.type)
    .filter((category): category is CategoryType => !!category);

  const category =
    findMostFrequentNumber([...categoriesFiltered, ...categoriesFromKeywords]) ??
    findCategoryInTitle(recipeData.name)?.category ??
    undefined;

  return category;
}

function getImages(recipeData: any): string[] {
  const image = recipeData.image;

  if (!image) return [];

  if (typeof image === "object" && !Array.isArray(image)) {
    return [image.url];
  } else if (typeof image === "string") {
    return [image];
  } else if (isListOfStrings(image)) {
    return [image[0]];
  } else if (isListOfObjects(image)) {
    return [image[0].url];
  }

  return [];
}

function getDataOfGraphData(graphData: any) {
  if (Array.isArray(graphData)) {
    const list = graphData.filter((json) => !!json);
    const index = list.findIndex((json) => json["@type"] === "Recipe");
    if (index !== -1) return list[index];

    return list[0];
  }

  return graphData;
}

export function getRecipe(
  data: string,
  url: string,
  utensilObjects: UtensilObject[],
  first: boolean = false
): Recipe | undefined {
  if (url.includes("zuckerjagdwurst")) {
    // return extractRecipeInfoFromZuckerJagdwurst(data);
  }

  const jsonContent = getJsonContentFromScriptTag(data, first);

  if (!jsonContent) return first ? undefined : getRecipe(data, url, utensilObjects, true);

  console.log("Rezept", { jsonContent });

  const graphData =
    (jsonContent["@graph"] as any[])?.find((json) => json["@type"] === "Recipe") ?? jsonContent;

  console.log("Rezept", { graphData });

  if (!graphData) {
    console.error("Nicht den Rezepte-Eintrag in der Liste gefunden!");
    return first ? undefined : getRecipe(data, url, utensilObjects, true);
  }

  let recipeData = getDataOfGraphData(graphData);

  console.log("Rezept", { recipeData });

  if (!recipeData.recipeIngredient)
    return first ? undefined : getRecipe(data, url, utensilObjects, true);
  if (!Array.isArray(recipeData.recipeIngredient))
    return first ? undefined : getRecipe(data, url, utensilObjects, true);

  const ingredients = (recipeData.recipeIngredient as string[])
    // ---> Für SlowlyVeggie
    // Kein ")" am Ende, mit nächster Zeile zusammenfügen
    .map((text, index, data) =>
      text.includes("(") && !text.includes(")") ? text + " " + (data[index + 1] || "") : text
    )
    // Entfernen: "Hafermilch)" -> Da ein Fehler, gehört eigentlich zur vorherigen Zutat
    .filter((text) => !(text.includes(")") && !text.includes("(")))
    // ---> Für SlowlyVeggie
    .map((ingredient) => Ingredient.parse(ingredient))
    .filter((ingredient): ingredient is Ingredient => !!ingredient);

  const interpretedIntructions = Array.isArray(recipeData.recipeInstructions)
    ? getInstructions(recipeData.recipeInstructions)
    : typeof recipeData.recipeInstructions === "string"
    ? Instruction.getInstructionsWithDetailsAndTitleOfMultilineText(recipeData.recipeInstructions)
    : recipeData.recipeInstructions.text
    ? Instruction.getInstructionsWithDetailsAndTitleOfMultilineText(
        recipeData.recipeInstructions.text
      )
    : [];

  const instructionsList = Instruction.filterInstructions(interpretedIntructions);

  // Zubereitungstitel setzen, falls keine gesetzt wurden
  const instructionsWithoutDetails = Instruction.setTitleOfEachInstructionInList(instructionsList);

  // Zubereitungsschritte mit Zubereitungsdetails füllen
  const instructionsWithDetails = instructionsWithoutDetails
    .map((instruction) => Instruction.setDetailsToInstruction(instruction))
    .filter((instruction): instruction is Instruction => !!instruction);

  const instructionsWithReplacedIngredients =
    Instruction.changeIngredientNamesInInstructionTexts(instructionsWithDetails);

  // Zutaten den Zubereitungsschritten hinzufügen
  const instructionsWithDetailsAndTitles = Ingredient.addIngredientsToInstructions(
    cloneDeep(ingredients),
    instructionsWithReplacedIngredients
  );

  let portions = undefined;
  let { amountText, amountNumber, defaultPortion } = getAmountTextAndNumber(recipeData);
  if (amountNumber) {
    portions = amountNumber;
    // z.B.: "1 Brot, 10 Portionen"
    if (defaultPortion) {
      amountNumber = defaultPortion;
    }
  }

  const name = trimRecipeTitle(recipeData.name);
  const images = getImages(recipeData);

  const tags = Array.isArray(recipeData.keywords)
    ? (recipeData.keywords as string[]).map((keyword) => keyword?.trim())
    : typeof recipeData.keywords === "string"
    ? (recipeData.keywords as string)
        ?.split(",")
        .map((keyword) => keyword?.trim())
        .filter((keyword) => !!keyword)
        .filter(
          (keyword) =>
            !(name.toLowerCase() === keyword.toLowerCase()) &&
            !ingredients.some((ingredient) =>
              compareText(ingredient.name, keyword, [], Ingredient.SEPARATORS)
            )
        )
    : [];

  const category = getCategory(recipeData, tags);

  const urls = [new Url({ url }), ...getVideoUrls(recipeData)];

  const nutritionDetails = getNutritionDetails(recipeData);

  const cuisines = getCuisines(recipeData);

  const instructions = setTimesToInstructions(recipeData, instructionsWithDetailsAndTitles);

  const recipe = new Recipe({
    name,
    instructions,
    amountNumber,
    amountText,
    portions,
    images,
    category,
    tags,
    urls,
    nutritionDetails,
    cuisines,
  });

  // Utensilien finden
  recipe.instructions = Utensil.findUtensilsAndAddToInstructions(
    recipe.instructions,
    utensilObjects
  );

  return recipe;
}
