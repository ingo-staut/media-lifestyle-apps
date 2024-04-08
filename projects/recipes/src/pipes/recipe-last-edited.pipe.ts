import { Pipe, PipeTransform } from "@angular/core";
import { Recipe } from "../app/models/recipe.class";

@Pipe({
  name: "recipeLastEdited",
})
export class RecipeLastEditedPipe implements PipeTransform {
  transform(recipe: Recipe): boolean {
    return recipe.editHistory[0].getTime() > new Date().getTime() - 1000;
  }
}
