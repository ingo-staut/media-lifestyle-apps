import { AfterViewInit, Component, OnDestroy } from "@angular/core";
import { environment } from "projects/recipes/src/environments/environment";
import { Subject, combineLatest, map, takeUntil } from "rxjs";
import { GroupType } from "shared/models/enum/type-group.enum";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { Recipe } from "../../models/recipe.class";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { RoutingService } from "../../services/routing.service";

@Component({
  selector: "app-explore",
  templateUrl: "./explore.component.html",
  styleUrls: ["./explore.component.scss"],
})
export class ExploreComponent implements OnDestroy, AfterViewInit {
  private readonly destroySubject = new Subject<void>();

  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly COUNT_MORE = environment.production ? 5 : 1;
  readonly COUNT_INITIAL = environment.production ? (this.isSmallScreen.matches ? 5 : 10) : 1;

  veganDessertsCount: number = this.COUNT_INITIAL;
  veganDesserts$ = combineLatest([
    this.recipeApiService.recipes$,
    this.ingredientApiService.ingredientsConversion$,
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([recipes, ingredientConversions]) =>
      recipes
        .filter(
          (recipe) =>
            recipe.getIsVegan(ingredientConversions, true) &&
            recipe.categoryGroupType === GroupType.AFTER &&
            recipe.ingredientsCount &&
            !recipe.oncePlanned
        )
        .sort(Recipe.sortByRatingDescending)
    )
  );

  veganMainRecipesCount: number = this.COUNT_INITIAL;
  veganMainRecipes$ = combineLatest([
    this.recipeApiService.recipes$,
    this.ingredientApiService.ingredientsConversion$,
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([recipes, ingredientConversions]) =>
      recipes
        .filter(
          (recipe) =>
            recipe.getIsVegan(ingredientConversions, true) &&
            recipe.categoryGroupType === GroupType.MAIN &&
            recipe.ingredientsCount &&
            !recipe.oncePlanned
        )
        .sort(Recipe.sortByRatingDescending)
    )
  );

  quickDessertsCount: number = this.COUNT_INITIAL;
  quickDesserts$ = combineLatest([
    this.recipeApiService.recipes$,
    this.ingredientApiService.ingredientsConversion$,
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([recipes, ingredientConversions]) =>
      recipes
        .filter(
          (recipe) =>
            recipe.getIsVegan(ingredientConversions, true) &&
            recipe.categoryGroupType === GroupType.AFTER &&
            recipe.ingredientsCount &&
            recipe.totalPreparationDurationInMinutes <= 20 &&
            recipe.totalPreparationDurationInMinutes > 0 &&
            !recipe.oncePlanned
        )
        .sort(Recipe.sortByPreparationDurationAscending)
    )
  );

  quickRecipesCount: number = this.COUNT_INITIAL;
  quickRecipes$ = combineLatest([this.recipeApiService.recipes$]).pipe(
    takeUntil(this.destroySubject),
    map(([recipes]) =>
      recipes
        .filter(
          (recipe) =>
            (recipe.categoryGroupType === GroupType.MAIN ||
              recipe.categoryGroupType === GroupType.PRE) &&
            recipe.totalPreparationDurationInMinutes <= 20 &&
            recipe.totalPreparationDurationInMinutes > 0 &&
            !recipe.oncePlanned
        )
        .sort(Recipe.sortByPreparationDurationAscending)
    )
  );

  cheapDessertsCount: number = this.COUNT_INITIAL;
  cheapDesserts$ = combineLatest([
    this.recipeApiService.recipes$,
    this.ingredientApiService.ingredientsConversion$,
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([recipes, ingredientConversions]) =>
      recipes
        .filter(
          (recipe) =>
            recipe.categoryGroupType === GroupType.AFTER &&
            recipe.ingredientsCount &&
            recipe.getCosts(ingredientConversions).normal <= 3 &&
            recipe.getCosts(ingredientConversions).normal > 0 &&
            !recipe.oncePlanned
        )
        .sort(Recipe.sortByCostAscending)
    )
  );

  cheapRecipesCount: number = this.COUNT_INITIAL;
  cheapRecipes$ = combineLatest([
    this.recipeApiService.recipes$,
    this.ingredientApiService.ingredientsConversion$,
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([recipes, ingredientConversions]) =>
      recipes
        .filter(
          (recipe) =>
            (recipe.categoryGroupType === GroupType.MAIN ||
              recipe.categoryGroupType === GroupType.PRE) &&
            recipe.getCosts(ingredientConversions).normal <= 5 &&
            recipe.getCosts(ingredientConversions).normal > 0 &&
            !recipe.oncePlanned
        )
        .sort(Recipe.sortByCostAscending)
    )
  );

  constructor(
    private recipeApiService: RecipeApiService,
    private routingService: RoutingService,
    private recipeDialogService: RecipeDialogService,
    private ingredientApiService: IngredientApiService,
    protected localeService: LocaleService
  ) {}

  ngAfterViewInit(): void {
    this.routingService.getRecipeFromRoute().subscribe((recipe) => {
      this.recipeDialogService.openAndReloadData(recipe);
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onLoadMoreVeganDesserts() {
    this.veganDessertsCount += this.COUNT_MORE;
  }

  onLoadMoreVeganMainRecipes() {
    this.veganMainRecipesCount += this.COUNT_MORE;
  }

  onLoadMoreQuickRecipes() {
    this.quickRecipesCount += this.COUNT_MORE;
  }

  onLoadMoreQuickDesserts() {
    this.quickDessertsCount += this.COUNT_MORE;
  }

  onLoadMoreCheapRecipes() {
    this.cheapRecipesCount += this.COUNT_MORE;
  }

  onLoadMoreCheapDesserts() {
    this.cheapDessertsCount += this.COUNT_MORE;
  }
}
