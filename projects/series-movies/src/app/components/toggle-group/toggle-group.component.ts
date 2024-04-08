import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { DropdownData } from "shared/models/dropdown.type";

@Component({
  selector: "app-toggle-group",
  templateUrl: "./toggle-group.component.html",
  styleUrls: ["./toggle-group.component.scss"],
})
export class ToggleGroupComponent<DropdownKeyType, DropdownValueType> implements OnInit, OnChanges {
  @Input() value: DropdownKeyType;
  @Input() data: DropdownData<DropdownKeyType, DropdownValueType>[];
  @Input() showText?: boolean;
  @Input() showTextOnlySelected?: boolean;
  @Input() shrinkable?: boolean;
  @Input() ifFirstValueSelectedThenClose?: boolean;
  @Input() closeIfSelected?: boolean;
  @Input() highlightIfClosedAndNotFirstValue?: boolean;
  @Input() showAnimation?: boolean;

  @Output() valueChange = new EventEmitter<DropdownKeyType>();

  showToggle = true;
  _showButtonAnimation = false;

  get width() {
    return 43 * this.data.length + (this.showTextOnlySelected ? 70 : 0);
  }

  ngOnInit(): void {
    if (this.ifFirstValueSelectedThenClose) this.showToggle = !(this.data[0].key === this.value);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["value"]) this.valueChange.emit(this.value);
  }

  onToggleButtonClick(index: number) {
    this._showButtonAnimation = true;

    if (this.ifFirstValueSelectedThenClose) this.showToggle = index !== 0;
    if (this.closeIfSelected) this.showToggle = !this.closeIfSelected;

    setTimeout(() => {
      this._showButtonAnimation = false;
    }, 500);
  }

  onButtonClick() {
    this.showToggle = true;
  }
}
