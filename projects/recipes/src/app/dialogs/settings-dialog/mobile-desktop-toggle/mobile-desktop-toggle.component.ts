import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { SettingsEntry } from "../../../models/settings-entry.type";

@Component({
  selector: "app-mobile-desktop-toggle",
  templateUrl: "./mobile-desktop-toggle.component.html",
  styleUrls: ["./mobile-desktop-toggle.component.scss"],
})
export class MobileDesktopToggleComponent {
  @Input() formGroup: FormGroup;
  @Input() formGroupName: string;
  @Input() formGroupNameOuter: string = "";
  @Input() title: string;
  @Input() titleReplace: string = "";
  @Input() toggle: SettingsEntry<boolean>;
}
