import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { DateAdapter, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDateRangePicker } from "@angular/material/datepicker";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import moment, { Moment } from "moment";
import { Subject, startWith, takeUntil } from "rxjs";
import { DropdownDataWithRange } from "shared/models/dropdown-data-with-range.type";
import { DropdownData } from "shared/models/dropdown.type";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns, DateRange } from "shared/utils/date-fns";
import { getTextWidth } from "shared/utils/html-element";
import { FilterFunctions } from "../../models/filter.functions";

@Component({
  selector: "app-dropdown-with-input",
  templateUrl: "./dropdown-with-input.component.html",
  styleUrls: ["./dropdown-with-input.component.scss"],
})
export class DropdownWithInputComponent<DropdownKeyType> implements OnDestroy {
  @Input() data: DropdownData<DropdownKeyType, DropdownDataWithRange>[] = [];
  @Input() selectedKey?: DropdownKeyType;
  @Input() width?: string;
  @Input() maxWidth?: string;
  @Input() tooltip?: string;
  @Input() isSmall?: boolean = false;
  @Input() blinkWhenValueSet?: boolean = true;
  @Input() withRemoveButton: boolean = true;
  @Input() extraIcon?: string;

  @Output() selectedChange = new EventEmitter<
    DropdownData<DropdownKeyType, DropdownDataWithRange>
  >();
  @Output() onRemove: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild("picker") picker: MatDateRangePicker<null>;

  private readonly destroySubject = new Subject<void>();

  DateFns = DateFns;
  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  range = new FormGroup({
    start: new FormControl<Moment | null>(null),
    end: new FormControl<Moment | null>(null),
  });

  selected: DropdownData<DropdownKeyType, DropdownDataWithRange>;
  hideTooltip = false;

  get selectedValue() {
    if (
      !this.selected ||
      !this.selected.value ||
      !(this.selected.value.range.from <= this.selected.value.range.to)
    )
      return -1;
    return DateFns.daysBetweenDates(this.selected.value.range.from, this.selected.value.range.to);
  }

  constructor(
    private myElement: ElementRef,
    private translateService: TranslateService,
    private adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private locale: string
  ) {}

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

    const x = this.data.find((d) => d.value?.showDateInputs);
    if (x) {
      const start =
        x.value?.range.from !== DateFns.firstDate ? moment(x.value?.range.from ?? null) : null;
      const end = x.value?.range.to !== DateFns.lastDate ? moment(x.value?.range.to ?? null) : null;

      this.range.controls.start.setValue(start);
      this.range.controls.end.setValue(end);
    }

    this.range.valueChanges.subscribe((value) => {
      this.setSelectedDateWithDates(value.start?.toDate(), value.end?.toDate());
    });

    // Für später, wenn Settings
    // aus dem Rezepte-Dialog heraus geöffnet wird
    this.translateService.onLangChange
      .pipe(
        takeUntil(this.destroySubject),
        startWith({ lang: this.translateService.currentLang } as LangChangeEvent)
      )
      .subscribe((e) => {
        this.locale = e.lang;
        this.adapter.setLocale(e.lang);
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

  onInputChange(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    if (!text) return;
    this.setSelectedDateWithDays(+text);
  }

  setSelectedDateWithDays(days: number) {
    const range = FilterFunctions.getDateRangeByDays(days, this.selectedKey as string);
    this.selected.value = { ...this.selected.value, range };

    this.selectedChange.emit(this.selected);
  }

  setSelectedDateWithDates(from?: Date | null, to?: Date | null) {
    const dateRange: DateRange = {
      from: from ?? DateFns.firstDate,
      to: to ?? DateFns.lastDate,
    };
    this.selected.value = { ...this.selected.value, range: dateRange };

    this.selectedChange.emit(this.selected);
  }

  onRemoveClick(event: Event): void {
    event.stopPropagation();
    this.onRemove.emit();
  }

  onMenuItemClicked(entry: DropdownData<DropdownKeyType, DropdownDataWithRange>) {
    if (entry.value?.showDateInputs) {
      setTimeout(() => {
        this.picker.open();
      }, 0);
    }
  }
}
