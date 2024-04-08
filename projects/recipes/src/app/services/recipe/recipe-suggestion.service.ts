import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { CarouselSymbol } from "shared/data/carousel-symbols.data";
import { Action } from "shared/models/action.type";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { findLandscapeImage } from "shared/utils/image";
import { getRandomElementsFromList } from "shared/utils/list";
import { CarouselItem } from "../../components/carousel/carousel.component";
import { PreparationHistoryType } from "../../models/enum/preparation-history.enum";
import { Recipe } from "../../models/recipe.class";
import { SearchQuickNavigateService } from "../../pages/search/search.quick-navigate.service";
import { RecipeApiService } from "./recipe.api.service";
import { RecipeDialogsService } from "./recipe.dialogs.service";

@Injectable({
  providedIn: "root",
})
export class RecipeSuggestionService {
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  constructor(
    private recipeApiService: RecipeApiService,
    private recipeDialogsService: RecipeDialogsService,
    private SearchQuickNavigateService: SearchQuickNavigateService
  ) {}

  recipeSuggestionsForCarousel$ = this.recipeApiService.recipes$.pipe(
    map((recipes) => {
      const items: CarouselItem[] = [];
      const totalSuggestionsCount = 5;
      const minRandomCount = 2;
      const maxRandomCount = 3;
      const minExploreCount = 2;

      this.findRecipesWithPortionsLeft(recipes, items);
      this.findPlannedRecipes(recipes, items);
      this.findSuggestionRecipe(recipes, items, minExploreCount, totalSuggestionsCount);
      this.findRandomRecipesWithCount(
        recipes,
        items,
        minRandomCount,
        maxRandomCount,
        totalSuggestionsCount
      );

      items.map(async (item) => {
        if (item.recipe && item.recipe.images.length !== 0) {
          const landscapeImage = await findLandscapeImage(item.recipe.images);
          item.noVerticalImageAnimation = !!landscapeImage;
          // ! Überschreibt alle Bilder, die potenziell unten gesetzt werden
          item.image = landscapeImage ?? item.recipe.images[0];
        }

        return item;
      });

      return items.sort((a, b) => b.sortIndex - a.sortIndex);
    })
  );

