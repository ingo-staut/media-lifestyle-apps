import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { getAllSearchTerms } from "../../utils/translation";
import { CINEMA_ID, ChannelType, STREAM_ID } from "../models/enum/channel.enum";
import { ChannelApiService } from "./channel.api.service";

@Injectable({
  providedIn: "root",
})
export class ChannelCompleterService {
  constructor(private channelApiService: ChannelApiService) {}

  channelDropdownData$ = this.channelApiService.channels$.pipe(
    map((channels) => {
      const entriesChannel: Entry<string>[] = channels
        .filter((channel) => channel.type === ChannelType.TELEVISION_CHANNEL)
        .map((channel) => {
          const data: Entry<string> = {
            name: channel.name,
            type: channel.id,
            icon: "",
            image: channel.displayIcon,
            additionalSearchTerms: channel.alternativeNames,
          };
          return data;
        });

      const entriesStream: Entry<string>[] = channels
        .filter((channel) => channel.type === ChannelType.STREAM)
        .map((channel) => {
          const data: Entry<string> = {
            name: channel.name,
            type: channel.id,
            icon: "",
            image: channel.displayIcon,
            additionalSearchTerms: channel.alternativeNames,
          };
          return data;
        });

      const entriesMedia: Entry<string>[] = channels
        .filter((channel) => channel.type === ChannelType.MEDIA_LIBRARY)
        .map((channel) => {
          const data: Entry<string> = {
            name: channel.name,
            type: channel.id,
            icon: "",
            image: channel.displayIcon,
            additionalSearchTerms: channel.alternativeNames,
          };
          return data;
        });

      const list: ReadonlyArray<Group<string>> = [
        {
          name: "CHANNEL.S",
          icon: "channel",
          hide: true,
          entries: [
            {
              name: "CINEMA.",
              type: CINEMA_ID,
              icon: "cinema",
              additionalSearchTerms: getAllSearchTerms("CINEMA."),
            },
            {
              name: "STREAM.",
              type: STREAM_ID,
              icon: "stream",
              additionalSearchTerms: getAllSearchTerms("STREAM."),
            },
          ],
        },
        {
          name: "CHANNEL.TELEVISION.S",
          icon: "television",
          entries: entriesChannel,
        },
        {
          name: "STREAM.SERVICE.S",
          icon: "stream",
          entries: entriesStream,
        },
        {
          name: "MEDIA_LIBRARY.S",
          icon: "series",
          entries: entriesMedia,
        },
      ];

      return list;
    })
  );
}
