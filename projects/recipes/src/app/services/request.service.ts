import { Injectable } from "@angular/core";
import { LoadingService } from "../components/loading/loading.service";

@Injectable({
  providedIn: "root",
})
export class RequestService {
  constructor(private loadingService: LoadingService) {}

  async requestUrl(url: string) {
    this.loadingService.countUp();

    return fetch(
      "" +
        encodeURIComponent(url),
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // Handle the data
        this.loadingService.countDown();
        return data;
      })
      .catch((error) => {
        // Handle the error
        this.loadingService.countDown();
        console.error(error);
      });
  }
}
