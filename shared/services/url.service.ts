import { Injectable } from "@angular/core";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { SearchEngine } from "shared/models/search-engine.type";
import { Url } from "shared/models/url.class";
import { NotificationService } from "shared/services/notification.service";
import { URL_FAVICON, formatUrl, getTitleOfUrl, openUrl } from "shared/utils/url";

@Injectable({
  providedIn: "root",
})
export class UrlService {
  constructor(private notificationsService: NotificationService) {}

  openOrCopyUrl(optionals?: {
    event?: MouseEvent;
    url?: Url | string;
    season?: number;
    episode?: number;
    year?: number;
    searchEngine?: SearchEngine;
    title?: string;
  }) {
    const { event } = optionals ?? {};
    const formattedUrl = formatUrl(optionals);

    // Url kopieren
    if (event?.ctrlKey || event?.altKey || event?.shiftKey) {
      navigator.clipboard.writeText(formattedUrl);

      this.notificationsService.show(NotificationTemplateType.URL_SAVED_TO_CLIPBOARD, {
        messageReplace: getTitleOfUrl(formattedUrl),
        extraImage: URL_FAVICON + formattedUrl,
      });
    }

    // Url öffnen
    else {
      openUrl(formattedUrl);
    }

    return formattedUrl;
  }
}
