import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { Url } from "shared/models/url.class";
import { DialogService } from "../../dialogs/dialog/dialog.service";

@Injectable({
  providedIn: "root",
})
export class UrlDialogsService {
  constructor(private dialogService: DialogService) {}

  openAddOrEditUrlDialog(add: boolean, urlObject?: Url) {
    const { url, note, type } = urlObject ?? {};

    const data: DialogData = {
      title: "URL." + (add ? "ADD" : "EDIT"),
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
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          if (result.actionDelete) {
            return null;
          }
          const url = new Url({
            url: result.textInputs[0],
            note: result.textInputs[1],
          });
          return url;
        } else {
          return undefined;
        }
      })
    );
  }
}
