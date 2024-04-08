import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { cloneDeep } from "lodash";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { ItemsType } from "shared/models/dialog-input.type";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { compareText } from "shared/utils/string";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Item } from "../../models/item.class";
import { IngredientConversionCompleterService } from "../../services/ingredient/ingredient-conversion.completer.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent<ItemType = string | Item> {
  @Input() items: ItemType[];
  @Input() itemsType: ItemsType;
  @Input() editable: boolean = true;
  @Input() maxHeight?: number;
  @Input() addIconWhenBigButton?: string = "";
  @Input() ingredientsConversion?: IngredientConversion[] | null;
  @Input() completerList?: string[] | CompleterEntry[] | null;
  @Input() firstCharToTitleCase?: boolean = true;
  @Input() showDeleteButton?: boolean = false;
  @Input() showAddFromClipboardButton?: boolean = false;
  @Input() smallerAddInputWidth?: boolean = false;

  @Output() itemsChange = new EventEmitter<ItemType[]>();
  @Output() itemChange = new EventEmitter<ItemType>();

  FormfieldType = FormfieldType;
  ItemsType = ItemsType;

  value = "";
  addValue?: string;
  addValueString?: string;
  addValueIndex?: number;

  constructor(
    private notificationService: NotificationService,
    protected ingredientConversionCompleterService: IngredientConversionCompleterService,
    private dialogService: DialogService
  ) {}

  drop(event: CdkDragDrop<ItemType[], any, any>) {
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

    if (this.itemsType === ItemsType.ITEM) {
      const index = this.items.findIndex(
        (item) => item instanceof Item && compareText(value, item.name)
      );
      // Ggf. Ersetzen (und hochzählen)
      if (index !== -1) {
        const item = this.items[index];
        this.addValue = value;
        this.addValueIndex = index;

        if (item instanceof Item) {
          this.addValueString = new Item(item).getItemDisplayString();
        }
      }
      // Hinzufügen
      else {
        this.items = [Item.parse(value) as ItemType, ...this.items];
      }
    } else {
      this.items = [
        this.itemsType === ItemsType.STRING ? (value as ItemType) : (Item.parse(value) as ItemType),
        ...this.items,
      ];
    }

    this.itemsChange.emit(this.items);
  }

  async onAddFromClipboard() {
    const text = await navigator.clipboard.readText();
    this.onAdd(text);
  }

  onReplaceValue() {
    if (this.addValueIndex !== undefined && this.addValue) {
      const item = this.items[this.addValueIndex];
      if (item instanceof Item) {
        item.quantity = item.quantity + 1;
      }
      // WORKAROUND: Neuladen der UI
      this.items = cloneDeep(this.items);

      this.addValue = undefined;
      this.addValueIndex = undefined;
    }
  }

  onAddValue() {
    // if (this.addValue && this.addValue instanceof Item) {
    if (this.addValue) {
      this.items = [Item.parse(this.addValue) as ItemType, ...this.items];

      this.addValue = undefined;
      this.addValueIndex = undefined;
    }
  }

  onClearAddValue() {
    this.addValue = undefined;
  }

  onEdit(value: ItemType, index: number) {
    if (!value) return;

    this.value = this.getItemString(value);

    this.items.splice(index, 1);
    this.itemsChange.emit(this.items);
  }

  onRemove(index: number) {
    this.items.splice(index, 1);
    this.itemsChange.emit(this.items);
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

  getItemString(item: ItemType) {
    return typeof item === "string" ? item : new Item(item as Item).getItemString();
  }

  onCountUp(event: Event, index: number) {
    event.stopPropagation();

    const value = this.items[index];
    if (typeof value === "string") {
      const item = Item.parse(value);
      item.quantity += 1;
      this.items[index] = item.getItemString() as ItemType;
    } else if (value instanceof Item) {
      const item = new Item(value as Item);
      item.quantity += 1;
      this.items[index] = item as ItemType;

      // ! Funktioniert irgendwie nicht
      // value.quantity += 1;
      // this.items[index] = value;
    }
  }

  onCountDown(event: Event, index: number) {
    event.stopPropagation();

    const value = this.items[index];
    if (typeof value === "string") {
      const item = Item.parse(value);
      item.quantity -= 1;
      this.items[index] = item.getItemString() as ItemType;
    } else if (value instanceof Item) {
      const item = new Item(value as Item);
      item.quantity -= 1;
      this.items[index] = item as ItemType;
    }
  }
}
