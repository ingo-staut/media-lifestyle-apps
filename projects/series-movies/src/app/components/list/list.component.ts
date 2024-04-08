import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { cloneDeep } from "lodash";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { ItemsType } from "shared/models/dialog-input.type";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { UrlService } from "shared/services/url.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent {
  @Input() items: string[];
  @Input() itemsType: ItemsType;
  @Input() editable: boolean = true;
  @Input() maxHeight?: number;
  @Input() addIconWhenBigButton?: string = "";
  @Input() completerList?: string[] | CompleterEntry[] | null;
  @Input() firstCharToTitleCase?: boolean = true;
  @Input() showDeleteButton?: boolean = false;
  @Input() showAddFromClipboardButton?: boolean = false;
  @Input() smallerAddInputWidth?: boolean = false;
  @Input() findIconFunction?: (text: string) => string;

  @Output() itemsChange = new EventEmitter<string[]>();
  @Output() itemChange = new EventEmitter<string>();

  FormfieldType = FormfieldType;
  ItemsType = ItemsType;

  value = "";
  addValue?: string;
  addValueString?: string;
  addValueIndex?: number;

  constructor(private notificationService: NotificationService, private urlService: UrlService) {}

  drop(event: CdkDragDrop<string[], any, any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.itemsChange.emit(this.items);
  }

  onAdd(value: string) {
    if (!value) return;

    this.items = [value, ...this.items];

    this.itemsChange.emit(this.items);
  }

  async onAddFromClipboard() {
    const text = await navigator.clipboard.readText();
    this.onAdd(text);
  }

  onReplaceValue() {
    if (this.addValueIndex !== undefined && this.addValue) {
      // const item = this.items[this.addValueIndex];
      // if (item instanceof Item) {
      //   item.quantity = item.quantity + 1;
      // }
      // WORKAROUND: Neuladen der UI
      this.items = cloneDeep(this.items);

      this.addValue = undefined;
      this.addValueIndex = undefined;
    }
  }

  onAddValue() {
    // if (this.addValue && this.addValue instanceof Item) {
    if (this.addValue) {
      this.items = [this.addValue, ...this.items];

      this.addValue = undefined;
      this.addValueIndex = undefined;
    }
  }

  onClearAddValue() {
    this.addValue = undefined;
  }

  onEdit(value: string, index: number) {
    if (!value) return;

    this.value = value as string;

    this.items.splice(index, 1);
    this.itemsChange.emit(this.items);
  }

  onRemove(index: number) {
    this.items.splice(index, 1);
    this.itemsChange.emit(this.items);
  }

  onOpenURL(event: MouseEvent, url: string) {
    event.stopPropagation();

    this.urlService.openOrCopyUrl({ event, url });
  }

  onRemoveAll() {
    const ingredientsCopy = this.items;

    this.items = [];
    this.itemsChange.emit(this.items);

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.items = ingredientsCopy;
      this.itemsChange.emit(this.items);
    });
  }

  onFormfieldActionClicked(key: string) {}
}
