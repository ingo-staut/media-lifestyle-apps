import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CheckButton } from "shared/models/checkbutton.type";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";

@Component({
  selector: "app-check-button-group",
  templateUrl: "./check-button-group.component.html",
  styleUrls: ["./check-button-group.component.scss"],
})
export class CheckButtonGroupComponent<CheckButtonType> {
  @Input() buttons: CheckButton<CheckButtonType>[] = [];
  @Input() twoStates?: boolean;

  @Output() buttonsChange = new EventEmitter<CheckButton<CheckButtonType>[]>();

  onClick(index: number, state: ButtonTristate) {
    this.buttons[index].state = state;
    this.buttonsChange.emit(this.buttons);
  }
}
