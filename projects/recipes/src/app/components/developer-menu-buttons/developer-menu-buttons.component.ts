import { Clipboard } from "@angular/cdk/clipboard";
import { DatePipe } from "@angular/common";
import { Component, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DialogData } from "shared/models/dialog.type";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { DatabaseService } from "shared/services/database.service";
import { NotificationService } from "shared/services/notification.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { getEditHistoryText } from "shared/utils/edit-history";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Recipe } from "../../models/recipe.class";

@Component({
  selector: "app-developer-menu-buttons",
  templateUrl: "./developer-menu-buttons.component.html",
  styleUrls: ["./developer-menu-buttons.component.scss"],
})
export class DeveloperMenuButtonsComponent {
  @Input() recipe: Recipe;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  showMoreButtons = true;

  constructor(
    private clipboard: Clipboard,
    private databaseService: DatabaseService,
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private translateService: TranslateService,
    private dialogService: DialogService
  ) {}

  onOpenInDatabase() {
    this.databaseService.openInDatabaseById(this.recipe.id);
  }

  onCopyId() {
    this.clipboard.copy(this.recipe.id);
    this.notificationService.show(NotificationTemplateType.SAVED_TO_CLIPBOARD);
  }

  onOpenInformationDialog() {
    const text = getEditHistoryText(this.recipe.editHistory, this.translateService, this.datePipe);

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
