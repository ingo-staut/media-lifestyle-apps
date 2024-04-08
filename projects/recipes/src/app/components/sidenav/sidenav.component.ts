import { Platform } from "@angular/cdk/platform";
import { Component, HostListener, Inject, ViewChild } from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { MatTabGroup } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { VersionService } from "shared/services/version.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { ROUTE_PREFIX_ROUTES_ARRAY, routes } from "../../app-routing.module";
import { SIDENAV_MENU } from "../../data/sidenav.menu.data";
import { SettingsDialogService } from "../../dialogs/settings-dialog/settings-dialog.service";
import { SettingsMenuKey } from "../../models/enum/settings-menu.enum";
import { SearchService } from "../../pages/search/search.service";
import { RecipeDialogsService } from "../../services/recipe/recipe.dialogs.service";
import { RoutingService } from "../../services/routing.service";

@Component({
  selector: "app-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
})
export class SidenavComponent {
  @ViewChild("sidenav") sidenav!: MatSidenav;
  @ViewChild("tabGroup") tabGroup!: MatTabGroup;

  SidenavMenu = SIDENAV_MENU;
  routes = routes;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  isMobileDevice = this.platform.ANDROID || this.platform.IOS;
  activeButton = "";
  selectedIndex = 0;

  constructor(
    @Inject(Router) private router: Router,
    private settingsDialogService: SettingsDialogService,
    private routingService: RoutingService,
    private platform: Platform,
    protected versionService: VersionService,
    private recipeDialogsService: RecipeDialogsService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.setActive(this.routingService.getCurrentRelativePath());
  }

  close() {
    this.sidenav.close();

    history.back();
  }

  open() {
    this.sidenav.open();

    history.pushState(null, document.title, location.href);
    window.addEventListener("popstate", () => {
      if (this.sidenav.opened) this.sidenav.close();
    });
  }

  setActive(buttonName: string) {
    this.activeButton = buttonName;
    this.sidenav?.close();
    this.selectedIndex =
      routes.findIndex((route) => route.path === buttonName) - ROUTE_PREFIX_ROUTES_ARRAY;
  }

  isActive(buttonName: string) {
    return this.activeButton === buttonName;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  onTabChange(event: any) {
    this.navigateTo("/" + routes[event.index + ROUTE_PREFIX_ROUTES_ARRAY].path);
    this.setActive("" + routes[event.index + ROUTE_PREFIX_ROUTES_ARRAY].path);
  }

  onOpenCreateDialog() {
    this.recipeDialogsService.openCreateDialog(
      this.searchService.searchValueSnapshot,
      this.selectedIndex
    );
  }

  onOpenCreateDialogByKey(key: string) {
    this.recipeDialogsService.openCreateDialogByKey(
      key,
      this.searchService.searchValueSnapshot,
      this.selectedIndex
    );
  }

  onSettings() {
    this.settingsDialogService.openAndReloadData();
  }

  onSettingsVersion() {
    this.settingsDialogService.openAndReloadData({ selectedSubmenu: SettingsMenuKey.ABOUT });
  }

  openMediaApp() {
    window.open("https://media-series-movies-shows.web.app/", "_blank");
  }

  @HostListener("window:keydown.control.k", ["$event"])
  shortcutOpenSearch(event: any) {
    event.stopPropagation();
    event.preventDefault();

    this.router.navigate(["/search"]);
  }
}
