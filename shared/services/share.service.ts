import { Clipboard } from "@angular/cdk/clipboard";
import { Injectable } from "@angular/core";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";

@Injectable({
  providedIn: "root",
})
export class ShareService {
  constructor(private clipboard: Clipboard, private notificationService: NotificationService) {}

  share(url: string, title?: string, text?: string) {
    navigator
      .share({ title, text, url })
      // Share-Dialog wird geöffnet
      .then()
      // Wenn Share-Dialog nicht geöffnet werden kann,
      // dann wird in die Zischenablage kopiert
      .catch(() => {
        this.clipboard.copy(url);
        this.notificationService.show(NotificationTemplateType.SAVED_TO_CLIPBOARD);
      });
  }

  shareUrlWithoutCatch(url: string) {
    navigator
      .share({ url })
      // Share-Dialog wird geöffnet
      .then();
  }
}
