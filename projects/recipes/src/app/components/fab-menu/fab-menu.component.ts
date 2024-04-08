import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { DialogAction } from "shared/models/dialog-action.type";
import { isValidHttpUrl } from "shared/utils/url";

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

  async onAddClicked() {
    const textFromClipboard = await navigator.clipboard.readText();
    const url = isValidHttpUrl(textFromClipboard) ? textFromClipboard : undefined;

    if (!this.menuItems.length && url) this.onActionClicked("more");
    else if (!this.menuItems.length) this.onActionClicked("create-recipe");
    else this.openAddMenu = !this.openAddMenu;
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
