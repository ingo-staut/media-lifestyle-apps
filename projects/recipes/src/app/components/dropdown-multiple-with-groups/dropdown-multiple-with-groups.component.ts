import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChildren,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { Entry, EntryVM } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { findByTypes, getShortName } from "../../../../../../shared/models/type.function";

@Component({
  selector: "app-dropdown-multiple-with-groups",
  templateUrl: "./dropdown-multiple-with-groups.component.html",
  styleUrls: ["./dropdown-multiple-with-groups.component.scss"],
})
export class DropdownMultipleWithGroupsComponent<ValueType>
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @Input() value: ValueType[] = [];
  @Input() formfieldKey: string;
  @Input() formfieldName: string;
  @Input() extraIcons?: string[];
  @Input() noneText: string;
  @Input() noneValue: ValueType; // 0
  @Input() noneIcon: string;
  @Input() noText?: string;
  @Input() noValue?: ValueType; // -1
  @Input() noIcon?: string;
  @Input() chooseText: string;
  @Input() chooseIcon: string;
  @Input() groups: ReadonlyArray<Group<ValueType>>;
  @Input() minWidth?: string;
  @Input() maxWidth?: string;
  /**
   * "Blinkt" wenn ein Wert das erte Mal gesetzt wird
   */
  @Input() blinkWhenValueSet?: boolean = true;
  /**
   * Dropdown kann entfernt werden
   * Kleines "x" wird rechts angezeigt
   */
  @Input() withRemoveButton: boolean = false;
  /**
   * z.B.: Lange Optionsnamen werden nach dem ersten Leerzeichen abgeschnitten
   */
  @Input() cutLongOptionNames: boolean = true;
  /**
   * z.B.: Wenn 3 Optionen ausgewählt sind,
   * werden nur noch die Icons dargestellt und der Text ausgeblendet
   */
  @Input() hideTextCompletlyAfterTotalCount?: number;
  /**
   * z.B.: Bei den Inhaltsstoffen: "Alkohol" / "Kein Alkohol"
   * Die Option, die zuletzt geklickt wird, wird ausgewählt und das Gegenstück entfernt
   */
  @Input() removeOppositeValues?: boolean = true;
  /**
   * z.B.: Bei "Vegan" und "Vegetarisch" ist es nicht einfach über "_NOT" zu erkennen,
   * deshalb können hier extra Werte gesetzt werden
   */
  @Input() specialOppositeValues: [ValueType, ValueType][] = [];

  @Output() onChange: EventEmitter<ValueType[]> = new EventEmitter<ValueType[]>();
  @Output() onRemove: EventEmitter<void> = new EventEmitter<void>();

  @ViewChildren("groups", { read: ElementRef }) groupsElementRefs: ElementRef[];

  private readonly destroySubject = new Subject<void>();
  selected: Entry<ValueType>[];
  selectedEntries: EntryVM<ValueType>[];

  lastSelected: ValueType;

  get tooltipTranslated(): string {
    return (
      this.translateService.instant(this.formfieldName) +
      ": " +
      this.selectedEntries.map((e) => this.translateService.instant(e.name)).join(", ")
    );
  }

  get selectedValue() {
    const noneValue = this.noneValue ?? (0 as ValueType);
    return this.selected.length > 0 && this.selected[0].type !== noneValue;
  }

  get noOrNoneValueSet() {
    const noneValue = this.noneValue ?? (0 as ValueType);
    const noValue = this.noValue ?? (-1 as ValueType);
    return this.selected.some((s) => s.type === noValue || s.type === noneValue);
  }

  get allSelected() {
    return this.selected.length === this.groups.reduce((a, b) => (a += b.entries.length), 0);
  }

  constructor(private elementRef: ElementRef, private translateService: TranslateService) {}

  ngOnInit(): void {
    this.selected = this.findTypes(this.value);

    // Bei jeder Änderung die ausgewählten Elemente neu berechnen
    this.onChange.pipe(takeUntil(this.destroySubject)).subscribe(() => {
      this.fillSelectedTextsAndIcons();
    });
    this.fillSelectedTextsAndIcons();
  }

  ngAfterViewInit(): void {
    this.groupsElementRefs.forEach((groupElement, index) => {
      const group = this.groups[index];

      // Wenn alle Einträge der Gruppe in der Auswahl sind,
      // dann wird die Gruppe als selektiert markiert
      group.entries.every((e) => this.selected.includes(e))
        ? this.addHeaderHighlight(groupElement.nativeElement.children[0])
        : this.removeHeaderHighlight(groupElement.nativeElement.children[0]);

      // Click-Handler für die Gruppe
      groupElement.nativeElement.children[0].addEventListener("click", () => {
        this.onGroupClick(groupElement.nativeElement.children[0], group);
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["maxWidth"] && changes["maxWidth"].currentValue) {
      this.elementRef.nativeElement.style.maxWidth = changes["maxWidth"].currentValue;
    }
    if (changes["minWidth"] && changes["minWidth"].currentValue) {
      this.elementRef.nativeElement.style.minWidth = changes["minWidth"].currentValue;
    }
    if (changes["value"]) {
      this.selected = this.findTypes(this.value);
      this.onChange.emit(this.value);
    }
    if (changes["groups"]) {
      this.selected = this.findTypes(this.value);
      this.fillSelectedTextsAndIcons();
    }
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onSelectChanged(event: ValueType[]) {
    this.value = event;
    this.selected = this.findTypes(event);
    this.onChange.emit(this.value);
  }

  fillSelectedTextsAndIcons() {
    let selected = this.value;
    let selectedEntries: EntryVM<ValueType>[] = [];

    this.groups.forEach((group, index) => {
      // Überprüfen ob "selected" bereits alle Einträge der Gruppe enthält
      const allEntriesSelected = group.entries.every((e) =>
        selected.includes(e.type ?? this.noneValue ?? (0 as ValueType))
      );

      if (allEntriesSelected) {
        selected = this.removeAllEntriesFromSelected(selected, group);
        selectedEntries.push({
          name: getShortName(group.name),
          icon: group.icon ?? "",
          type: index,
          isGroup: true,
        });
      }
    });

    const types = this.findTypes(selected);

    types.forEach((selectedEntry) => {
      selectedEntries.push({
        name: getShortName(selectedEntry.name),
        icon: selectedEntry.icon,
        image: selectedEntry.image,
        type: selectedEntry.type ?? this.noneValue ?? (0 as ValueType),
      });
    });

    this.selectedEntries =
      selectedEntries.length > 0
        ? selectedEntries
        : [
            {
              name: this.noneText ?? "",
              icon: this.noneIcon,
              type: this.noneValue ?? (0 as ValueType),
            },
          ];
  }

  onRemoveFromSelection(event: any, entry: EntryVM<ValueType>): void {
    event.stopPropagation();

    if (entry.isGroup) {
      this.groupsElementRefs.forEach((groupElement, index) => {
        if (index === (entry.type as number)) {
          this.removeHeaderHighlight(groupElement.nativeElement.children[0]);
        }
      });

      // Alle Einträge der Gruppe aus der Auswahl entfernen
      let newSelected = this.value.filter(
        (s) => !this.groups[entry.type as number].entries.map((e) => e.type).includes(s)
      );
      // Wenn die Auswahl leer ist, dann wird der Wert auf null gesetzt
      if (newSelected.length === 0) {
        newSelected = [this.noneValue ?? (0 as ValueType)];
      }
      this.setSelectedAndTriggerOnChange(newSelected);
    } else {
      let newSelected = this.value.filter((s) => s !== entry.type);

      // Wenn die Auswahl leer ist, dann wird der Wert auf null gesetzt
      if (newSelected.length === 0) {
        newSelected = [this.noneValue ?? (0 as ValueType)];
      }
      this.setSelectedAndTriggerOnChange(newSelected);
    }
  }

  onGroupClick(groupElement: HTMLElement, group: Group<ValueType>) {
    // Überprüfen ob "selected" bereits alle Einträge der Gruppe enthält
    const allEntriesSelected = group.entries.every((e) =>
      this.value.includes(e.type ?? this.noneValue ?? (0 as ValueType))
    );

    if (allEntriesSelected) {
      this.removeHeaderHighlight(groupElement);
      let newSelected = this.removeAllEntriesFromSelected(this.value, group);
      // Wenn die Auswahl leer ist, dann wird der Wert auf null gesetzt
      if (newSelected.length === 0) {
        newSelected = [this.noneValue ?? (0 as ValueType)];
      }

      this.setSelectedAndTriggerOnChange(newSelected);
    } else {
      this.addHeaderHighlight(groupElement);
      const noneValue = this.noneValue ?? (0 as ValueType);
      // Alle Einträge der Gruppe zur Auswahl hinzufügen
      var newSelected = this.value
        .concat(group.entries.map((e) => e.type ?? noneValue))
        .filter((s) => s !== noneValue);

      this.setSelectedAndTriggerOnChange(newSelected);
    }
    this.changeWidthOfDropdown();
  }

  onNoOptionClick() {
    const noneValue = this.noneValue ?? (0 as ValueType);
    if (this.value.length === 1 && this.value[0] === noneValue) {
      return;
    }

    // Alle Hervorhebungen der Gruppen entfernen
    this.groupsElementRefs.forEach((groupElementRef) => {
      this.addHeaderHighlight(groupElementRef.nativeElement.children[0]);
    });

    this.setSelectedNoneAndTriggerOnChange();
    this.changeWidthOfDropdown();
    this.removeAllHeaderHighlights();
  }

  onOptionClick(type?: ValueType) {
    const noneValue = this.noneValue ?? (0 as ValueType);
    this.lastSelected = type ?? noneValue;
    const newSelected = this.value.filter((s) => s !== noneValue);

    if (this.value.length === 0) {
      this.setSelectedNoneAndTriggerOnChange();
    } else {
      this.setSelectedAndTriggerOnChange(newSelected);
    }

    this.changeWidthOfDropdown();
    this.onOptionClickProofForHeaderHighlightChange(type, newSelected);
  }

  private changeWidthOfDropdown() {
    const selectElement = document.getElementById("dropwdown-multiple-with-groups");
    const dropdownElement = document.getElementsByClassName("cdk-overlay-pane")[0] as HTMLElement;

    if (!selectElement || !dropdownElement) return;

    setTimeout(() => {
      dropdownElement.style.width = (selectElement.offsetWidth ?? 200) + "px";
    }, 0);
  }

  /**
   * Wenn ein Element ausgewählt wird, dann wird geprüft
   * ob die Gruppe des Elements komplett ausgewählt ist.
   */
  private onOptionClickProofForHeaderHighlightChange(
    optionClickedType?: ValueType,
    allNewSelected?: ValueType[]
  ) {
    if (!optionClickedType || !allNewSelected) return;

    // Finde die Gruppe zum Typ
    const index = this.groups.findIndex((g) => g.entries.some((e) => e.type === optionClickedType));
    if (index !== -1) {
      // Finde zur Gruppe das Element Ref mit hilfe der Id
      const groupElementRef = this.groupsElementRefs.find((g) => {
        return +g.nativeElement.getAttribute("index") === index;
      });

      // Schauen ob in der Gruppe des gerade geklickten Typs
      // alle anderen Typen ebenfalls ausgewählt sind
      const allEntriesSelected = this.groups[index].entries.every((e) => {
        return allNewSelected.includes(e.type ?? this.noneValue ?? (0 as ValueType));
      });

      // Wenn alle anderen Typen ausgewählt sind,
      // dann wird die Gruppe hervorgehoben
      if (allEntriesSelected && groupElementRef) {
        this.addHeaderHighlight(groupElementRef.nativeElement.children[0]);
      } else if (groupElementRef) {
        this.removeHeaderHighlight(groupElementRef.nativeElement.children[0]);
      }
    }
  }

  /**
   * Neue ausgewählte Elemente werden sortiert,
   * doppelte aussortiert und gesetzt
   */
  private setSelectedAndTriggerOnChange(newSelected: ValueType[]) {
    const uniques = Array.from(new Set(newSelected));

    // z.B.: Bei den Inhaltsstoffen: "Alkohol" / "Kein Alkohol"
    // Die Option, die zuletzt geklickt wird, wird ausgewählt und das Gegenstück entfernt
    uniques.forEach((unique, index, array) => {
      const next = array[index + 1];
      if (
        this.removeOppositeValues &&
        typeof unique === "string" &&
        typeof next === "string" &&
        (unique.toLowerCase().replaceAll(/(-|_)not/gi, "") === next.toLowerCase() ||
          next.toLowerCase().replaceAll(/(-|_)not/gi, "") === unique.toLowerCase() ||
          this.matchOppositePairs(this.specialOppositeValues, unique, next))
      ) {
        // Nächstes oder vorheriges Element entfernen
        if (this.lastSelected === unique) uniques.splice(index + 1, 1);
        if (this.lastSelected === next) uniques.splice(index, 1);
      }
    });

    uniques.sort((n1, n2) => {
      if (typeof n1 === "number" && typeof n2 === "number") {
        return n1 - n2;
      }
      return 0;
    });

    this.value = uniques;
    this.onChange.emit(uniques);
  }

  private matchOppositePairs<ValueType>(
    list: [ValueType, ValueType][],
    value1: ValueType,
    value2: ValueType
  ): boolean {
    for (const pair of list) {
      if (
        (pair[0] === value1 && pair[1] === value2) ||
        (pair[0] === value2 && pair[1] === value1)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Auswahl auf "Keine" setzen
   */
  private setSelectedNoneAndTriggerOnChange() {
    this.value = [this.noneValue ?? (0 as ValueType)];
    this.onChange.emit([this.noneValue ?? (0 as ValueType)]);
  }

  /**
   * Gruppenüberschriften hervorheben
   */
  private addHeaderHighlight(groupElement: HTMLElement) {
    groupElement.classList.add("selected");
  }

  /**
   * Hervorhebung der Gruppenüberschriften entfernen
   */
  private removeHeaderHighlight(groupElement: HTMLElement) {
    groupElement.classList.remove("selected");
  }

  /**
   * Alle Hervorhebungen der Gruppen entfernen
   */
  removeAllHeaderHighlights() {
    this.groupsElementRefs.forEach((groupElement) => {
      this.removeHeaderHighlight(groupElement.nativeElement.children[0]);
    });
  }

  /**
   * Alle Einträge der Gruppe aus der Auswahl entfernen
   */
  private removeAllEntriesFromSelected(selected: ValueType[], group: Group<ValueType>) {
    return selected.filter((s) => !group.entries.map((e) => e.type).includes(s));
  }

  onRemoveClick(event: Event): void {
    event.stopPropagation();
    this.onRemove.emit();
  }

  findTypes(value: ValueType[]) {
    return findByTypes(
      value,
      this.groups,
      this.chooseText,
      this.noText,
      this.chooseIcon,
      this.noIcon
    );
  }
}
