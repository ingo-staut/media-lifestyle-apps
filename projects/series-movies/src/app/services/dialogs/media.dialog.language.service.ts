import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { map } from "rxjs";
import {
  COUNTRY_UNITED_STATES_ICON,
  COUNTRY_UNITED_STATES_NAME,
  LANGUAGES_COMPLETER_ENTRIES,
  LANGUAGES_WITHOUT_NONE,
  findCountryTextByText,
  findLanguageIconByText,
  findLanguageKeyByText,
  findLanguageTextByText,
} from "shared/data/language.data";
import { ActionButton } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogLanguageService {
  constructor(private dialogService: DialogService, private translateService: TranslateService) {}

  private getLanguageButtons(prependListItems: string[], isCountry: boolean) {
    const buttons: ActionButton[] = LANGUAGES_WITHOUT_NONE.map((language) => {
      const data: ActionButton = {
        action: {
          id: language.key,
          text: "",
          tooltip: isCountry ? language.value : language.name,
          icon: language.icon,
        },
        closeAfterClick: true,
        func: () => {
          prependListItems.unshift(language.key);
        },
      };

      return data;
    });

    if (isCountry) {
      const data: ActionButton = {
        action: {
          id: COUNTRY_UNITED_STATES_NAME,
          text: "",
          tooltip: COUNTRY_UNITED_STATES_NAME,
          icon: COUNTRY_UNITED_STATES_ICON,
        },
        closeAfterClick: true,
        func: () => {
          prependListItems.unshift(COUNTRY_UNITED_STATES_NAME);
        },
      };
      buttons.unshift(data);
    }

    return buttons;
  }

  open(media: Media) {
    const languages = cloneDeep(media.languages);
    const add = languages.length === 0;
    const completerList = LANGUAGES_COMPLETER_ENTRIES.map((language) => {
      language.text = this.translateService.instant(language.text);
      return language;
    });

    const prependListItems: string[] = [];
    const buttons = this.getLanguageButtons(prependListItems, false);

    const data: DialogData = {
      title: "LANGUAGE.S",
      icons: ["language"],
      itemsInputs: [
        {
          placeholder: "LANGUAGE.S",
          items: languages.map((lang) =>
            this.translateService.instant(findLanguageTextByText(lang, true))
          ),
          firstCharToTitleCase: false,
          showDeleteButton: true,
          showAddFromClipboardButton: true,
          completerList,
          buttons,
          findIconFunction: (text: string) => findLanguageIconByText(text),
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

          const languages = result.itemsInputs[0].map((lang) => findLanguageKeyByText(lang, true));

          // QuickAdd Buttons
          languages.unshift(...prependListItems);

          return [...new Set(languages)];
        } else {
          return undefined;
        }
      })
    );
  }

  openEditCountries(media: Media) {
    const countries = cloneDeep(media.countries);
    const add = countries.length === 0;

    const prependListItems: string[] = [];
    const buttons = this.getLanguageButtons(prependListItems, true);

    const data: DialogData = {
      title: "COUNTRY.S",
      icons: ["country"],
      itemsInputs: [
        {
          placeholder: "COUNTRY.S",
          items: countries,
          firstCharToTitleCase: false,
          showDeleteButton: true,
          showAddFromClipboardButton: true,
          buttons,
          findIconFunction: (text: string) => findLanguageIconByText(text),
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
          const countries = result.itemsInputs[0];

          // QuickAdd Buttons
          const prepend = prependListItems
            .map((item) => findCountryTextByText(item))
            .filter((country): country is string => !!country);
          countries.unshift(...prepend);

          return [...new Set(countries)];
        } else {
          return undefined;
        }
      })
    );
  }
}
