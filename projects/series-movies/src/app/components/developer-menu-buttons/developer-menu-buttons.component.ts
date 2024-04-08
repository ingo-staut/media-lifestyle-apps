import { Clipboard } from "@angular/cdk/clipboard";
import { DatePipe } from "@angular/common";
import { Component, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "projects/series-movies/src/environments/environment";
import { DialogData } from "shared/models/dialog.type";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { getEditHistoryText } from "shared/utils/edit-history";
import { DatabaseService } from "../../../../../../shared/services/database.service";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";
import { MediaApiService } from "../../services/media.api.service";

@Component({
  selector: "app-developer-menu-buttons[media]",
  templateUrl: "./developer-menu-buttons.component.html",
  styleUrls: ["./developer-menu-buttons.component.scss"],
})
export class DeveloperMenuButtonsComponent {
  @Input() media: Media;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  showMoreButtons = true;
  isProduction = environment.production;

  constructor(
    private clipboard: Clipboard,
    private databaseService: DatabaseService,
    private notificationService: NotificationService,
    private mediaApiService: MediaApiService,
    private datePipe: DatePipe,
    private translateService: TranslateService,
    private dialogService: DialogService
  ) {}

  onOpenInDatabase() {
    this.databaseService.openInDatabaseById(this.media.id);
  }

  onCopyId() {
    this.clipboard.copy(this.media.id);
    this.notificationService.show(NotificationTemplateType.SAVED_TO_CLIPBOARD);
  }

  onCopyToOppositeEnvironment() {
    this.mediaApiService.copyToOppositeEnvironment(this.media);
  }

  onOpenInformationDialog() {
    const text = getEditHistoryText(this.media.editHistory, this.translateService, this.datePipe);

    const data: DialogData = {
      title: "INFORMATION.S",
      text,
      icons: ["info"],
      actionPrimary: false,
      actionClose: true,
    };

    this.dialogService.open(data).subscribe();
  }
}
