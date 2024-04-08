import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Subject, startWith, takeUntil } from "rxjs";
import { DropdownDataWithNumberRange } from "shared/models/dropdown-data-with-number-range.type";
import { DropdownData } from "shared/models/dropdown.type";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns, NumberRange } from "shared/utils/date-fns";
import { getTextWidth } from "shared/utils/html-element";

@Component({
  selector: "app-dropdown-with-number-range",
  templateUrl: "./dropdown-with-number-range.component.html",
  styleUrls: ["./dropdown-with-number-range.component.scss"],
})
export class DropdownWithNumberRangeComponent<DropdownKeyType> implements OnDestroy {
  @Input() data: DropdownData<DropdownKeyType, DropdownDataWithNumberRange>[] = [];
  @Input() selectedKey?: DropdownKeyType;
  @Input() width?: string;
  @Input() maxWidth?: string;
  @Input() tooltip?: string;
  @Input() isSmall?: boolean = false;
  @Input() blinkWhenValueSet?: boolean = true;
  @Input() withRemoveButton: boolean = true;
  @Input() extraIcon?: string;

  @Output() selectedChange = new EventEmitter<
    DropdownData<DropdownKeyType, DropdownDataWithNumberRange>
  >();
  @Output() onRemove: EventEmitter<void> = new EventEmitter<void>();

  private readonly destroySubject = new Subject<void>();

  DateFns = DateFns;
  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  range = new FormGroup({
    start: new FormControl<number | null>(null),
    end: new FormControl<number | null>(null),
  });

  selected: DropdownData<DropdownKeyType, DropdownDataWithNumberRange>;

  get valueIsSet() {
    return (
      this.selected &&
      this.selected.value &&
      (this.selected.value.range.from || this.selected.value.range.to) &&
      (this.selected.value.range.from ?? 0) <= (this.selected.value.range.to || Infinity)
    );
  }

  constructor(private myElement: ElementRef, private translateService: TranslateService) {}

  ngOnInit(): void {
    this.selectedKey = this.selectedKey ?? this.data[0].key;
    this.selected = this.data.filter((r) => r.key === this.selectedKey)[0];

    this.myElement.nativeElement.style.maxWidth = this.maxWidth ?? "unset";

    this.translateService.onLangChange
      .pipe(startWith(null), takeUntil(this.destroySubject))
      .subscribe(() => {
        this.myElement.nativeElement.style.width =
          this.width ??
          this.calcLongestNameWidthInData() +
            (this.data.some((d) => !!d.icon) ? 90 : 70) +
            (this.withRemoveButton ? 40 : 0) +
            "px";
      });

    const hasShowNumbersInput = this.data.find((d) => d.value?.showNumberInputs);
    if (hasShowNumbersInput) {
      this.range.controls.start.setValue(hasShowNumbersInput.value?.range.from ?? null);
      this.range.controls.end.setValue(hasShowNumbersInput.value?.range.to ?? null);
    }

    this.range.valueChanges.subscribe((value) => {
      this.setSelectedDateWithDates(value.start ?? null, value.end ?? null);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedKey"]) {
      this.selected = this.data.filter((r) => r.key === this.selectedKey)[0];
    }
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onSelectChanged(event: DropdownKeyType) {
    this.selectedKey = event;
    this.selected = this.data.filter((r) => r.key === event)[0];
    this.selectedChange.emit(this.selected);
  }

  calcLongestNameWidthInData(): number {
    return Math.max(
      ...this.data.map((r) => {
        return getTextWidth(this.translateService.instant(r.name));
      })
    );
  }

  onInputClicked(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFromInputChange(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    if (!text) return;

    const from = +text || null;
    this.setSelectedDateWithDays({ to: this.selected.value?.range.to ?? null, from });
  }

  onToInputChange(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    if (!text) return;

    const to = +text || null;
    this.setSelectedDateWithDays({ from: this.selected.value?.range.from ?? null, to });
  }

  setSelectedDateWithDays(range: NumberRange) {
    this.selected.value = {
      ...this.selected.value,
      min: this.selected.value!.min,
      max: this.selected.value!.max,
      range,
    };

    this.selectedChange.emit(this.selected);
  }

  setSelectedDateWithDates(from: number | null, to: number | null) {
    const numberRange: NumberRange = {
      from: from,
      to: to,
    };
    this.selected.value = {
      ...this.selected.value,
      min: this.selected.value!.min,
      max: this.selected.value!.max,
      range: numberRange,
    };

    this.selectedChange.emit(this.selected);
  }

  onRemoveClick(event: Event): void {
    event.stopPropagation();
    this.onRemove.emit();
  }
}
