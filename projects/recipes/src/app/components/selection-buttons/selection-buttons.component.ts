import { Component, EventEmitter, Input, Output } from "@angular/core";
import { cloneDeep } from "lodash";
import { MENU_SELECT_ITEMS } from "../../data/menu-select.data";

@Component({
  selector: "app-selection-buttons",
  templateUrl: "./selection-buttons.component.html",
  styleUrls: ["./selection-buttons.component.scss"],
})
export class SelectionButtonsComponent<ValueType> {
  @Input() list: ValueType[];
  @Input() selected: ValueType[];
  @Input() isSelectionMode: boolean;
  @Input() equalFunction: (val1: ValueType, val2: ValueType) => boolean;

  @Input() buttonText: string;
  @Input() buttonIcon: string;
  @Input() buttonApplyText: string;
  @Input() buttonApplyTextReplace: string;
  @Input() buttonApplyIcon: string;

  @Output() isSelectionModeChange = new EventEmitter<boolean>();
  @Output() selectedChange = new EventEmitter<ValueType[]>();
  @Output() apply = new EventEmitter();

  MENU_SELECT_ITEMS = MENU_SELECT_ITEMS;

  onStartSelection() {
    this.isSelectionMode = true;
    this.isSelectionModeChange.emit(this.isSelectionMode);
  }

  onStopSelection() {
    this.isSelectionMode = false;
    this.selected = [];
    this.isSelectionModeChange.emit(this.isSelectionMode);
    this.selectedChange.emit(this.selected);
  }

  selectAll() {
    this.selected = this.list;
    this.selectedChange.emit(this.selected);
  }

  selectNone() {
    this.selected = [];
    this.selectedChange.emit(this.selected);
  }

  invertSelected() {
    const allIngredients = cloneDeep(this.list);
    const ingredientsNew = allIngredients.filter(
      (ingr) => !this.selected.some((i) => this.equalFunction(i, ingr))
    );
    this.selected = ingredientsNew;
    this.selectedChange.emit(this.selected);
  }

  onCheckMenuItemClick(value: string) {
    switch (value) {
      case "select-all":
        this.selectAll();
        break;

      case "select-none":
        this.selectNone();
        break;

      case "select-invert":
        this.invertSelected();
        break;

      default:
        break;
    }
  }
}
