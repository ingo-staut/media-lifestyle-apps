import { Injectable } from "@angular/core";
import { VersionType } from "../models/enum/version.enum";
import { Version, VersionEntry } from "../models/version.type";

@Injectable({
  providedIn: "root",
})
export class VersionService {
  json: any;
  currentVersion: VersionEntry;
  versions: VersionEntry[];

  constructor() {}

  initialLoadAllData(json: any) {
    this.json = json;
    this.currentVersion = {
      version: {
        ...json.version,
        type: this.getVersionType(json.version as Version),
      },
      date: new Date(json.lastChanged),
      messages: [],
    };
    this.versions = this.getVersionHistory();
  }

  private getVersionHistory(): VersionEntry[] {
    return this.json.messages.reverse().map((m: any) => {
      return {
        version: {
          ...m.version,
          type: this.getVersionType(m.version as Version),
        },
        date: new Date(m.date),
        messages: m.changes,
      };
    });
  }

  private getVersionType(version: Version): VersionType {
    if (version.minor === 0 && version.patch === 0) return VersionType.MAJOR;
    if (version.patch === 0) return VersionType.MINOR;
    return VersionType.PATCH;
  }

  getCopyrightText() {
    return `© 2022–${new Date().getFullYear()}, Ingo Staut`;
  }
}