  private markAsPrepared(recipe: Recipe) {
    const lastPreparation = [...recipe.preparationHistory]
      .sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      })
      .filter((preparation) => preparation.type === PreparationHistoryType.PLANNED)
      // Erster Eintrag
      .shift();

    if (!lastPreparation) return;
    lastPreparation.type = PreparationHistoryType.PREPARED;

    this.recipeApiService.saveAndReloadRecipe(recipe);
  }

  private lastPlannedAddDaysToDate(recipe: Recipe, days: number) {
    const lastPreparation = [...recipe.preparationHistory]
      .sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      })
      .filter((preparation) => preparation.type === PreparationHistoryType.PLANNED)
      // Erster Eintrag
      .shift();

    if (!lastPreparation) return;
    lastPreparation.date = DateFns.addDaysToDate(lastPreparation.date, days);

    this.recipeApiService.saveAndReloadRecipe(recipe);
  }

  private lastPortionsLeftOneLess(recipe: Recipe) {
    Recipe.onePortionLessLeft(recipe);

    this.recipeApiService.saveAndReloadRecipe(recipe);
  }

  private lastPortionsLeftNone(recipe: Recipe) {
    if (recipe.lastPreparation && recipe.lastPreparation.portionsAvailable) {
      recipe.lastPreparation.portionsAvailable = 0;
    }

    this.recipeApiService.saveAndReloadRecipe(recipe);
  }

  /**
   * Zufällige Rezepte finden
   * @param count Anzahl an neuen zufälligen Rezepten
   */
  private findRandomRecipesWithCount(
    recipes: Recipe[],
    suggestions: CarouselItem[],
    minCount: number,
    maxCount: number,
    totalSuggestionsCount: number
  ) {
    const possibleSuggestions = recipes.filter(
      (recipe) =>
        !suggestions.some((suggestion) => suggestion.id === recipe.id) && recipe.favorite === false
    );

    const newSuggestions = [...possibleSuggestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(Math.min(totalSuggestionsCount - suggestions.length, maxCount), minCount));

    suggestions.push(...newSuggestions.map((m) => this.getRandomRecipeAsCarouselItemByRecipe(m)));
  }

  /**
   * Rezeptvorschläge finden
   * @param count Maximale Anzahl an neuen Rezeptvorschlägen
   */
  private findSuggestionRecipe(
    recipes: Recipe[],
    suggestions: CarouselItem[],
    minCount: number,
    totalSuggestionsCount: number
  ) {
    const possibleSuggestions = recipes.filter(
      (recipe) =>
        // Maximal 1 Mal zubereitet
        recipe.preparationHistory.length <= 1 &&
        // Nicht in letzter Woche geändert oder erstellt
        !(recipe.lastEditedDate > DateFns.addDaysToDate(new Date(), -7)) &&
        // Existiert noch nicht bei den Vorschlägen
        !suggestions.some((suggestion) => suggestion.id === recipe.id)
    );

    const newSuggestions = getRandomElementsFromList(
      possibleSuggestions,
      Math.max(totalSuggestionsCount - suggestions.length, minCount)
    );

    suggestions.push(
      ...newSuggestions.map((m) => this.getSuggestionRecipeAsCarouselItemByRecipe(m))
    );
  }

  private findRecipesWithPortionsLeft(recipes: Recipe[], suggestions: CarouselItem[]) {
    recipes.forEach((recipe) => {
      if (
        recipe.lastPreparation &&
        recipe.lastPreparation.portionsAvailable &&
        recipe.lastPreparation.portionsAvailable > 0
      ) {
        suggestions.push(
          this.getRecipesWithPortionsLeftAsCarouselItemByRecipe(
            recipe,
            recipe.lastPreparation.portionsAvailable
          )
        );
      }
    });
  }

  /**
   * Finde geplante Rezepte
   */
  private findPlannedRecipes(recipes: Recipe[], suggestions: CarouselItem[]) {
    recipes.forEach((recipe) => {
      if (
        (recipe.isPannedToday || recipe.isPlannedTomorrow) &&
        // Existiert noch nicht bei den Vorschlägen
        !suggestions.some((suggestion) => suggestion.id === recipe.id)
      ) {
        suggestions.push(this.getPlannedRecipeAsCarouselItemByRecipe(recipe));
      }
    });
  }

  /**
   * Zufälliges Rezepte-Karousel-Item
   */
  private getRandomRecipeAsCarouselItemByRecipe(recipe: Recipe): CarouselItem {
    const data: CarouselItem = {
      id: recipe.id,
      title: recipe.name,
      text: "SUGGESTION.RANDOM",
      symbol: CarouselSymbol.CROSS,
      icon: "random",
      buttons: [{ id: "", text: "HISTORY.PLAN", icon: "preparationHistory-planned" }],
      recipe,
      sortIndex: 1,
      func: () => {
        this.recipeDialogsService.openAddToShoppingListAndAddPreparationHistoryDialog(recipe);
      },
    };

    return data;
  }

  /**
   * Vorschlag Rezepte-Karousel-Item
   */
  private getSuggestionRecipeAsCarouselItemByRecipe(recipe: Recipe): CarouselItem {
    const data: CarouselItem = {
      id: recipe.id,
      title: recipe.name,
      text: "SUGGESTION.",
      icon: "idea",
      buttons: [{ id: "", text: "HISTORY.PLAN", icon: "preparationHistory-planned" }],
      recipe: recipe,
      sortIndex: 5,
      func: () => {
        this.recipeDialogsService.openAddToShoppingListAndAddPreparationHistoryDialog(recipe);
      },
    };

    return data;
  }

  /**
   * Rezepte-Karousel-Item mit übrigen Portionen
   */
  private getRecipesWithPortionsLeftAsCarouselItemByRecipe(
    recipe: Recipe,
    portionsLeft: number
  ): CarouselItem {
    const buttons: Action[] =
      portionsLeft > 1
        ? [
            {
              id: "none-portion-left",
              text: "PORTION.LEFT.NO_MORE",
              icon: "preparationHistory-prepared-all",
              onlyIcon: true,
            },
            {
              id: "one-portion-less-left",
              text: "PORTION.LEFT.ONE_LESS",
              icon: "preparationHistory-prepared",
            },
          ]
        : [
            {
              id: "none-portion-left",
              text: "PORTION.LEFT.NO_MORE",
              icon: "preparationHistory-prepared-all",
            },
          ];

    const data: CarouselItem = {
      id: recipe.id,
      symbol: CarouselSymbol.STAR,
      title: recipe.name,
      text: "PORTION.LEFT.VALUE",
      textReplace: portionsLeft.toString(),
      icon: "portion-eat",
      buttons,
      recipe,
      sortIndex: 10,
      func: (id: string) => {
        if (id === "one-portion-less-left") this.lastPortionsLeftOneLess(recipe);
        if (id === "none-portion-left") this.lastPortionsLeftNone(recipe);
      },
      funcOpenSearch: () => {
        this.SearchQuickNavigateService.openSearchWithFilterRecipePortionsLeft();
      },
    };
    return data;
  }

  /**
   * Geplante Rezepte-Karousel-Item
   */
  private getPlannedRecipeAsCarouselItemByRecipe(recipe: Recipe): CarouselItem {
    const buttons: Action[] = [
      {
        id: "prepared-today",
        text: "HISTORY.PREPARED_TODAY",
        icon: "preparationHistory-prepared",
        onlyIcon: this.isMobileScreen.matches,
      },
      {
        id: "reschedule",
        text: "HISTORY.RESCHEDULE_RECIPE",
        icon: "calendar-future",
      },
    ];

    if (recipe.isPannedToday) {
      buttons.splice(1, 0, {
        id: "plan-for-tomorrow",
        text: "HISTORY.PLAN_RECIPE_TOMORROW",
        icon: "calendar-tomorrow",
        onlyIcon: true,
      });
    }

    const data: CarouselItem = {
      id: recipe.id,
      symbol: CarouselSymbol.STAR,
      title: recipe.name,
      text: "HISTORY." + (recipe.isPannedToday ? "PLANNED_TODAY" : "PLANNED_TOMORROW"),
      icon: "calendar" + (recipe.isPannedToday ? "-today" : "-tomorrow"),
      buttons,
      recipe,
      sortIndex: 10,
      func: (id: string) => {
        if (id === "prepared-today") this.recipeDialogsService.openPreparedTodayDialog(recipe);
        if (id === "plan-for-tomorrow") this.lastPlannedAddDaysToDate(recipe, 1);
        if (id === "reschedule") {
          this.recipeDialogsService.openRescheduleDialog(recipe).subscribe((result) => {
            if (result) this.recipeApiService.saveAndReloadRecipe(result);
          });
        }
      },
      funcOpenSearch: () => {
        this.SearchQuickNavigateService.openSearchWithFilterRecipePlanned(
          recipe.isPannedToday ? "today" : "tomorrow"
        );
      },
    };
    return data;
  }
}
