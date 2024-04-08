import { Component, Inject, OnDestroy, inject } from "@angular/core";
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from "@angular/material/snack-bar";
import { interval } from "rxjs";
import { MediaEnum } from "shared/models/enum/media.enum";
import { NotificationTemplate } from "shared/models/notification.template.type";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent implements OnDestroy {
  snackBarRef = inject(MatSnackBarRef);

  readonly intervalSpeedInMs = 100;
  // WORKAROUND: Dann pausiert der Progress für ein paar Sekunden,
  // eigentlich hier eine "0"
  readonly startValue = -1;
  readonly endValue = 100;
  readonly step =
    (this.endValue - this.startValue) / ((this.data.duration ?? 0) / this.intervalSpeedInMs);

  progressValue = this.startValue;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  sub = interval(this.intervalSpeedInMs).subscribe(() => {
    this.progressValue += this.step;
    if (this.progressValue >= this.endValue) {
      this.progressValue = this.endValue;
    }
  });

  get mediaTypeTextByMediaType() {
    if (!this.data.actionOpen) return "";

    switch (this.data.actionOpen.type) {
      case MediaEnum.SERIES:
        return "SERIES.OPEN";

      case MediaEnum.MOVIE:
        return "MOVIES.OPEN";

      default:
        return "MEDIA.OPEN";
    }
  }

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: NotificationTemplate,
    private mediaDialogService: MediaDialogService
  ) {}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openById(): void {
    if (!this.data.actionOpen?.id) return;
    this.mediaDialogService.openAndReloadDataById(this.data.actionOpen?.id);
  }
}
