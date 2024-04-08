import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { LANGUAGES } from "shared/data/language.data";
import { URL_INFO_DROPDOWN_DATA, URL_VIDEO_DROPDOWN_DATA } from "shared/data/url-type.data";
import { DropdownInput } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { Language } from "shared/models/enum/language.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { Url, UrlEnum } from "shared/models/url.class";
import { DialogService } from "../dialogs/dialog/dialog.service";

@Injectable({
  providedIn: "root",
})
export class UrlDialogsService {
  constructor(private dialogService: DialogService) {}

  openAddOrEditUrlDialog(add: boolean, urlObject?: Url, urlType?: UrlEnum) {
    const { url, note, type, language } = urlObject ?? {};

    const dropdownInputs: DropdownInput[] = [
      {
        placeholder: "LANGUAGE.",
        selectedKey: language ?? Language.NONE,
        data: LANGUAGES,
      },
    ];

    if (urlType === UrlEnum.VIDEO) {
      dropdownInputs.push({
        placeholder: "URL.TYPE.",
        selectedKey: type ?? UrlType.NONE,
        data: URL_VIDEO_DROPDOWN_DATA,
      });
    } else if (urlType === UrlEnum.INFO) {
      dropdownInputs.push({
        placeholder: "URL.TYPE.",
        selectedKey: type ?? UrlType.NONE,
        data: URL_INFO_DROPDOWN_DATA,
      });
    }

    const data: DialogData = {
      title: "URL." + (add ? "ADD." : "EDIT"),
      icons: ["url"],
      textInputs: [
        {
          placeholder: "URL.",
          text: url ?? "",
          icon: "url",
          required: true,
        },
        {
          placeholder: "NOTE.",
          text: note ?? "",
          icon: "note",
        },
      ],
      dropdownInputs,
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return;

        if (result.actionDelete) return null;

        const url = new Url({
          url: result.textInputs[0],
          note: result.textInputs[1],
          language: result.dropdownInputs[0] as Language,
          type: result.dropdownInputs[1] ? (result.dropdownInputs[1] as UrlType) : UrlType.NONE,
        });

        return url;
      })
    );
  }
}
