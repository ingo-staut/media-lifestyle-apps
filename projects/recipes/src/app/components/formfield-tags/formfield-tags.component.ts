import { Platform } from "@angular/cdk/platform";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { splitTags } from "shared/utils/string";

@Component({
  selector: "app-formfield-tags[parentFormGroup][tags]",
  templateUrl: "./formfield-tags.component.html",
  styleUrls: ["./formfield-tags.component.scss"],
})
export class FormfieldTagsComponent {
  @Input() parentFormGroup: FormGroup;
  @Input() tags: string[];
  @Input() searchText?: string;
  @Input() addIcon: string = "add";
  @Input() addIconWhenBigButton: string = "";
  @Input() withPadding: boolean = true;
  @Input() completerList: CompleterEntry[] | null;

  @Output() tagsChange = new EventEmitter<string[]>();

  isMobileDevice = this.platform.ANDROID || this.platform.IOS;
  addValue = "";
  blinkingIndex = -1;

  constructor(private platform: Platform, private notificationService: NotificationService) {}

  edit(tag: string) {
    this.remove(tag);
    this.addValue = tag;
  }

  add(value: string): void {
    value = value.trim();

    const newTags = splitTags(value, ",");

    if (value) this.tags.unshift(...newTags);

    this.tagsChange.emit(this.tags);

    this.blinkingIndex = newTags.length;

    setTimeout(() => {
      this.blinkingIndex = -1;
    }, 1000);
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }

    this.tagsChange.emit(this.tags);
  }

  onRemoveAll() {
    const tagsCopy = this.tags;
    this.tags = [];
    this.tagsChange.emit(this.tags);

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.tags = tagsCopy;
      this.tagsChange.emit(this.tags);
    });
  }
}
