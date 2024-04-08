import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CanDeactivateGuard } from "./app-routing.guard";
import { ExploreComponent } from "./pages/explore/explore.component";
import { ImportViaShareComponent } from "./pages/import-via-share/import-via-share.component";
import { PurchasesComponent } from "./pages/purchases/purchases.component";
import { RecipesComponent } from "./pages/recipes/recipes.component";
import { SearchComponent } from "./pages/search/search.component";
import { ShoppingListComponent } from "./pages/shopping-list/shopping-list.component";
import { StatisticsComponent } from "./pages/statistics/statistics.component";

export const ROUTE_PREFIX_ROUTES_ARRAY = 1;

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/recipes",
    pathMatch: "full",
    title: "Ernährung",
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: "recipes",
    component: RecipesComponent,
    title: "Rezepte",
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: "explore",
    component: ExploreComponent,
    title: "Entdecken",
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: "purchases",
    component: PurchasesComponent,
    title: "Einkäufe",
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: "shopping-list",
    component: ShoppingListComponent,
    title: "Einkaufsliste",
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: "statistics",
    component: StatisticsComponent,
    title: "Statistiken",
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: "search",
    component: SearchComponent,
    title: "Suche",
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: "import-via-share",
    component: ImportViaShareComponent,
    title: "SETTINGS.IMPORT",
    canDeactivate: [CanDeactivateGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
