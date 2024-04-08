import { Injectable } from "@angular/core";
import { Firestore, collection, doc, getDocs, setDoc } from "@angular/fire/firestore";
import { cloneDeep } from "lodash";
import { BehaviorSubject } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { getNewUUID } from "shared/utils/uuid";
import { environment } from "../../environments/environment";
import { Channel } from "../models/channel.class";

const channelList = [
  new Channel({
    id: "1dc5b245-abdb-4bd1-bb34-8013567c44f3",
    name: "Pro7",
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/c6/ProSieben_logo.svg",
    alternativeNames: ["Prosieben"],
    url: "https://video.prosieben.de/",
  }),
];

@Injectable({
  providedIn: "root",
})
export class ChannelApiService {
  private readonly COLLECTION_CHANNELS = environment.production ? "channels" : "channels";
  private readonly ID_CHANNELS = "40b91293-5ab8-45ce-8ab7-f9852a79fac3";

  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  constructor(private firestore: Firestore, private notificationService: NotificationService) {}

  async getChannels(localStore = false) {
    if (localStore) {
      this.channelsSubject.next(channelList);
      return;
    }

    const db = collection(this.firestore, this.COLLECTION_CHANNELS);

    return getDocs(db).then((data) => {
      const channels = data.docs.map((item) => {
        const channels = (item.data() as { channels: Channel[] }).channels.map((channel) =>
          this.convertChannelToVM(channel)
        );
        return channels;
      })[0];

      this.channelsSubject.next(channels);
    });
  }

  private channelsCRUD(channel: Channel, remove: boolean) {
    let channels = this.channelsSubject.value;

    // Löschen
    if (remove && channel.id && !!channels.find((c) => c.id === channel.id)) {
      channels = channels.filter((c) => c.id !== channel.id);
    }

    // Löschen, aber Id nicht vorhanden
    else if (remove) {
      this.notificationService.show(NotificationTemplateType.DELETE_ERROR);
    }

    // Bearbeiten / Hinzufügen
    else if (channel.id) {
      let found = false;
      channels = channels.map((c) => {
        if (c.id === channel.id) {
          found = true;
          c = channel;
        }
        return c;
      });

      if (!found) {
        channels.push(channel);
      }
    }

    // Keine Id gesetzt, hinzufügen
    else {
      // Wenn Id nicht gesetzt ist, dann generiere eine
      channel.id = getNewUUID();
      // und füge den TV-Sender hinzu
      channels.push(channel);
    }

    return channels;
  }

  get channelsSnapshot() {
    return this.channelsSubject.value;
  }

  saveAndReloadChannel(channel: Channel, remove: boolean = false, withNotification = true) {
    const oldChannels = cloneDeep(this.channelsSubject.value);
    const channels = this.channelsCRUD(channel, remove);

    this.addOrUpdateChannels(channels)
      .then(() => {
        this.channelsSubject.next(channels);

        if (withNotification) {
          this.notificationService
            .show(NotificationTemplateType.SAVING_SUCCESS, {
              messageReplace: "CHANNEL.",
              icon: "channel",
            })
            ?.subscribe(() => {
              this.addOrUpdateChannels(oldChannels)
                .then(() => {
                  this.channelsSubject.next(oldChannels);

                  this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
                    messageReplace: "CHANNEL.",
                    icon: "channel",
                  });
                })
                .catch((error) => {
                  this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
                    additionalMessages: [error],
                  });
                });
            });
        }
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  private async addOrUpdateChannels(channels: Channel[]) {
    const data = {
      ["channels"]: channels.map((channel) => this.convertChannelToDTO(channel)),
    };

    await setDoc(doc(this.firestore, this.COLLECTION_CHANNELS, this.ID_CHANNELS), data);
  }

  convertChannelToDTO(channel: Channel) {
    const obj = { ...channel } as any;

    return obj;
  }

  convertChannelToVM(data: any): Channel {
    let media = new Channel({ ...data });

    return media;
  }
}
