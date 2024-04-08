import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DateFns } from "shared/utils/date-fns";
import { Recipe } from "../../models/recipe.class";
import { RecipeApiService } from "./recipe.api.service";

@Injectable({
  providedIn: "root",
})
export class RecipeService {
  readonly GO_BACK_MAX_DAYS = 20;

  constructor(private recipeApiService: RecipeApiService) {}

  lastEditedRecipes$ = this.recipeApiService.recipes$.pipe(
    map((recipes) => {
      for (var i = 0; i < this.GO_BACK_MAX_DAYS; i++) {
        const list = recipes
          .filter((recipe) =>
            DateFns.isSameDate(recipe.editHistory[0], DateFns.addDaysToDate(new Date(), -i))
          )
          .sort(Recipe.sortByEditHistoryDescending);

        if (list.length) {
          return list;
        }
      }

      return [];
    })
  );

  onShoppingListRecipes$ = this.recipeApiService.recipes$.pipe(
    map((recipes) => recipes.filter((recipe) => !!recipe.isOnShoppingList))
  );
}
