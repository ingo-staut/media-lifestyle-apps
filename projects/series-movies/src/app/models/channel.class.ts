import { URL_FAVICON, isValidHttpUrl } from "shared/utils/url";
import { findChannelTypeDataByType } from "../data/channel-type.data";
import { CINEMA_ID, ChannelType, STREAM_ID } from "./enum/channel.enum";

export class Channel {
  id: string;
  idOld?: string;
  name: string;
  icon: string;
  alternativeNames: string[];
  url: string;
  urlLive: string;
  type: ChannelType;
  withAds: boolean;

  constructor(channel: {
    id: string;
    idOld?: string;
    name?: string;
    icon?: string;
    alternativeNames?: string[];
    url?: string;
    urlLive?: string;
    type?: ChannelType;
    withAds?: boolean;
  }) {
    this.id = channel.id;
    this.idOld = channel.idOld ?? "";
    this.name = channel.name ?? "";
    this.icon = channel.icon ?? "";
    this.alternativeNames = channel.alternativeNames ?? [];
    this.url = channel.url ?? "";
    this.urlLive = channel.urlLive ?? "";
    this.type = channel.type ?? ChannelType.NONE;
    this.withAds = channel.withAds ?? false;
  }

  get displayIcon() {
    return Channel.getIcon(this);
  }

  get typeIsNotTelevision() {
    return this.type === ChannelType.STREAM || this.type === ChannelType.MEDIA_LIBRARY;
  }

  static findChannelById(channelId: string, channels: Channel[]): Channel | null {
    return (
      channels.find((channel) => channel.id === channelId) ??
      (channelId === CINEMA_ID
        ? new Channel({
            id: "cinema",
            name: "CINEMA.",
            icon: "assets/icons/cinema-white.svg",
            type: ChannelType.CINEMA,
          })
        : channelId === STREAM_ID
        ? new Channel({
            id: STREAM_ID,
            name: "STREAM.",
            icon: "assets/icons/stream-white.svg",
            type: ChannelType.STREAM,
          })
        : null)
    );
  }

  static findChannelTypeIconById(id: string, channels: Channel[]): string {
    const type = Channel.findChannelById(id, channels)?.type;
    if (!type) return "";

    const channelType = findChannelTypeDataByType(type);
    if (!channelType) return "";

    return channelType.icon;
  }

  private static getIcon(channel: Channel) {
    const { icon, url, urlLive } = channel;
    const u = url || urlLive;
    if (!icon && u && isValidHttpUrl(u)) {
      return URL_FAVICON + u;
    }

    return icon;
  }

  static findChannelIdsInTextAndList(channelList: Channel[], text?: string, list?: string[]) {
    list = list?.map((s) => s.toLowerCase());

    const channelIds = channelList.reduce((acc, channel) => {
      const allNames = [
        channel.name.toLowerCase(),
        ...channel.alternativeNames.map((n) => n.toLowerCase()),
      ];
      const count = allNames.reduce(
        (sum, name) => sum + (list?.includes(name) || text?.toLowerCase().includes(name) ? 1 : 0),
        0
      );

      if (count > 0) {
        acc.push({ channelId: channel.id, count });
      }

      return acc;
    }, [] as { channelId: string; count: number }[]);

    channelIds.sort((a, b) => b.count - a.count);

    return channelIds;
  }
}
