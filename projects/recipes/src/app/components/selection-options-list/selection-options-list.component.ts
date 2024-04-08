import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ItemInListPipe } from "shared/pipes/list.pipe";

@Component({
  selector: "app-selection-options-list",
  templateUrl: "./selection-options-list.component.html",
  styleUrls: ["./selection-options-list.component.scss"],
})
export class SelectionOptionsListComponent<ValueType> {
  @Input() list: ValueType[];
  @Input() selected: ValueType[];
  @Input() equalFunction: (val1: ValueType, val2: ValueType) => boolean;

  @Output() selectedChange = new EventEmitter<ValueType[]>();

  constructor(private itemInListPipe: ItemInListPipe) {}

  onOptionClick(item: ValueType) {
    const alreadySelected = this.itemInListPipe.transform(item, this.equalFunction, this.selected);

    if (!alreadySelected) {
      this.selected.push(item);
    } else {
      this.selected = this.selected.filter((ingr) => !this.equalFunction(ingr, item));
    }

    this.selectedChange.emit(this.selected);
  }
}
