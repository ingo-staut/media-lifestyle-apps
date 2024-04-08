import { VersionType } from "./enum/version.enum";

export type VersionEntry = {
  version: Version;
  date: Date;
  messages: string[];
};

export type Version = {
  major: number;
  minor: number;
  patch: number;
  type: VersionType;
};
