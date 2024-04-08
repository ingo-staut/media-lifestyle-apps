import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  ButtonTristate,
  getButtonTristateIndexByType,
  getNextButtonTristateByType,
} from "shared/models/enum/button-tristate.enum";
import { FilterButtonTristate } from "../../models/filter-button-tristate.type";

@Component({
  selector: "app-button-tristate-filter",
  templateUrl: "./button-tristate-filter.component.html",
  styleUrls: ["./button-tristate-filter.component.scss"],
})
export class ButtonTristateFilterComponent {
  @Input() filterButton: FilterButtonTristate;

  @Output() change = new EventEmitter<ButtonTristate>();

  ButtonTristate = ButtonTristate;
  hideTooltip = false;

  get index(): number {
    return getButtonTristateIndexByType(this.filterButton.value ?? ButtonTristate.NONE);
  }

  onClick() {
    this.filterButton.value = getNextButtonTristateByType(
      this.filterButton.value ?? ButtonTristate.NONE
    );

    this.change.emit(this.filterButton.value);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.change.emit(ButtonTristate.NONE);
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    // Wert wird auf TRUE gesetzt, damit beim neuen
    // Hinzufügen des Filters direkt der Filter gesetzt wird
    this.filterButton.value = ButtonTristate.TRUE;
    this.filterButton.show = false;
    this.change.emit(this.filterButton.value);
  }
}
