import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { AbstractControl, FormGroup, Validators } from "@angular/forms";
import { DateAdapter, MAT_DATE_LOCALE } from "@angular/material/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import moment from "moment";
import { Observable, Subject, map, startWith, takeUntil } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { CSS_ENTER_KEY_HINT } from "shared/models/css-types.type";
import { FormfieldType, SuffixPadding } from "shared/models/enum/formfield.enum";
import { SliderIcons } from "shared/models/enum/slider-icons.enum";
import { LocaleService } from "shared/services/locale.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { getTextWidth } from "shared/utils/html-element";
import { getSliderSettings } from "shared/utils/slider";
import { URL_FAVICON, isValidHttpUrl } from "shared/utils/url";
import { UrlService } from "../../../../../../shared/services/url.service";

const TIME_PICKER_INPUT = ".ngx-timepicker-control__input";

@Component({
  selector: "app-formfield[parentFormGroup][formfieldType][formfieldName][formfieldKey]",
  templateUrl: "./formfield.component.html",
  styleUrls: ["./formfield.component.scss"],
})
export class FormfieldComponent<ValueType> implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() isSmall = false;
  @Input() parentFormGroup: FormGroup;
  @Input() formfieldType: FormfieldType;
  @Input() formfieldName: string;
  @Input() formfieldKey: string;
  @Input() formfieldIcon: string;
  @Input() required: boolean = false;
  @Input() value: ValueType;
  @Input() hint?: string | undefined;
  @Input() minLength: number;
  @Input() maxLength: number;
  @Input() pattern: string;
  @Input() min?: number = 0;
  @Input() max?: number;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() sliderMin?: number;
  @Input() sliderMax?: number;
  @Input() sliderSteps?: number;
  @Input() sliderNoNumberFormatting?: boolean;
  @Input() formatAsDuration?: boolean;
  @Input() decimals: boolean = true;
  @Input() suffixLong: string = "";
  @Input() suffixShort: string = "";
  @Input() suffixPadding: SuffixPadding = SuffixPadding.NONE;
  @Input() suffix: string;
  @Input() enterKeyHint: CSS_ENTER_KEY_HINT = "done";
  @Input() disabled?: boolean;
  @Input() tabIndex?: number;
  @Input() minutesSteps?: number;
  @Input() showSlider?: boolean = false; // Slider kann durch klicken angezeigt werden
  @Input() hideSliderInitially?: boolean = false; // Slider wird initial angezeigt
  @Input() sliderWithIcons?: SliderIcons; // Default-Wert unten gesetzt
  @Input() completerList?: string[] | CompleterEntry[] | null = null;
  @Input() completerInitialOpen: boolean = false;

  @Output() proofSavingAllowed = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() onActionClicked = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<ValueType>();

  @ViewChild("input") inputRef: ElementRef<HTMLInputElement>;
  @ViewChild("dateInput") dateInputRef: ElementRef<HTMLInputElement>;
  @ViewChild("timeInput") timeInputRef: ElementRef<HTMLElement>;
  @ViewChild("textarea") textareaRef: ElementRef<HTMLTextAreaElement>;
  @ViewChild("suffixRef") suffixRef: ElementRef<HTMLElement>;

  FormfieldType = FormfieldType;
  SliderIcons = SliderIcons;
  moment = moment;

  URL_FAVICON = URL_FAVICON;
  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  MIN_VALUE = Number.MIN_VALUE;

  private readonly destroySubject = new Subject<void>();

  control: AbstractControl;
  _numberInputWithSlider: boolean = false;
  _sliderStep: number = 1;
  _sliderMax: number = 10;
  _sliderMin: number = 0;
  _value: number = 0;

  filteredOptions: Observable<CompleterEntry[]>;
  _completerList: CompleterEntry[] = [];

  image?: string;
  sliderTouched = false;
  hideTooltip = false;

  get dynamicPattern() {
    // WORKAROUND damit die Validation richtig funktioniert
    if (this.formfieldType === FormfieldType.TEXT)
      return this.pattern ?? `.{${this.minLength ?? 0},${this.maxLength ?? ""}}`;
    return "";
  }

  get hasFocus() {
    if (this.formfieldType === FormfieldType.TEXT || this.formfieldType === FormfieldType.NUMBER)
      return this.inputRef?.nativeElement === document.activeElement;
    if (this.formfieldType === FormfieldType.DATE)
      return this.dateInputRef?.nativeElement === document.activeElement;
    if (this.formfieldType === FormfieldType.TEXTAREA)
      return this.textareaRef?.nativeElement === document.activeElement;
    return false;
  }

  sliderLabelText = (value: number) => "";

  constructor(
    private adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private locale: string,
    protected translateService: TranslateService,
    protected localeService: LocaleService,
    private urlService: UrlService
  ) {}

  ngOnInit(): void {
    this.sliderWithIcons = this.sliderWithIcons ?? SliderIcons.ICON_ZERO_VALUE;

    this.sliderLabelText = (value: number) => {
      if (
        this.sliderWithIcons &&
        (this.sliderWithIcons === SliderIcons.ICON_ZERO_VALUE ||
          this.sliderWithIcons === SliderIcons.ICON_ZERO_ONE_VALUE) &&
        value === 0
      ) {
        return "✖";
      } else if (
        this.sliderWithIcons &&
        this.sliderWithIcons === SliderIcons.ICON_ZERO_ONE_VALUE &&
        value === 1
      ) {
        return "✔";
      }

      if (this.formatAsDuration) {
        return DateFns.formatDuration(value, false, this.translateService.currentLang);
      }

      return value.toString() + (this.suffixShort ? " " + this.suffixShort : "");
    };

    this.control = this.parentFormGroup.controls[this.formfieldKey];
    this._value = this.control.value || 0;

    if (
      this.formfieldType === FormfieldType.NUMBER &&
      this.showSlider &&
      !this.hideSliderInitially
    ) {
      const { step, max, show } = getSliderSettings(this.control.value || 0);
      this._numberInputWithSlider = show || this.sliderSteps !== undefined;
      this._sliderStep = this.sliderSteps ?? step;
      this._sliderMax = this.sliderMax
        ? this.sliderMax >= this._value
          ? this.sliderMax
          : this.max ?? max
        : this.max ?? max;
      this._sliderMin = this.sliderMin
        ? this.sliderMin < this._value || this._value === 0 || this._value === null
          ? this.sliderMin
          : this.min ?? 0
        : this.min ?? 0;
    }

    this.suffix = this.suffixLong;

    if (this.required && this.formfieldType === FormfieldType.NUMBER) {
      this.control.addValidators([Validators.required, Validators.min(Number.MIN_VALUE)]);
    } else if (this.required) {
      this.control.addValidators([Validators.required]);
    }
    if (this.min) {
      this.control.addValidators([Validators.min(this.min)]);
    }
    if (this.max) {
      this.control.addValidators([Validators.max(this.max)]);
    }
    if (this.minLength) {
      this.control.addValidators([Validators.minLength(this.minLength)]);
    }
    if (this.maxLength) {
      this.control.addValidators([Validators.maxLength(this.maxLength)]);
    }
    if (this.pattern) {
      this.control.addValidators([Validators.pattern(this.pattern)]);
    }
    if (this.disabled) {
      this.control.disable();
    }

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

    this.control.valueChanges
      .pipe(takeUntil(this.destroySubject), startWith(this.control.value))
      .subscribe((value) => {
        this.image = this._completerList?.find(
          (item) => item.text?.toLowerCase() === value?.toLowerCase()
        )?.image;
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.suffix) this.updateSuffix();
    }, 0);

    this.control.valueChanges.pipe(takeUntil(this.destroySubject)).subscribe((value) => {
      this.valueChange.emit(value);

      this._value = value || 0;

      setTimeout(() => {
        if (this.suffix) this.updateSuffix();
      }, 0);
    });

    this.filteredOptions = this.control.valueChanges.pipe(
      map((value) => {
        const list = this.completerInitialOpen
          ? this._filter(value || "")
          : value
          ? value.length >= 1
            ? this._filter(value || "")
            : []
          : [];
        return list;
      })
    );

    // Wenn in das Minuten-Feld geklickt wird,
    // den Klick nicht weitergeben (sonst wird automatisch das Stunden-Feld geklickt)
    if (this.timeInputRef) {
      const inputs =
        this.timeInputRef.nativeElement.querySelectorAll<HTMLInputElement>(TIME_PICKER_INPUT);

      if (inputs.length >= 2) {
        const minuteInput = inputs[1];
        minuteInput.addEventListener("click", (event) => {
          event.stopPropagation();
          minuteInput.select();
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Wenn sich ein Teil des Suffix ändert, wird der Suffix neu gesetzt
    // if (
    //   changes["suffixLong"]?.currentValue !== changes["suffixLong"]?.previousValue ||
    //   changes["suffixShort"]?.currentValue !== changes["suffixShort"]?.previousValue
    // ) {
    //   this.suffix = this.suffixLong;
    //   this.updateSuffix();
    // }

    if (changes["completerList"] && changes["completerList"].currentValue) {
      // Type-Guard: Liste mit Strings zu einer Liste mit CompleterEntry konvertieren
      if (Array.isArray(this.completerList) && typeof this.completerList[0] === "string") {
        this._completerList = this.completerList.map((value) => {
          const entry: CompleterEntry = { text: value as string };
          return entry;
        });
      } else if (this.completerList) {
        this._completerList = this.completerList as CompleterEntry[];
      }
    }

    if (changes["disabled"] && !changes["disabled"].firstChange) {
      if (changes["disabled"].currentValue) this.control.disable();
      else this.control.enable();
    }

    if (changes["max"] && !changes["max"].firstChange && changes["max"].currentValue) {
      this.max = changes["max"].currentValue;
      this.control.clearValidators();
      this.control.addValidators([Validators.max(this.max || 1)]);
    }

    if (changes["sliderMax"] && !changes["sliderMax"].firstChange) {
      this._sliderMax = changes["sliderMax"].currentValue;
    }
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  private _filter(value: string): CompleterEntry[] {
    value = value.trim().toLowerCase();
    if (!value) return [];
    return this._completerList.filter((v) => v.text.toLowerCase().includes(value));
  }

  isAutoCompleteClosed() {
    return document.getElementsByClassName("autocompleter-option-in-dropdown").length === 0;
  }

  onReturnPressed() {
    if (this.isAutoCompleteClosed()) this.submit.emit();
  }

  onFocus() {
    // WORKAROUND damit der Suffix korrekt angezeigt wird
    setTimeout(() => {
      if (this.inputRef.nativeElement === document.activeElement) {
        this.suffix = this.suffixShort;
      }
    }, 100);
  }

  onBlur() {
    // WORKAROUND damit der Suffix korrekt angezeigt wird
    setTimeout(() => {
      if (this.inputRef.nativeElement !== document.activeElement) {
        this.suffix = this.suffixLong;
      }
    }, 100);
  }

  onUp() {
    this.control.setValue(+this.parentFormGroup.controls[this.formfieldKey].value + 1);
    this.control.markAsDirty();
    this.proofSavingAllowed.emit();
  }

  onDown() {
    this.control.setValue(
      Math.max(this.parentFormGroup.controls[this.formfieldKey].value - 1, this.min ?? 0)
    );
    this.control.markAsDirty();
    this.proofSavingAllowed.emit();
  }

  onAddDaysToDate(days: number) {
    const value = this.parentFormGroup.controls[this.formfieldKey].value;
    this.control.setValue(
      moment(DateFns.addDaysToDate(value ? moment(value).toDate() : new Date(), days))
    );
    this.control.markAsDirty();
    this.proofSavingAllowed.emit();
  }

  onAddMonthsToDate(months: number) {
    const value = this.parentFormGroup.controls[this.formfieldKey].value;
    this.control.setValue(
      moment(DateFns.addMonthsToDate(value ? moment(value).toDate() : new Date(), months))
    );
    this.control.markAsDirty();
    this.proofSavingAllowed.emit();
  }

  onClear() {
    this._value = 0;
    this.control.setValue(0);
    this.control.markAsTouched();
    this.sliderTouched = true;
  }

  updateSuffix() {
    const width = getTextWidth(this.inputRef?.nativeElement.value);
    if (this.suffixRef)
      this.suffixRef.nativeElement.style.left =
        width + (this.formfieldIcon ? (this.isSmall ? 30 : 40) : 10) + this.suffixPadding + "px";
  }

  timeValueChanged(timeString: string) {
    this.control.setValue(timeString);
  }

  onTimePickerClicked() {
    const inputs =
      this.timeInputRef.nativeElement.querySelectorAll<HTMLInputElement>(TIME_PICKER_INPUT);

    if (inputs.length) {
      inputs[0].focus();
      inputs[0].select();
    }
  }

  setTimeNow() {
    const time = DateFns.formatDateAsTimeString(
      DateFns.roundDateTimeToMinutes(new Date(), this.minutesSteps ?? 1),
      this.translateService.currentLang
    );
    this.control.setValue(time);
  }

  setDateNow() {
    this.control.setValue(moment(new Date()));
  }

  onValueChange(value: number) {
    this.control.setValue(value);
    this.valueChange.emit(value as ValueType);
    this.sliderTouched = true;
    this.control.markAsTouched();
  }

  onDecorativeButtonClick(event: MouseEvent) {
    event.stopPropagation();

    if (this.showSlider) {
      this._numberInputWithSlider = !this._numberInputWithSlider;

      // Nochmal neu berechnen wenn zwischen Slider und Numernfeld gewechselt wurde
      if (
        this.formfieldType === FormfieldType.NUMBER &&
        this.showSlider &&
        this._numberInputWithSlider
      ) {
        const { step, max } = getSliderSettings(this.control.value || 0);
        this._sliderStep = this.sliderSteps ?? step;
        this._sliderMax = this.sliderMax ?? this.max ?? max;
      }
    } else if (isValidHttpUrl(this.control.value)) {
      this.urlService.openOrCopyUrl({ event, url: this.control.value, season: 1, episode: 1 });
    } else {
      this.inputRef.nativeElement.focus();
      this.onActionClicked.emit(this.formfieldName);

      setTimeout(() => {
        if (this.suffix) this.updateSuffix();
      }, 0);
    }
  }

  onSliderDecorativeButtonClick(event: Event) {
    event.stopPropagation();

    this._numberInputWithSlider = !this._numberInputWithSlider;

    setTimeout(() => {
      this.inputRef.nativeElement.focus();
      if (this.suffix) this.updateSuffix();
    }, 0);
  }

  onClearTime(event: Event) {
    event.stopPropagation();
    this.control.setValue("00:00");
    this.parentFormGroup.markAsDirty();
    this.onTimePickerClicked();
    this.proofSavingAllowed.emit();
  }

  onClearTextNumber(event: Event) {
    event.stopPropagation();
    this.image = undefined;
    this.control.reset();
    this.parentFormGroup.markAsDirty();
    this.inputRef.nativeElement.focus();
    this.proofSavingAllowed.emit();
  }

  onClearDate(event: Event) {
    event.stopPropagation();
    this.control.reset();
    this.parentFormGroup.markAsDirty();
    this.dateInputRef.nativeElement.focus();
    this.proofSavingAllowed.emit();
  }
}
