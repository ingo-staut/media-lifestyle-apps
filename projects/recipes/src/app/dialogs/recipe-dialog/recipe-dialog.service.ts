import { Location } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { take, tap } from "rxjs";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_NORMAL_SCREEN_MAX,
  MEDIA_QUERY_NORMAL_SCREEN_PX,
} from "shared/styles/data/media-queries";
import { routes } from "../../app-routing.module";
import { Recipe } from "../../models/recipe.class";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { OptionalsType, RecipeDialogComponent } from "./recipe-dialog.component";

@Injectable({
  providedIn: "root",
})
export class RecipeDialogService {
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isNormalScreen = MEDIA_QUERY_NORMAL_SCREEN_MAX;
  routes = routes;

  constructor(
    @Inject(Router) private router: Router,
    @Inject(ActivatedRoute) private activeRoute: ActivatedRoute,
    private dialog: MatDialog,
    private titleService: Title,
    private location: Location,
    private recipeApiService: RecipeApiService,
    private translateService: TranslateService
  ) {}

  open(recipe: Recipe, optionals?: OptionalsType) {
    const dialogRef = this.dialog.open<
      RecipeDialogComponent,
      { recipe: Recipe } & { stepsView: boolean } & OptionalsType,
      Recipe
    >(RecipeDialogComponent, {
      // Breite und Höhe von Rezepte-Dialog ändern: RECIPE_DIALOG_SIZE
      height: this.isNormalScreen.matches ? "100dvh" : "80vh",
      width: this.isNormalScreen.matches ? "100vw" : "80vw",
      maxWidth: `${MEDIA_QUERY_NORMAL_SCREEN_PX}px`,
      data: {
        recipe: cloneDeep(recipe),
        stepsView: this.activeRoute.snapshot.queryParams["steps"] === "true",
        ...optionals,
      },
      closeOnNavigation: false,
    });

    const route = routes.find((route) => route.path === this.router.url.substring(1));
    const currentTitle = route ? this.translateService.instant(route.title as string) : "";

    this.titleService.setTitle(
      currentTitle +
        " – " +
        (recipe.name ? recipe.name : this.translateService.instant("RECIPE.NEW"))
    );

    return dialogRef.afterClosed().pipe(
      take(1),
      tap(() => {
        this.titleService.setTitle(currentTitle);

        // Wenn "id" bereits da war
        this.router.navigate([], {
          queryParams: {
            id: null,
          },
          queryParamsHandling: "",
        });

        // Wenn "id" generiert wurde
        const url = this.router
          .createUrlTree([], {
            queryParams: {
              id: null,
            },
          })
          .toString();
        this.location.replaceState(url);
      })
    );
  }

  openAndReloadData(recipe: Recipe, optionals?: OptionalsType) {
    this.open(recipe, optionals).subscribe((result) => {
      if (result) this.recipeApiService.saveAndReloadRecipe(result);
    });
  }

  openAndReloadDataById(id: string, optionals?: OptionalsType) {
    const recipe = this.recipeApiService.recipesSnapshot.find((recipe) => recipe.id === id);

    if (!recipe) throw new Error(`Recipe by id "${id}" not found`);

    this.open(recipe, optionals).subscribe((result) => {
      if (result) this.recipeApiService.saveAndReloadRecipe(result);
    });
  }

  openAndReloadDataAndAfterClose(recipe: Recipe) {
    return this.open(recipe).pipe(
      tap((result) => {
        if (result) this.recipeApiService.saveAndReloadRecipe(result);
      })
    );
  }
}
