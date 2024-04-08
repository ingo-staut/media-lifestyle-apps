import { Injectable } from "@angular/core";
import { cloneDeep } from "lodash";
import { map } from "rxjs";
import {
  DISCOVERY_SOURCES,
  SOURCES_COMPLETER_ENTRIES,
  findSourceByText,
} from "shared/data/discovery-source.data";
import { ActionButton } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogDiscoverySourcesService {
  constructor(private dialogService: DialogService) {}

  private getSourceButtons(prependListItems: string[]) {
    const buttons: ActionButton[] = DISCOVERY_SOURCES.map((source) => {
      const data: ActionButton = {
        action: {
          id: source.key,
          text: "",
          tooltip: source.name,
          icon: source.icon,
        },
        closeAfterClick: true,
        func: () => {
          prependListItems.unshift(source.name);
        },
      };

      return data;
    });

    return buttons;
  }

  open(media: Media) {
    const sources = cloneDeep(media.sources);
    const add = sources.length === 0;
    const completerList = SOURCES_COMPLETER_ENTRIES;

    const prependListItems: string[] = [];
    const buttons = this.getSourceButtons(prependListItems);

    const data: DialogData = {
      title: "DISCOVERY_SOURCE.S",
      icons: ["explore"],
      itemsInputs: [
        {
          placeholder: "DISCOVERY_SOURCE.S",
          items: sources.map((source) => findSourceByText(source)?.name ?? source),
          firstCharToTitleCase: false,
          showDeleteButton: true,
          showAddFromClipboardButton: true,
          completerList,
          buttons,
          findIconFunction: (text: string) => findSourceByText(text)?.icon ?? "",
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          if (result.actionDelete) {
            return [];
          }

          const sources = result.itemsInputs[0].map(
            (source) => findSourceByText(source)?.name ?? source
          );

          // QuickAdd Buttons
          sources.unshift(...prependListItems);

          return [...new Set(sources)];
        } else {
          return undefined;
        }
      })
    );
  }
}
