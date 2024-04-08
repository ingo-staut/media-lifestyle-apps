import { Pipe, PipeTransform } from "@angular/core";
import { VersionType } from "../models/enum/version.enum";
import { VersionEntry } from "../models/version.type";

@Pipe({
  name: "version",
})
export class VersionPipe implements PipeTransform {
  transform(entry: VersionEntry, full = false): string {
    const version = entry.version;
    return version.type === VersionType.MAJOR && !full
      ? `${version.major}`
      : `v${version.major}.${version.minor}.${version.patch}`;
  }
}

@Pipe({
  name: "isMajorVersion",
})
export class MajorVersionPipe implements PipeTransform {
  transform(entry: VersionEntry): boolean {
    return entry.version.type === VersionType.MAJOR;
  }
}

@Pipe({
  name: "isMajorOrMinorVersion",
})
export class MajorOrMinorVersionPipe implements PipeTransform {
  transform(entry: VersionEntry): boolean {
    return entry.version.type === VersionType.MAJOR || entry.version.type === VersionType.MINOR;
  }
}
