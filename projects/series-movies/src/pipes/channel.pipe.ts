import { Pipe, PipeTransform } from "@angular/core";
import { findChannelTypeDataByType } from "../app/data/channel-type.data";
import { Channel } from "../app/models/channel.class";
import { Television } from "../app/models/television.class";

@Pipe({
  name: "channel",
})
export class ChannelPipe implements PipeTransform {
  transform(television?: Television | null, channels?: Channel[]): Channel | null {
    if (!television || !channels) return null;

    return Channel.findChannelById(television.channelId, channels);
  }
}

@Pipe({
  name: "channelById",
})
export class ChannelByIdPipe implements PipeTransform {
  transform(id: string, channels?: Channel[]): Channel | null {
    if (!channels) return null;

    return Channel.findChannelById(id, channels);
  }
}

@Pipe({
  name: "channelTypeIcon",
})
export class ChannelTypeIconPipe implements PipeTransform {
  transform(television?: Television | null, channels?: Channel[]): string {
    if (!television || !channels) return "play";

    const type = Channel.findChannelById(television.channelId, channels)?.type;
    if (!type) return "play";

    const data = findChannelTypeDataByType(type);
    if (!data) return "play";

    return data.icon;
  }
}
