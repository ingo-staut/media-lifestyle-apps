import { DropdownData } from "shared/models/dropdown.type";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { transformTypeToParamValue } from "shared/utils/type";
import { ChannelType } from "../models/enum/channel.enum";

export const CHANNEL_TYPE_DATA: DropdownData<string, string>[] = [
  {
    key: ChannelType.TELEVISION_CHANNEL,
    name: "CHANNEL.TELEVISION.",
    icon: "television",
  },
  {
    key: ChannelType.STREAM,
    name: "STREAM.",
    icon: "stream",
  },
  {
    key: ChannelType.MEDIA_LIBRARY,
    name: "MEDIA_LIBRARY.",
    icon: "series",
  },
  {
    key: ChannelType.CINEMA,
    name: "CINEMA.",
    icon: "cinema",
  },
];

// ! Ohne `CINEMA`
export const CHANNEL_TYPE_DROPDOWN_DATA: DropdownData<string, string>[] = CHANNEL_TYPE_DATA.slice(
  0,
  -1
);

/**
 * ! `type` ist für URL-Parameter optimiert
 *  */
export const CHANNEL_TYPES: ReadonlyArray<Group<string>> = [
  {
    name: "CHANNEL.TYPE.",
    icon: "channel",
    entries: CHANNEL_TYPE_DATA.map((status) => {
      const { key, name, icon, alternativeSearchTerms } = status;
      const entry: Entry<string> = {
        type: transformTypeToParamValue(key),
        name,
        icon,
        additionalSearchTerms: alternativeSearchTerms,
      };
      return entry;
    }),
  },
];

export function findChannelTypeDataByType(type: ChannelType) {
  return CHANNEL_TYPE_DATA.find((t) => t.key === type);
}
