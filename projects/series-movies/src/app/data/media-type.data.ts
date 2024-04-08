import { DropdownData } from "shared/models/dropdown.type";
import { MediaEnum } from "../../../../../shared/models/enum/media.enum";
import { DEFAULT_KEY } from "../models/filter-select.type";
import { MediaType } from "../models/media.type";

const defaultValue: MediaType = {
  type: DEFAULT_KEY,
  name: "SERIES_AND_MOVIES",
  icon: "media",
  color: "primary",
  colorHEX: "#0f91a5",
};

const DATA_MEDIA_TYPE: MediaType[] = [
  {
    type: MediaEnum.SERIES,
    icon: "series",
    name: "SERIES.",
    color: "primary",
    colorHEX: "#0f91a5",
  },
  {
    type: MediaEnum.MOVIE,
    icon: "movie",
    name: "MOVIE.",
    color: "accent",
    colorHEX: "#dc2882",
  },
];

export const DATA_MEDIA_TYPE_FILTER: DropdownData<string, string>[] = [
  { key: defaultValue.type.toLowerCase(), name: defaultValue.name, icon: defaultValue.icon },
  ...DATA_MEDIA_TYPE.map((mediaType) => {
    const type: DropdownData<string, string> = {
      key: mediaType.type.toLowerCase(),
      name: mediaType.name,
      icon: mediaType.icon,
      color: mediaType.colorHEX,
    };

    return type;
  }),
];

export const DATA_MEDIA_TYPE_WITHOUT_NONE: DropdownData<MediaEnum, string>[] = DATA_MEDIA_TYPE.map(
  (mediaType) => {
    const type: DropdownData<MediaEnum, string> = {
      key: mediaType.type as MediaEnum,
      name: mediaType.name,
      icon: mediaType.icon,
      color: mediaType.colorHEX,
    };

    return type;
  }
);

export function getMediaTypeDetailsByType(type: MediaEnum | null) {
  return DATA_MEDIA_TYPE.find((mediaType) => mediaType.type === type);
}

export function getMediaTypeDetailsByTypeWithDefaultValue(type: MediaEnum | null) {
  return DATA_MEDIA_TYPE.find((mediaType) => mediaType.type === type) ?? defaultValue;
}
