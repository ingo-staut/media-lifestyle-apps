import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Subject, startWith, takeUntil } from "rxjs";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { findByType } from "shared/models/type.function";

@Component({
  selector: "app-dropdown-with-groups[parentFormGroup]",
  templateUrl: "./dropdown-with-groups.component.html",
  styleUrls: ["./dropdown-with-groups.component.scss"],
})
export class DropdownWithGroupsComponent<EntryType> implements OnInit, OnDestroy {
  @Input() parentFormGroup: FormGroup;
  @Input() formfieldKey: string;
  @Input() formfieldName: string;
  @Input() noneValue: EntryType;
  @Input() noneText: string;
  @Input() noneIcon: string;
  @Input() defaultText: string;
  @Input() groups: ReadonlyArray<Group<EntryType>>;
  @Input() width?: string;
  @Input() maxWidth?: string;
  @Input() required?: boolean = false;
  @Input() noBackground?: boolean = false;
  @Input() biggerDropdout?: boolean = false;

  @Output() onChange: EventEmitter<EntryType> = new EventEmitter<EntryType>();
  @Output() onContextMenuClick: EventEmitter<EntryType> = new EventEmitter<EntryType>();

  private readonly destroySubject = new Subject<void>();

  selected: Entry<EntryType>;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.style.width = this.width ?? "unset";
    this.elementRef.nativeElement.style.maxWidth = this.maxWidth ?? "unset";
    this.parentFormGroup.controls[this.formfieldKey]?.valueChanges
      .pipe(
        startWith(this.parentFormGroup.controls[this.formfieldKey].value ?? 0),
        takeUntil(this.destroySubject)
      )
      .subscribe((value) => {
        this.selected = findByType(
          value,
          this.groups,
          this.defaultText || this.noneText,
          undefined,
          this.noneIcon
        );
        this.onChange.emit(value);
      });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onSelectChanged(value: EntryType) {
    this.selected = findByType(
      value,
      this.groups,
      this.defaultText || this.noneText,
      undefined,
      this.noneIcon
    );
  }

  onContextMenu(event: Event, entry: Entry<EntryType>) {
    event.preventDefault();

    this.onContextMenuClick.emit(entry.type);
  }
}
