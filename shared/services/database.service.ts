import { Injectable } from "@angular/core";

export enum DB_ID {
  MEDIA = "MEDIA",
  RECIPE = "RECIPE",
}

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  public db_id: DB_ID;
  readonly URL_DB = "https://console.firebase.google.com/u/0/project/";
  readonly URL_RECIPE = "";
  readonly URL_MEDIA = "";

  constructor() {}

  openInDatabaseById(id: string) {
    if (!id) return;
    window.open(this.URL_DB + this.getUrlByDatabaseId() + id, "_blank");
  }

  getUrlByDatabaseId() {
    switch (this.db_id) {
      case DB_ID.MEDIA:
        return this.URL_MEDIA;
      case DB_ID.RECIPE:
        return this.URL_RECIPE;
      default:
        return this.URL_RECIPE;
    }
  }
}
