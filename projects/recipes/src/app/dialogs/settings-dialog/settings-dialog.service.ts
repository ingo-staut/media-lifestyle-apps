import { Location } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { take, tap } from "rxjs";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_MOBILE_SCREEN_PX,
} from "shared/styles/data/media-queries";
import { routes } from "../../app-routing.module";
import { SettingsMenuKey } from "../../models/enum/settings-menu.enum";
import { SettingsApiService } from "../../services/settings/settings.api.service";
import { SettingsDialogComponent } from "./settings-dialog.component";

export type SettingsDialogData = {
  selectedSubmenu?: SettingsMenuKey;
};

@Injectable({
  providedIn: "root",
})
export class SettingsDialogService {
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  routes = routes;

  constructor(
    @Inject(Router) private router: Router,
    @Inject(ActivatedRoute) private activeRoute: ActivatedRoute,
    private dialog: MatDialog,
    private titleService: Title,
    private location: Location,
    private settingsApiService: SettingsApiService,
    private translateService: TranslateService
  ) {}

  open(data?: SettingsDialogData) {
    const dialogRef = this.dialog.open<SettingsDialogComponent, SettingsDialogData>(
      SettingsDialogComponent,
      {
        height: this.isMobileScreen.matches ? "100dvh" : "80vh",
        width: this.isMobileScreen.matches ? "100vw" : "80vw",
        maxWidth: `${MEDIA_QUERY_MOBILE_SCREEN_PX}px`,
        data: data ?? {
          selectedSubmenu: this.activeRoute.snapshot.queryParams["submenu"],
        },
        closeOnNavigation: false,
      }
    );

    const route = routes.find((route) => route.path === this.router.url.substring(1));
    const currentTitle = route ? this.translateService.instant(route.title as string) : "";

    this.titleService.setTitle(this.translateService.instant("SETTINGS."));

    return dialogRef.afterClosed().pipe(
      take(1),
      tap(() => {
        this.titleService.setTitle(currentTitle);

        // Wenn "id" bereits da war
        this.router.navigate([], {
          queryParams: {
            settings: null,
            submenu: null,
          },
          queryParamsHandling: "",
        });

        // Wenn "id" generiert wurde
        const url = this.router
          .createUrlTree([], {
            queryParams: {
              settings: null,
              submenu: null,
            },
          })
          .toString();
        this.location.replaceState(url);
      })
    );
  }

  openAndReloadData(data?: SettingsDialogData) {
    this.open(data).subscribe((result) => {
      if (result) this.settingsApiService.saveAndReloadSettings(result);
    });
  }
}
