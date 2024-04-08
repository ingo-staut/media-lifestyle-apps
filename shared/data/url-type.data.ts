import { DropdownData } from "shared/models/dropdown.type";
import { UrlType } from "shared/models/enum/url-type.enum";

export const URL_DROPDOWN_DATA: DropdownData<string, string>[] = [
  {
    key: UrlType.NONE,
    name: "URL.TYPE.NONE",
    icon: "video-not",
  },
  {
    key: UrlType.TRAILER,
    name: "URL.TYPE.TRAILER",
    icon: "trailer",
  },
  {
    key: UrlType.INTRO,
    name: "URL.TYPE.INTRO",
    icon: "intro",
  },
  {
    key: UrlType.CRITIC_REVIEW,
    name: "URL.TYPE.CRITIC_REVIEW",
    icon: "critic-review",
  },
  {
    key: UrlType.NEWS,
    name: "URL.TYPE.NEWS",
    icon: "news",
  },
];

export const URL_VIDEO_DROPDOWN_DATA: DropdownData<string, string>[] = [
  {
    key: UrlType.NONE,
    name: "URL.TYPE.NONE",
    icon: "video-not",
  },
  {
    key: UrlType.TRAILER,
    name: "URL.TYPE.TRAILER",
    icon: "trailer",
  },
  {
    key: UrlType.INTRO,
    name: "URL.TYPE.INTRO",
    icon: "intro",
  },
  {
    key: UrlType.CRITIC_REVIEW,
    name: "URL.TYPE.CRITIC_REVIEW",
    icon: "critic-review",
  },
];

export const URL_INFO_DROPDOWN_DATA: DropdownData<string, string>[] = [
  {
    key: UrlType.NONE,
    name: "URL.TYPE.NONE",
    icon: "video-not",
  },
  {
    key: UrlType.NEWS,
    name: "URL.TYPE.NEWS",
    icon: "news",
  },
  {
    key: UrlType.CRITIC_REVIEW,
    name: "URL.TYPE.CRITIC_REVIEW",
    icon: "critic-review",
  },
];

export function getUrlTypeDropdownDataByUrlType(type: UrlType) {
  return URL_DROPDOWN_DATA.find((data) => data.key === type);
}

export function getUrlTypeNameByUrlType(type: UrlType, iconForNone: boolean) {
  if (!iconForNone && (type === UrlType.NONE || type === undefined)) return "";

  return getUrlTypeDropdownDataByUrlType(type)?.name ?? "";
}

export function getUrlTypeIconByUrlType(type: UrlType, iconForNone: boolean) {
  if (!iconForNone && type === UrlType.NONE) return "";

  return getUrlTypeDropdownDataByUrlType(type)?.icon ?? "";
}
