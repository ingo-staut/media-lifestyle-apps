import { Inject, Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, QueryParamsHandling, Router } from "@angular/router";
import { EMPTY, take } from "rxjs";
import { RecipeApiService } from "./recipe/recipe.api.service";

@Injectable({
  providedIn: "root",
})
export class RoutingService {
  private history: string[] = [];

  constructor(
    private recipeApiService: RecipeApiService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(Router) private router: Router
  ) {
    // Baut eigene History auf
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  backToOneMainScreen() {
    this.history.pop();

    if (!this.history.length) this.router.navigateByUrl("/");

    const lastEntry = this.history
      .slice()
      .reverse()
      .find(
        (entry) =>
          entry.includes("shopping-list") ||
          entry.includes("purchases") ||
          entry.includes("explore")
      );

    if (!lastEntry) this.router.navigateByUrl("/");
    else if (lastEntry.includes("shopping-list")) this.navigateToShoppingList();
    else if (lastEntry.includes("purchases")) this.router.navigateByUrl("/purchases");
    else if (lastEntry.includes("explore")) this.router.navigateByUrl("/explore");
    else this.router.navigateByUrl("/");
  }

  navigateToShoppingList() {
    this.router.navigateByUrl("/shopping-list");
  }

  navigateToUrl(url: string) {
    this.router.navigateByUrl(url);
  }

  private getParamFromRoute(param: string): string {
    return this.activatedRoute.snapshot.queryParams[param];
  }

  getCurrentRelativePath() {
    const urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    // urlTree.fragment = null; // optional
    return urlTree.toString().substring(1);
  }

  getIdFromRoute(): string {
    return this.getParamFromRoute("id");
  }

  getSettingsFromRoute(): boolean {
    return this.getParamFromRoute("settings") === "true";
  }

  getRecipeFromRoute() {
    if (this.getIdFromRoute())
      return this.recipeApiService.getRecipeById(this.getIdFromRoute()).pipe(take(1));

    return EMPTY.pipe(take(1));
  }

  getCurrentRoute(): string {
    return this.router.url;
  }

  getCurrentUrl(): string {
    return window.location.href;
  }

  getRecipeRoute(recipeId: string, steps: boolean, queryParamsHandling: QueryParamsHandling = "") {
    var queryParams: { [k: string]: any } = {};
    if (recipeId) queryParams["id"] = recipeId;
    if (steps) queryParams["steps"] = "true";
    else queryParams["steps"] = null;

    return this.router.createUrlTree([], { queryParams, queryParamsHandling }).toString();
  }
}
