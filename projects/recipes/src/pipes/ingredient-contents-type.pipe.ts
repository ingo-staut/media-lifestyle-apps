import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CONTENTS } from "../app/data/ingredient-contents.data";
import { IngredientConversionContentType } from "../app/models/enum/ingredient-conversion-content.enum";
import { IngredientConversion } from "../app/models/ingredient-conversion.class";
import { Ingredient } from "../app/models/ingredient.class";
import { Recipe } from "../app/models/recipe.class";

@Pipe({
  name: "mostlyContentsTypeInRecipe",
})
export class MostlyContentsTypeInRecipePipe implements PipeTransform {
  transform(recipe: Recipe, ingredientsConversion?: IngredientConversion[] | null) {
    return recipe.getMostlyContentsTypeObject(ingredientsConversion ?? [], true);
  }
}

@Pipe({
  name: "mostlyContentsTypeInIngredient",
})
export class MostlyContentsTypeInIngredientPipe implements PipeTransform {
  transform(
    ingredient: Ingredient | string,
    ingredientsConversion?: IngredientConversion[] | null
  ) {
    return Ingredient.getIngredient(ingredient).getMostlyContentsTypeObject(
      ingredientsConversion ?? []
    );
  }
}

@Pipe({
  name: "contentsTypeTooltipInIngredient",
})
export class ContentsTypeTooltipInIngredientPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(contents: IngredientConversionContentType[]) {
    return contents.reduce((prev, curr, index) => {
      return (prev +=
        this.translateService.instant(CONTENTS.get(curr)?.name ?? "") +
        (index === contents.length - 1 ? "" : ", "));
    }, "");
  }
}

@Pipe({
  name: "ingredientIsVegan",
})
export class IngredientIsVeganPipe implements PipeTransform {
  transform(
    ingredient: Ingredient | string,
    ingredientsConversion?: IngredientConversion[] | null
  ) {
    return Ingredient.getIngredient(ingredient).isVegan(ingredientsConversion ?? [])
      ? CONTENTS.get(IngredientConversionContentType.ALCOHOL)
      : null;
  }
}

@Pipe({
  name: "veganPercentage",
})
export class VeganPercentagePipe implements PipeTransform {
  transform(
    recipe: Recipe,
    ingredientsConversion?: IngredientConversion[] | null,
    getTrueIfNoType: boolean = false,
    ...onlyForTrigger: any[]
  ) {
    return recipe.veganPercentage(ingredientsConversion ?? [], getTrueIfNoType);
  }
}

@Pipe({
  name: "isVegan",
})
export class IsVeganPipe implements PipeTransform {
  transform(
    recipe: Recipe,
    ingredientsConversion?: IngredientConversion[] | null,
    getTrueIfNoType: boolean = false,
    ...onlyForTrigger: any[]
  ) {
    return recipe.getIsVegan(ingredientsConversion ?? [], getTrueIfNoType)
      ? CONTENTS.get(IngredientConversionContentType.VEGAN)
      : CONTENTS.get(IngredientConversionContentType.VEGAN_NOT);
  }
}

@Pipe({
  name: "isVegetarian",
})
export class IsVegetarianPipe implements PipeTransform {
  transform(
    recipe: Recipe,
    ingredientsConversion?: IngredientConversion[] | null,
    getTrueIfNoType: boolean = false,
    ...onlyForTrigger: any[]
  ) {
    return recipe.getIsVegetarian(ingredientsConversion ?? [], getTrueIfNoType)
      ? CONTENTS.get(IngredientConversionContentType.VEGETARIAN)
      : CONTENTS.get(IngredientConversionContentType.VEGETARIAN_NOT);
  }
}

@Pipe({
  name: "containsAlcohol",
})
export class ContainsAlcoholPipe implements PipeTransform {
  transform(recipe: Recipe, ingredientsConversion?: IngredientConversion[] | null) {
    return recipe.containsAlcohol(ingredientsConversion ?? [])
      ? CONTENTS.get(IngredientConversionContentType.ALCOHOL)
      : null;
  }
}

@Pipe({
  name: "containsSugarOrNoSugar",
})
export class ContainsSugarOrNoSugarPipe implements PipeTransform {
  transform(recipe: Recipe, ingredientsConversion?: IngredientConversion[] | null) {
    let contentsType = recipe.containsSugarIfNotDessertAndNoSugarIfDessert(
      ingredientsConversion ?? []
    );
    if (contentsType) {
      return {
        ...contentsType,
        name: contentsType.name + (contentsType.not ? "_NOT" : ""),
        icon: contentsType.icon + (contentsType.not ? "-not" : ""),
      };
    }
    return null;
  }
}
