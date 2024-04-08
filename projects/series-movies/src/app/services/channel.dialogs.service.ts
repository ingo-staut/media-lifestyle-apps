import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { ItemsType } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { getNewUUID } from "shared/utils/uuid";
import { CHANNEL_TYPE_DATA } from "../data/channel-type.data";
import { DialogService } from "../dialogs/dialog/dialog.service";
import { Channel } from "../models/channel.class";
import { ChannelType } from "../models/enum/channel.enum";
import { ChannelApiService } from "./channel.api.service";

@Injectable({
  providedIn: "root",
})
export class ChannelDialogsService {
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialogService: DialogService, private channelApiService: ChannelApiService) {}

  openEditOrAddChannel(id: string) {
    const add = !id;

    const channels = this.channelApiService.channelsSnapshot;
    const channel = channels.find((channel) => channel.id === id);

    const data: DialogData = {
      title: "CHANNEL." + (add ? "ADD" : "EDIT"),
      icons: ["channel"],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
      textInputs: [
        {
          text: channel?.name ?? "",
          placeholder: "TITLE",
          icon: "rename",
          required: true,
        },
        {
          text: channel?.icon ?? "",
          placeholder: "IMAGE.",
          icon: "image",
        },
        {
          text: channel?.url ?? "",
          placeholder: "URL.",
          icon: "url",
        },
        {
          text: channel?.urlLive ?? "",
          placeholder: "URL.LIVE",
          icon: "live",
        },
      ],
      itemsInputs: [
        {
          items: channel?.alternativeNames ?? [],
          placeholder: "ALTERNATIVE_NAMES",
          itemsType: ItemsType.STRING,
          firstCharToTitleCase: true,
          showDeleteButton: true,
          showAddFromClipboardButton: true,
        },
      ],
      buttonInputs: [
        {
          state: channel?.withAds ?? false,
          icons: ["television", "television-not"],
          texts: ["AD.WITH", "AD.WITHOUT"],
          placeholder: "AD.",
        },
      ],
      toggleGroupInputs: [
        {
          data: CHANNEL_TYPE_DATA,
          selectedKey: channel?.type ?? ChannelType.TELEVISION_CHANNEL,
          placeholder: "CHANNEL.TYPE.",
          showText: !this.isSmallScreen.matches,
          showTextOnlySelected: this.isSmallScreen.matches,
        },
      ],
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return;

        // Erstellen
        if (result.actionAdd) {
          const c = new Channel({
            id: getNewUUID(),
            name: result.textInputs[0],
            icon: result.textInputs[1],
            url: result.textInputs[2],
            urlLive: result.textInputs[3],
            alternativeNames: result.itemsInputs[0],
            withAds: result.buttonInputs[0].state,
            type: result.toggleGroupInputs[0] as ChannelType,
          });

          this.channelApiService.saveAndReloadChannel(c);
          return { ...result, id: c.id };
        }

        // Bearbeiten
        else if (result.actionApply && channel) {
          const c = new Channel({
            ...channel,
            name: result.textInputs[0],
            icon: result.textInputs[1],
            url: result.textInputs[2],
            urlLive: result.textInputs[3],
            alternativeNames: result.itemsInputs[0],
            withAds: result.buttonInputs[0].state,
            type: result.toggleGroupInputs[0] as ChannelType,
          });
          this.channelApiService.saveAndReloadChannel(c);
        }

        // Löschen
        else if (result.actionDelete && channel) {
          this.channelApiService.saveAndReloadChannel(channel, true);
        }

        // Sollte nicht stattfinden
        else {
          console.warn("Sender-Dialog hat falsches Ergebnis", result);
        }

        return { ...result, id };
      })
    );
  }
}
