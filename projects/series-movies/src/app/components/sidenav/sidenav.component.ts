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
import { MediaDialogCreateService } from "../../services/dialogs/media.dialog.create.service";
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
    private platform: Platform,
    private routingService: RoutingService,
    private mediaDialogCreateService: MediaDialogCreateService,
    private settingsDialogService: SettingsDialogService,
    private searchService: SearchService,
    protected versionService: VersionService
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
    this.mediaDialogCreateService.open(this.searchService.searchValueSnapshot);
  }

  onOpenCreateDialogByKey(key: string) {
    this.mediaDialogCreateService.openCreateDialogByKey(
      key,
      this.searchService.searchValueSnapshot
    );
  }

  onSettings() {
    this.settingsDialogService.openAndReloadData();
  }

  onSettingsVersion() {
    this.settingsDialogService.openAndReloadData({ selectedSubmenu: SettingsMenuKey.ABOUT });
  }

  openRecipesApp() {
    window.open("https://recipes-purchases.web.app/recipes/", "_blank");
  }

  @HostListener("window:keydown.control.k", ["$event"])
  shortcutOpenSearch(event: any) {
    event.stopPropagation();
    event.preventDefault();

    this.router.navigate(["/search"]);
  }
}
