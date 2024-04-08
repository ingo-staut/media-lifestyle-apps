import { Location } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { take, tap } from "rxjs";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_NORMAL_SCREEN_MAX,
  MEDIA_QUERY_NORMAL_SCREEN_PX,
} from "shared/styles/data/media-queries";
import { routes } from "../../app-routing.module";
import { Media } from "../../models/media.class";
import { MediaApiService } from "../../services/media.api.service";
import { MediaDialogComponent } from "./media-dialog.component";

export type OptionalsType = {
  add?: boolean;
  triggerQuickAdd?: boolean;
  searchText?: string;
  openEditTitle?: boolean;
};

@Injectable({
  providedIn: "root",
})
export class MediaDialogService {
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isNormalScreen = MEDIA_QUERY_NORMAL_SCREEN_MAX;
  routes = routes;

  constructor(
    @Inject(Router) private router: Router,
    private dialog: MatDialog,
    private titleService: Title,
    private location: Location,
    private mediaApiService: MediaApiService,
    private translateService: TranslateService
  ) {}

  private open(media: Media, optionals?: OptionalsType) {
    const dialogRef = this.dialog.open<
      MediaDialogComponent,
      { media: Media } & OptionalsType,
      Media
    >(MediaDialogComponent, {
      // Breite und Höhe von Media-Dialog ändern: MEDIA_DIALOG_SIZE
      height: this.isNormalScreen.matches ? "100dvh" : "80vh",
      width: this.isNormalScreen.matches ? "100dvw" : "80vw",
      maxWidth: `${MEDIA_QUERY_NORMAL_SCREEN_PX}px`,
      data: {
        media,
        ...optionals,
      },
      closeOnNavigation: false,
    });

    const route = routes.find((route) => route.path === this.router.url.substring(1));
    const currentTitle = route ? this.translateService.instant(route.title as string) : "";

    this.titleService.setTitle(
      currentTitle +
        " – " +
        (media.name ? media.name : this.translateService.instant(media.type + ".NEW"))
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

  openAndReloadData(media: Media, optionals?: OptionalsType) {
    this.open(media, optionals).subscribe((result) => {
      if (result) this.mediaApiService.saveAndReloadMedia(result);
    });
  }

  openAndReloadDataById(id: string, optionals?: OptionalsType) {
    const media = this.mediaApiService.mediaListSnapshot.find((media) => media.id === id);
    if (!media) throw new Error(`Media by id "${id}" not found`);

    this.open(media, optionals).subscribe((result) => {
      if (result) this.mediaApiService.saveAndReloadMedia(result);
    });
  }
}
