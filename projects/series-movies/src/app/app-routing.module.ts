import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ExploreComponent } from "./pages/explore/explore.component";
import { ImportViaShareComponent } from "./pages/import-via-share/import-via-share.component";
import { NewsComponent } from "./pages/news/news.component";
import { SearchComponent } from "./pages/search/search.component";
import { StartComponent } from "./pages/start/start.component";
import { StatisticsComponent } from "./pages/statistics/statistics.component";
import { WatchComponent } from "./pages/watch/watch.component";

export const ROUTE_PREFIX_ROUTES_ARRAY = 1;

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/start",
    pathMatch: "full",
    title: "Media",
  },
  {
    path: "start",
    component: StartComponent,
    title: "Start",
  },
  {
    path: "watching",
    component: WatchComponent,
    title: "Anschauen",
  },
  {
    path: "explore",
    component: ExploreComponent,
    title: "Entdecken",
  },
  {
    path: "news",
    component: NewsComponent,
    title: "Nachrichten",
  },
  {
    path: "statistics",
    component: StatisticsComponent,
    title: "Statistiken",
  },
  {
    path: "search",
    component: SearchComponent,
    title: "Suche",
  },
  {
    path: "import-via-share",
    component: ImportViaShareComponent,
    title: "SETTINGS.IMPORT",
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
