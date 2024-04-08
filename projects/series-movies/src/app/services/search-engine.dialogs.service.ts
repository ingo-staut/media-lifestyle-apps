import { Injectable } from "@angular/core";
import { LANGUAGES } from "shared/data/language.data";
import { REPLACE_FITTING_TYPES } from "shared/data/replace-fitting-type.data";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { Language } from "shared/models/enum/language.enum";
import { MediaEnum } from "shared/models/enum/media.enum";
import { ReplaceInTitleType } from "shared/models/enum/replace-fitting-type.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { getNewUUID } from "shared/utils/uuid";
import { MenuItem } from "../../../../../shared/models/menu-item.type";
import { SearchEngine, getMenuItem } from "../../../../../shared/models/search-engine.type";
import { SearchEngineApiService } from "../../../../../shared/services/search-engine/search-engine.api.service";
import { DATA_MEDIA_TYPE_FILTER } from "../data/media-type.data";
import { DialogService } from "../dialogs/dialog/dialog.service";
import { DEFAULT_KEY } from "../models/filter-select.type";

@Injectable({
  providedIn: "root",
})
export class SearchEngineDialogsService {
  constructor(
    private dialogService: DialogService,
    private searchEngineApiService: SearchEngineApiService
  ) {}

  openAddOrEditSearchEngine(
    menuItems: MenuItem<SearchEngine>[],
    parameters?: {
      menuItem?: MenuItem<SearchEngine>;
      id?: string;
      type?: SearchEngineType;
    }
  ) {
    const { menuItem, id, type } = parameters ?? {};
    const add = !menuItem;

    const data: DialogData = {
      title: add ? "SEARCHENGINE.ADD" : "SEARCHENGINE.EDIT",
      icons: ["search-engine"],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
      textInputs: [
        {
          text: add ? "" : menuItem.value.name,
          icon: "rename",
          placeholder: "TITLE",
          required: true,
        },
        {
          text: add ? "" : menuItem.value.url,
          icon: "url",
          placeholder: "URL.",
          required: true,
        },
        {
          text: add ? "" : menuItem.value.replaceSpaceInTitle,
          icon: "replace",
          placeholder: "REPLACE.SPACES_IN_TITLE",
        },
        {
          text: add ? "" : menuItem.value.image,
          icon: "image",
          placeholder: "IMAGE.",
          funcInputKey: "TITLE",
          func: (text?: string) => {
            if (!text) return;
            window.open(
              "https://www.google.com/search?tbm=isch&q=icon+" + text + "+wiki",
              "_blank"
            );
          },
        },
      ],
      buttonInputs: [
        {
          key: "favorite",
          state: add ? false : menuItem.value.favorite,
          placeholder: "FAVORITE.",
          icons: ["favorite-filled", "favorite-not"],
          texts: ["FAVORITE.", "FAVORITE.NO"],
        },
        {
          key: "quick-add",
          state: add ? false : menuItem.value.showQuickAdd,
          placeholder: "QUICKADD.",
          icons: ["quick-add", "quick-add-not"],
          texts: ["QUICKADD.WITH", "QUICKADD.WITHOUT"],
        },
      ],
      dropdownInputs: [
        {
          placeholder: "LANGUAGE.",
          data: LANGUAGES,
          selectedKey: menuItem?.value.language ?? Language.NONE,
        },
        {
          placeholder: "REPLACE.TITLE_FOR_URL",
          data: REPLACE_FITTING_TYPES,
          selectedKey: menuItem?.value.replaceInTitleType ?? ReplaceInTitleType.REPLACE_ONLY_SPACE,
        },
        {
          placeholder: "MEDIA.TYPE",
          data: DATA_MEDIA_TYPE_FILTER,
          selectedKey: menuItem?.value.mediaType?.toLowerCase() ?? DEFAULT_KEY,
        },
      ],
    };

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      const searchEngine: SearchEngine = {
        id: id ?? getNewUUID(),
        type: type ?? SearchEngineType.NONE,
        name: result.textInputs[0],
        url: result.textInputs[1],
        replaceSpaceInTitle: result.textInputs[2],
        image: result.textInputs[3],
        favorite: result.buttonInputs[0].state,
        showQuickAdd: result.buttonInputs[1].state,
        language: result.dropdownInputs[0] as Language,
        replaceInTitleType: result.dropdownInputs[1] as ReplaceInTitleType,
        mediaType:
          result.dropdownInputs[2] === DEFAULT_KEY
            ? null
            : (result.dropdownInputs[2].toUpperCase() as MediaEnum),
      };

      const data = getMenuItem(searchEngine);

      if (result.actionAdd) {
        menuItems.push(data);
      } else if (result.actionApply && id !== undefined) {
        menuItems = menuItems.map((item) => {
          if (item.id === data.id) item = data;
          return item;
        });
      } else if (result.actionDelete && id !== undefined) {
        menuItems = menuItems.filter((item) => item.id !== id);
      }

      const searchEngines = menuItems.map((menuItem) => menuItem.value);
      this.searchEngineApiService.saveAndReloadSearchEngines(searchEngines);
    });
  }
}
