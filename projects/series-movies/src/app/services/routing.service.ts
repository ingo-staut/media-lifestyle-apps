import { Inject, Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, QueryParamsHandling, Router } from "@angular/router";
import { EMPTY, take } from "rxjs";
import { SearchFilterService } from "../pages/search/search.filter.service";
import { MediaApiService } from "./media.api.service";

@Injectable({
  providedIn: "root",
})
export class RoutingService {
  private history: string[] = [];

  constructor(
    @Inject(Router) private router: Router,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    private mediaApiService: MediaApiService,
    private searchFilterService: SearchFilterService
  ) {
    // Baut eigene History auf
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  backToOneMainScreen() {
    this.searchFilterService.resetResultCount();

    this.history.pop();

    if (!this.history.length) this.router.navigateByUrl("/");

    const lastEntry = this.history
      .slice()
      .reverse()
      .find(
        (entry) => entry.includes("watching") || entry.includes("explore") || entry.includes("news")
      );

    if (!lastEntry) this.router.navigateByUrl("/");
    else if (lastEntry.includes("watching")) this.router.navigateByUrl("/watching");
    else if (lastEntry.includes("explore")) this.router.navigateByUrl("/explore");
    else if (lastEntry.includes("news")) this.router.navigateByUrl("/news");
    else this.router.navigateByUrl("/");
  }

  private getParamFromRoute(param: string): string {
    return this.activatedRoute.snapshot.queryParams[param];
  }

  navigateToUrl(url: string) {
    this.router.navigateByUrl(url);
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

  getCurrentRoute(): string {
    return this.router.url;
  }

  getCurrentUrl(): string {
    return window.location.href;
  }

  getMediaFromRoute() {
    if (this.getIdFromRoute())
      return this.mediaApiService.getMediaById(this.getIdFromRoute()).pipe(take(1));

    return EMPTY.pipe(take(1));
  }

  getMediaRoute(mediaId: string, queryParamsHandling: QueryParamsHandling = "") {
    var queryParams: { [k: string]: any } = {};
    if (mediaId) queryParams["id"] = mediaId;

    return this.router.createUrlTree([], { queryParams, queryParamsHandling }).toString();
  }
}
