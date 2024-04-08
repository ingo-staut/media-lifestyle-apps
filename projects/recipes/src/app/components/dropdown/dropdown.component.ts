import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject, startWith, takeUntil } from "rxjs";
import { DropdownData } from "shared/models/dropdown.type";
import { getTextWidth } from "shared/utils/html-element";

@Component({
  selector: "app-dropdown[data][selectedKey]",
  templateUrl: "./dropdown.component.html",
  styleUrls: ["./dropdown.component.scss"],
})
export class DropdownComponent<DropdownKeyType, DropdownValueType>
  implements OnInit, OnChanges, OnDestroy
{
  @Input() data: DropdownData<DropdownKeyType, DropdownValueType>[] = [];
  @Input() selectedKey?: DropdownKeyType;
  @Input() width?: string;
  @Input() maxWidth?: string;
  @Input() tooltip?: string;
  @Input() isSmall?: boolean = false;
  @Input() withBackground: boolean = true;
  @Input() tabIndex?: number = 0;
  @Input() disabled?: boolean = false;

  @Output() selectedChange = new EventEmitter<DropdownData<DropdownKeyType, DropdownValueType>>();
  @Output() selectedInitial = new EventEmitter<DropdownData<DropdownKeyType, DropdownValueType>>();
  @Output() selectedKeyChange = new EventEmitter<DropdownKeyType>();
  @Output() selectedKeyInitial = new EventEmitter<DropdownKeyType>();

  private readonly destroySubject = new Subject<void>();

  selected: DropdownData<DropdownKeyType, DropdownValueType>;

  constructor(private myElement: ElementRef, private translateService: TranslateService) {}

  ngOnInit(): void {
    this.selectedKey = this.selectedKey ?? this.data[0].key;
    this.selected = this.data.filter((r) => r.key === this.selectedKey)[0];

    this.selectedInitial.emit(this.selected);

    this.myElement.nativeElement.style.maxWidth = this.maxWidth ?? "unset";

    this.translateService.onLangChange
      .pipe(startWith(null), takeUntil(this.destroySubject))
      .subscribe(() => {
        this.myElement.nativeElement.style.width =
          this.width ??
          this.calcLongestNameWidthInData() + (this.data.some((d) => !!d.icon) ? 90 : 70) + "px";
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
    this.selectedKeyChange.emit(this.selected.key);
  }

  calcLongestNameWidthInData(): number {
    return Math.max(
      ...this.data.map((r) => {
        return getTextWidth(this.translateService.instant(r.name));
      })
    );
  }
}
