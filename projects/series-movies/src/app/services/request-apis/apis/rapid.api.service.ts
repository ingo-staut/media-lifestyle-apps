import { Injectable } from "@angular/core";
import { RequestService } from "../../request.service";
import { CF_RAPID_API } from "../request.api.service";

@Injectable({
  providedIn: "root",
})
export class RapidApiService {
  constructor(private requestService: RequestService) {}

  async request(text: string, url: string, host: string) {
    try {
      const apiParams = new URLSearchParams({
        url: url + encodeURIComponent(text),
        host: encodeURIComponent(host),
      });

      const response = await this.requestService.requestWithTimeout(
        `${CF_RAPID_API}?${apiParams}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response?.ok) {
        throw new Error(`Request failed with status ${response?.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error occurred during request:", error);
      throw error;
    }
  }
}
