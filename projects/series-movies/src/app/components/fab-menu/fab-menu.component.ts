import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { DialogAction } from "shared/models/dialog-action.type";

@Component({
  selector: "app-fab-menu",
  templateUrl: "./fab-menu.component.html",
  styleUrls: ["./fab-menu.component.scss"],
})
export class FabMenuComponent {
  @Input() menuItems: DialogAction[] = [];
  @Input() styleBottomPosition: number = 100;

  @Output() actionClicked = new EventEmitter<string>();

  private wasInside = false;

  openAddMenu = false;

  onActionClicked(key: string) {
    this.openAddMenu = false;
    this.actionClicked.emit(key);
  }

  @HostListener("click")
  clickInside() {
    this.wasInside = true;
  }

  @HostListener("document:click")
  clickout() {
    if (!this.wasInside) {
      this.openAddMenu = false;
    }
    this.wasInside = false;
  }
}
