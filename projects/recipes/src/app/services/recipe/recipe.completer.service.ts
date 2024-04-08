import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { combineLatest, map, startWith } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { findCategoryByType } from "../../models/enum/category.enum";
import { CompleterService } from "../completer.service";
import { RecipeApiService } from "./recipe.api.service";

@Injectable({
  providedIn: "root",
})
export class RecipeCompleterService {
  constructor(
    private recipeApiService: RecipeApiService,
    private translateService: TranslateService,
    private completerService: CompleterService
  ) {}

  completerListRecipes$ = this.recipeApiService.recipes$.pipe(
    map((recipes) =>
      recipes.map((recipe) => {
        const entry: CompleterEntry = {
          text: recipe.name,
          icons: [
            recipe.basic ? "recipe-basic" : "recipe",
            findCategoryByType(recipe.category).icon,
          ],
        };
        return entry;
      })
    )
  );

  completerListPreparationHistoryTypes$ = this.translateService.onLangChange.pipe(
    startWith(null),
    map(() => {
      const prepared: CompleterEntry = {
        text: this.translateService.instant("HISTORY.PREPARED") as string,
        icons: ["preparationHistory-prepared"],
      };
      const planned: CompleterEntry = {
        text: this.translateService.instant("HISTORY.PLANNED") as string,
        icons: ["preparationHistory-planned"],
      };
      const prepareUntil: CompleterEntry = {
        text: this.translateService.instant("HISTORY.PREPARE_UNTIL") as string,
        icons: ["preparationHistory-prepare-until"],
      };
      return [prepared, planned, prepareUntil];
    })
  );

  completerListPreparationHistory$ = combineLatest([
    this.completerListPreparationHistoryTypes$,
    this.completerService.completerListDates$,
  ]).pipe(
    map(([types, dates]) => {
      return [...types, ...dates];
    })
  );

  completerListTags$ = this.recipeApiService.recipes$.pipe(
    map((recipes) => {
      return recipes
        .flatMap((recipe) => recipe.tags)
        .map((tag) => {
          const entry: CompleterEntry = {
            text: tag,
            icons: ["tag"],
          };
          return entry;
        });
    })
  );
}
