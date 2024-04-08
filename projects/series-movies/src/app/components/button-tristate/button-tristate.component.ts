import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  ButtonTristate,
  getButtonTristateIndexByType,
  getNextButtonTristateByType,
  getNextButtonTwoStateByType,
} from "shared/models/enum/button-tristate.enum";

@Component({
  selector: "app-button-tristate",
  templateUrl: "./button-tristate.component.html",
  styleUrls: ["./button-tristate.component.scss"],
})
export class ButtonTristateComponent {
  @Input() state: ButtonTristate | null = ButtonTristate.NONE;
  @Input() icons: string[];
  @Input() texts?: string[];
  @Input() tooltips?: string[];
  @Input() colors?: string[];
  @Input() tabIndex?: number;
  @Input() twoStates?: boolean;

  @Output() stateChange = new EventEmitter<ButtonTristate>();

  ButtonTristate = ButtonTristate;

  get index(): number {
    return getButtonTristateIndexByType(this.state ?? ButtonTristate.NONE);
  }

  get tooltip(): string {
    return this.tooltips ? this.tooltips[this.index] : this.texts ? this.texts[this.index] : "";
  }

  get text(): string {
    return this.texts ? this.texts[this.index] : "";
  }

  get color(): string {
    if (this.twoStates) {
      return this.colors
        ? this.colors[this.index]
        : this.state === ButtonTristate.TRUE
        ? "primary"
        : "";
    }
    return this.colors
      ? this.colors[this.index]
      : this.state !== ButtonTristate.NONE
      ? "primary"
      : "";
  }

  get onlyIcon(): boolean {
    return !(this.texts && !!this.texts[this.index]);
  }

  onClick() {
    this.state = this.twoStates
      ? getNextButtonTwoStateByType(this.state ?? ButtonTristate.NONE)
      : getNextButtonTristateByType(this.state ?? ButtonTristate.NONE);

    this.stateChange.emit(this.state);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.stateChange.emit(ButtonTristate.NONE);
  }
}
