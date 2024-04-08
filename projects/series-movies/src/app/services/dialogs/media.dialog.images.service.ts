import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { map } from "rxjs";
import { ActionButton } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { SearchEngine } from "shared/models/search-engine.type";
import { UrlService } from "shared/services/url.service";
import { URL_FAVICON } from "shared/utils/url";
import { getMediaTypeDetailsByType } from "../../data/media-type.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogImagesService {
  constructor(private dialogService: DialogService, private translateService: TranslateService) {}

  open(media: Media, searchEngines: SearchEngine[], title: string) {
    const images = cloneDeep(media.images);
    const add = images.length === 0;
    const searchEnginesFilteredPreview = searchEngines.filter(
      (searchEngine) => searchEngine.type === SearchEngineType.IMAGE_PREVIEW_IMAGE
    );
    const searchEnginesFilteredHeader = searchEngines.filter(
      (searchEngine) => searchEngine.type === SearchEngineType.IMAGE_HEADER_IMAGE
    );

    const buttonsPreview: ActionButton[] = searchEnginesFilteredPreview.map((searchEngine) => {
      const data: ActionButton = {
        action: {
          id: "",
          text: searchEngine.name,
          icon: getMediaTypeDetailsByType(searchEngine.mediaType)?.icon || "",
          image: searchEngine.image || URL_FAVICON + searchEngine.url,
        },
        searchEngine: searchEngine,
        func: (event: MouseEvent, urlService: UrlService) => {
          urlService.openOrCopyUrl({ event, searchEngine, title });
        },
      };

      return data;
    });

    const buttonsHeader: ActionButton[] = searchEnginesFilteredHeader.map((searchEngine) => {
      const data: ActionButton = {
        action: {
          id: "",
          text: searchEngine.name,
          icon: "",
          image: searchEngine.image || URL_FAVICON + searchEngine.url,
        },
        searchEngine: searchEngine,
        func: (event: MouseEvent, urlService: UrlService) => {
          urlService.openOrCopyUrl({ event, searchEngine, title });
        },
      };

      return data;
    });

    // Suchmaschinen anzeigen, wenn Titel gesetzt
    const actionButtons = title
      ? [
          {
            placeholder:
              this.translateService.instant("QUICKADD.") +
              ": " +
              this.translateService.instant("IMAGE.PREVIEW"),
            buttons: buttonsPreview,
          },
          {
            placeholder:
              this.translateService.instant("QUICKADD.") +
              ": " +
              this.translateService.instant("IMAGE.HEADER"),
            buttons: buttonsHeader,
          },
        ]
      : [];

    const data: DialogData = {
      title: "IMAGE.S",
      icons: ["image"],
      itemsInputs: [
        {
          placeholder: "IMAGE.S",
          items: images,
          firstCharToTitleCase: false,
          showDeleteButton: true,
          showAddFromClipboardButton: true,
          showDeleteAllExceptFirst: true,
          showDeleteAllExceptFirstTwo: true,
        },
      ],
      actionButtons,
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
          return result.itemsInputs[0];
        } else {
          return undefined;
        }
      })
    );
  }
}
