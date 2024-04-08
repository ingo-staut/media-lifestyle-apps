import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatCalendarCellClassFunction } from "@angular/material/datepicker";
import moment, { Moment } from "moment";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { Ingredient } from "../../models/ingredient.class";

@Component({
  selector: "app-button-use-until[ingredient]",
  templateUrl: "./button-use-until.component.html",
  styleUrls: ["./button-use-until.component.scss"],
})
export class ButtonUseUntilComponent {
  @Input() ingredient: Ingredient;
  @Input() show: boolean = true;
  @Input() showDatePickerPopoutOnRightSide: boolean = false;

  @Output() dateChange = new EventEmitter<Date | null>();

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  inThreeDays = DateFns.addDaysToDate(new Date(), 3);
  inOneWeek = DateFns.addDaysToDate(new Date(), 7);
  inOneMonth = DateFns.addMonthsToDate(new Date(), 1);

  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, protected localeService: LocaleService) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      date: this.ingredient.useUntil ? moment(this.ingredient.useUntil) : null,
    });

    this.formGroup.controls["date"].valueChanges.subscribe((value) => {
      this.dateChange.emit(value ? value.toDate() : null);
    });
  }

  onRemoveDate() {
    this.formGroup.controls["date"].setValue(null);
  }

  onInThreeDays() {
    this.formGroup.controls["date"].setValue(moment(this.inThreeDays));
  }

  onInOneWeek() {
    this.formGroup.controls["date"].setValue(moment(this.inOneWeek));
  }

  onInOneMonth() {
    this.formGroup.controls["date"].setValue(moment(this.inOneMonth));
  }

  dateClass: MatCalendarCellClassFunction<Moment> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === "month") {
      // Highlight the 1st and 20th day of each month.
      return DateFns.isBeforeToday(cellDate.toDate()) ? "warn" : "";
    }

    return "";
  };
}
