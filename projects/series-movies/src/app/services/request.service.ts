import { Injectable } from "@angular/core";
import { NotificationStyleType } from "shared/models/enum/notification-style.enum";
import { NotificationService } from "shared/services/notification.service";
import { LoadingService } from "../components/loading/loading.service";

@Injectable({
  providedIn: "root",
})
export class RequestService {
  constructor(
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  async requestWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = 15_000
  ): Promise<Response | null> {
    this.loadingService.countUp();

    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${timeout / 1000} seconds`)),
          timeout
        )
      ),
    ])
      .catch((error) => {
        console.error("Error", error);

        this.loadingService.countDown();

        this.notificationService.showNotificationText(
          "Request timeout",
          NotificationStyleType.WARNING
        );

        return null;
      })
      .then((response) => {
        this.loadingService.countDown();

        return response;
      });
  }
}
