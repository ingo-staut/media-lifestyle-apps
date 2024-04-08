import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { IngredientConversion } from "../app/models/ingredient-conversion.class";
import { Recipe } from "../app/models/recipe.class";
import { PricePipe } from "./price.pipe";

@Pipe({
  name: "recipeCosts",
})
export class RecipeCostsPipe implements PipeTransform {
  transform(recipe: Recipe, ingredientsConversion: IngredientConversion[]) {
    const costs = new Recipe(recipe).getRecipeCosts(ingredientsConversion);
    return costs.normal ? costs : null;
  }
}

@Pipe({
  name: "recipeCostsString",
})
export class RecipeCostsStringPipe implements PipeTransform {
  constructor(private pricePipe: PricePipe, private translateService: TranslateService) {}

  transform(costs: { normal: number; perPortion: number; max: number }, local: string) {
    return `${this.pricePipe.transform(costs.normal, local)} / ${this.pricePipe.transform(
      costs.perPortion,
      local
    )} ${this.translateService.instant("PORTION.PER_SHORT")} / ${this.pricePipe.transform(
      costs.max,
      local
    )} ${this.translateService.instant("MAX_SHORT")}`;
  }
}
