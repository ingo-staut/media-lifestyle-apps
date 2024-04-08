import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ButtonIconDirective } from "shared/directives/button-icon.directive";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { SliderIcons } from "shared/models/enum/slider-icons.enum";
import { LocaleService } from "shared/services/locale.service";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { FilterButtonValue } from "../../models/filter-button-value.type";

@Component({
  selector: "app-button-value-filter",
  templateUrl: "./button-value-filter.component.html",
  styleUrls: ["./button-value-filter.component.scss"],
})
export class ButtonValueFilterComponent {
  @Input() filterButton: FilterButtonValue;

  @Output() change = new EventEmitter<FilterButtonValue>();

  constructor(
    private dialogService: DialogService,
    protected translateService: TranslateService,
    protected localeService: LocaleService
  ) {}

  onOpen() {
    const data: DialogData = {
      title: this.filterButton.texts[0],
      icons: [this.filterButton.iconDialog ?? this.filterButton.icons[0]],
      numberInputs: [
        {
          number: this.filterButton.value,
          icon: this.filterButton.icons[0],
          suffixLong: this.filterButton.suffixLong,
          suffixShort: this.filterButton.suffixShort,
          placeholder: this.filterButton.texts[1],
          max: this.filterButton.sliderAndValueMax,
          sliderMax: this.filterButton.sliderAndValueMax,
          sliderSteps: this.filterButton.sliderSteps,
          formatAsDuration: this.filterButton.sliderFormatAsDuration,
          hint: "HIDE_OR_SHOW_NULL_VALUE_HINT",
          showSlider: true,
          sliderWithIcons: SliderIcons.ICON_ZERO_ONE_VALUE,
        },
      ],
      buttonInputs: [
        {
          state: this.filterButton.min,
          texts: ["MIN_SHORT", "MAX_SHORT"],
          icons: ["min", "max"],
          placeholder: "MIN_OR_MAX_VALUE",
        },
        {
          state: this.filterButton.hideNullValues,
          texts: ["HIDE", "SHOW"],
          icons: ["hide", "show"],
          placeholder: "HIDE_OR_SHOW_NULL_VALUE",
        },
      ],
      actionCancel: true,
      actionPrimary: ActionKey.APPLY,
      actions: [
        {
          key: ActionKey.DELETE,
          text: "FILTER.REMOVE",
          icon: "filter-not",
          color: "warn",
          buttonIconDirective: ButtonIconDirective.NORMAL,
        },
      ],
      disableButtonsAndSetTrueIfValueOfNumberInputIsZero: true,
    };

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      if (result.actionApply) {
        this.filterButton.value = +result.numberInputs[0] ?? 0;

        if (this.filterButton.value === 0) {
          this.filterButton.min = false;
          this.filterButton.hideNullValues = false;
        } else if (this.filterButton.value === 1) {
          this.filterButton.min = true;
          this.filterButton.hideNullValues = true;
        } else {
          this.filterButton.min = result.buttonInputs[0].state;
          this.filterButton.hideNullValues = result.buttonInputs[1].state;
        }
        this.change.emit(this.filterButton);
      }

      if (result.actionDelete) {
        this.filterButton.value = 0;
        this.filterButton.show = false;
        this.filterButton.min = result.buttonInputs[0].state;
        this.filterButton.hideNullValues = result.buttonInputs[1].state;
        this.change.emit(this.filterButton);
      }
    });
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.filterButton.value = 0;
    this.filterButton.show = false;
    this.change.emit(this.filterButton);
  }
}
