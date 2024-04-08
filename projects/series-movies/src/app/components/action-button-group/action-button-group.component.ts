import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ActionButton } from "shared/models/dialog-input.type";
import { UrlService } from "../../../../../../shared/services/url.service";

@Component({
  selector: "app-action-button-group [buttons]",
  templateUrl: "./action-button-group.component.html",
  styleUrls: ["./action-button-group.component.scss"],
})
export class ActionButtonGroupComponent {
  @Input() buttons: ActionButton[] = [];

  @Output() onClick = new EventEmitter<number>();

  constructor(private urlService: UrlService) {}

  onActionButtonClick(event: MouseEvent, action: ActionButton, index: number) {
    if (action.func) {
      action.func(event, this.urlService);
    }

    this.onClick.emit(index);
  }
}
