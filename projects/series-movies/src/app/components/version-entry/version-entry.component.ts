import { Component, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { VersionEntry } from "shared/models/version.type";
import { LocaleService } from "shared/services/locale.service";

@Component({
  selector: "app-version-entry",
  templateUrl: "./version-entry.component.html",
  styleUrls: ["./version-entry.component.scss"],
})
export class VersionEntryComponent {
  @Input() version: VersionEntry;

  details = false;

  constructor(
    protected translateService: TranslateService,
    protected localeService: LocaleService
  ) {}
}
