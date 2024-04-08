import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Platform } from "@angular/cdk/platform";
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { MatChipEditedEvent } from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";
import { preventBrowserTabClosing } from "projects/series-movies/src/utils/warning-dialog";
import { Observable, Subject, map, startWith, take, takeUntil } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { DialogData } from "shared/models/dialog.type";
import { DropdownData } from "shared/models/dropdown.type";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { scrollToElementById } from "shared/utils/scroll";
import { firstCharToTitleCase, replaceSelectionWithText } from "shared/utils/string";
import { getNewUUID } from "shared/utils/uuid";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Item } from "../../models/item.class";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { StoreApiService } from "../../services/store/store.api.service";

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"],
})
export class AddComponent implements OnInit, OnChanges, OnDestroy {
  @Input() value: string;
  @Input() completerList?: string[] | CompleterEntry[] | null = null;
  @Input() text: string = "";
  @Input() placeholder: string = "";
  /**
   * Funktioniert nur, wenn sich app-add in einem flex-container befindet
   * Funktioniert nicht in der app-add-remove Komponente
   */
  @Input() completeWidth: boolean = false;
  @Input() width?: string;
  @Input() smallerWidth?: number | boolean;
  @Input() isNoContent: boolean = false;
  @Input() addIcon: string = "add";
  @Input() addIconWhenBigButton?: string = "";
  @Input() buttonId = getNewUUID();
  @Input() chipSeparators: string[] = [];
  @Input() tags: string[] = [];
  @Input() askIfCloseIfDiscard: boolean = false;
  @Input() scrollToElementIdAfterAdd: string;
  @Input() completerInitialOpen: boolean = false;
  @Input() doNotCloseAfterReturn: boolean = false;
  @Input() doNotCleanInputAfterReturn: boolean = false;
  @Input() openDialogOnClick: boolean = false;
  @Input() doNotBlurIfTextInInput: boolean = false;
  @Input() keepCompleterAlwaysOpen: boolean = false;
  @Input() keepCompleterOpenAfterClick: boolean = false;
  @Input() inputInfoText?: string = "";
  @Input() firstCharToTitleCase?: boolean = true;
  @Input() addOnClick: boolean = false;

  @ViewChild("input") input: ElementRef<HTMLInputElement>;
  @ViewChild("basicInput") basicInput: ElementRef<HTMLInputElement>;
  @ViewChild("icon") icon: MatIcon;
  @ViewChild("trigger") trigger: MatAutocompleteTrigger;

  @Output() add = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<string>();
  @Output() tagsChange = new EventEmitter<string[]>();
  @Output() isOpen = new EventEmitter<boolean>();
  @Output() openDialog = new EventEmitter<void>();

  private readonly destroySubject = new Subject<void>();

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  filteredOptions: Observable<CompleterEntry[]>;
  control = new FormControl("");
  inputIsOpen = false;
  showPlaceholder = false;
  showBigButton: boolean;
  _completerList: CompleterEntry[] = [];

  constructor(
    private platform: Platform,
    protected storeApiService: StoreApiService,
    protected ingredientApiService: IngredientApiService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.showBigButton = this.isNoContent;

    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(""),
      takeUntil(this.destroySubject),
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

    if (this.chipSeparators.length !== 0) {
      this.control.valueChanges.pipe(takeUntil(this.destroySubject)).subscribe((value) => {
        // Wenn letztes Zeichen ein Trennzeichen ist, dann wird der Tag hinzugefügt
        if (value && this.chipSeparators.includes(value.slice(-1))) {
          this.onAddTag(value);
        }
      });
    }

    this.control.valueChanges.pipe(takeUntil(this.destroySubject)).subscribe((value) => {
      this.valueChange.emit(value ?? "");
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["value"] && changes["value"].currentValue && !changes["value"].firstChange) {
      this.openInput(changes["value"].currentValue);
    }

    if (changes["tags"] && changes["tags"].currentValue && !changes["tags"].firstChange) {
      this.openInput();
    }

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

    if (changes["isNoContent"]) {
      this.showBigButton = changes["isNoContent"].currentValue && !this.inputIsOpen;
    }
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onClick() {
    // Wenn geöffnet, dann schließen
    if (this.inputIsOpen) {
      this.toggleInput();
      return;
    }

    if (this.openDialogOnClick) {
      this.openDialog.emit();
    } else {
      this.showBigButton = false;
      this.toggleInput();
    }
  }

  onContextMenuClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.openDialogOnClick) {
      this.showBigButton = false;
      this.toggleInput();
    } else {
      this.openDialog.emit();
    }
  }

  toggleInput() {
    if (this.inputIsOpen) {
      // Tags vorhanden & Es soll Dialog geöffnet werden
      if (this.tags.length > 0 && this.askIfCloseIfDiscard) {
        const data: DialogData = {
          title: "DIALOG.PENDING_CHANGES.TITLE",
          text: "DIALOG.PENDING_CHANGES.TEXT",
          icons: ["delete"],
          actionPrimary: {
            key: "keep",
            text: "ACTION.KEEP",
            icon: "check",
          },
          actions: [
            {
              key: "discard",
              text: "ACTION.DISCARD",
              icon: "delete",
              color: "warn",
            },
          ],
          actionCancel: true,
        };
        this.dialogService.open(data).subscribe((result) => {
          if (!result) return;

          if (result.actionKey === "keep") {
            return;
          } else if (result.actionKey === "discard") {
            this.setTags([]);
            this.onBlur(false);
          }
        });
      }
      // Keine Tags vorhanden
      else {
        this.onBlur(false);
      }
    } else {
      setTimeout(() => {
        this.openInput();
      }, 0);
    }
  }

  setWidth() {
    let width: number = this.chipSeparators.length > 0 ? 250 : 350;
    if (this.tags.length > 1) width = 350;
    else if (typeof this.smallerWidth === "number") width = this.smallerWidth;
    else if (typeof this.smallerWidth === "boolean" && this.smallerWidth) width = 250;

    if (this.input)
      this.input.nativeElement.style.width = this.width
        ? this.width
        : this.completeWidth
        ? "100%"
        : this.isSmallScreen.matches
        ? "250px"
        : `${width}px`;
  }

  async openInput(tag: string = "") {
    this.inputIsOpen = true;

    if (this.icon) this.icon.svgIcon = "search";
    this.setWidth();
    if (this.basicInput && this.basicInput.nativeElement.parentElement && this.completeWidth)
      this.basicInput.nativeElement.parentElement.style.flexGrow = "1";

    await new Promise((f) => setTimeout(f, 500));

    this.input.nativeElement.focus();
    this.input.nativeElement.classList.add("input-open");

    this.control.setValue(tag);
    this.isOpen.emit(this.inputIsOpen);
    this.showPlaceholder = true;

    // WORKAROUND, der nur so mittel funktioniert
    if (!this.platform.isBrowser) {
      await new Promise((f) => setTimeout(f, 100));
      this.input.nativeElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  async closeInput() {
    this.trigger.closePanel();
    this.icon.svgIcon = this.addIcon;
    this.input.nativeElement.style.width = "40px";
    this.control.setValue("");
    this.input.nativeElement.classList.remove("input-open");

    await new Promise((f) => setTimeout(f, 500));

    if (this.basicInput.nativeElement.parentElement && this.completeWidth)
      this.basicInput.nativeElement.parentElement.style.flexGrow = "0";

    if (this.isNoContent) this.showBigButton = true;
  }

  async onBlur(doNotClose: boolean) {
    if (doNotClose) return;
    if (!this.isAutoCompleteClosed()) {
      await new Promise((f) => setTimeout(f, 100));
      if (this.control.value || this.input?.nativeElement?.value) return;
    }
    if (this.tags.length > 0) return;
    this.closeInput();
    this.showPlaceholder = false;
    document.getElementById(this.buttonId)?.focus();
    await new Promise((f) => setTimeout(f, 500));
    this.inputIsOpen = false;
    this.isOpen.emit(this.inputIsOpen);
  }

  onReturn() {
    if (!this.isAutoCompleteClosed() && this.chipSeparators.length !== 0) return;
    if (this.tags.length === 0 && (!this.control.value || this.control.value?.trim().length === 0))
      return;

    // Wenn Chipliste vorhanden ist
    if (
      this.chipSeparators.length !== 0 &&
      this.control.value !== null &&
      this.control.value?.trim().length !== 0
    ) {
      this.addTag(this.control.value);
      this.setWidth();
      if (!this.doNotCleanInputAfterReturn) this.control.setValue("");
      return;
    }

    const tags = this.tags;
    const tags_tmp = tags
      .concat(this.control.value ?? "")
      .filter((tag) => tag !== "")
      .map((tag) => {
        if (this.firstCharToTitleCase) return firstCharToTitleCase(tag).trim();
        return tag.trim();
      });

    this.setTags([]);

    this.add.emit(tags_tmp.join(";"));

    if (this.input.nativeElement.value === "") {
      this.input.nativeElement.blur();
    }

    if (!this.doNotCleanInputAfterReturn) this.control.setValue("");

    this.onBlur(this.doNotCloseAfterReturn);
    if (this.keepCompleterAlwaysOpen) this.trigger.openPanel();
    scrollToElementById(this.scrollToElementIdAfterAdd);
  }

  private _filter(value: string): CompleterEntry[] {
    value = value.trim().toLowerCase();
    if (!value) return this._completerList;
    return this._completerList.filter(
      (v) =>
        v.text.toLowerCase().includes(value) ||
        v.alternativeNames?.some((alternativeName) => alternativeName.toLowerCase().includes(value))
    );
  }

  private onAddTag(value: string): void {
    value = value.trim();

    if (value && this.chipSeparators.includes(value.slice(-1))) {
      value = value.slice(0, -1);
    }

    if (value) {
      this.addTag(value);
    }

    this.setWidth();

    this.control.setValue("");
  }

  onRemoveTag(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      const tags = this.tags;
      tags.splice(index, 1);
      this.setTags(tags);
    }

    this.setWidth();

    this.input.nativeElement.focus();
  }

  /**
   * Chip bearbeiten mit Doppelclick auf Chip
   */
  onChipEdit(tag: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Tag entfernen,
    // wenn leer nach dem Bearbeiten
    if (!value) {
      this.onRemoveTag(tag);
      return;
    }

    // Vorhandenen Tag bearbeiten
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      const tags = this.tags;
      tags[index] = value;
      this.setTags(tags);
    }
  }

  onDropdownChange(data: DropdownData<string, string>, tag: string): void {
    // Vorhandenen Tag bearbeiten
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      const tags = this.tags;
      tags[index] = data.key;
      this.setTags(tags);
    }
  }

  private addTag(value: string) {
    const tags = this.tags;
    value = firstCharToTitleCase(value).trim();

    // Wenn Zutat/Item bereits in "tags" enthalten ist,
    // dann hochzählen
    let countedUp = false;
    this.ingredientApiService.ingredientsConversion$
      .pipe(take(1))
      .subscribe((ingredientsConversion) => {
        this.setTags(
          this.tags.map((tag) => {
            const item = Item.findItem(tag, ingredientsConversion);
            if (item && item.name.toLowerCase() === value.toLowerCase()) {
              item.quantity++;
              tag = new Item(item).getItemString();
              countedUp = true;
            }
            return tag;
          })
        );
      });

    if (countedUp) return;

    tags.push(value.trim());
    this.setTags(tags);
  }

  private setTags(tags: string[]) {
    this.tags = tags;
    this.tagsChange.emit(tags);
  }

  onRemoveAllTags() {
    this.tags = [];
    this.tagsChange.emit([]);
  }

  isAutoCompleteClosed() {
    return document.getElementsByClassName("autocompleter-option-in-dropdown").length === 0;
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    let clipboardData = (event.clipboardData || (window as any).clipboardData).getData("text");
    const replaceWith = this.chipSeparators.length ? this.chipSeparators[0] : " ;";
    const value = clipboardData?.replaceAll("\n", replaceWith) ?? "";

    const start = this.input.nativeElement.selectionStart;
    const end = this.input.nativeElement.selectionEnd;

    const newValue = replaceSelectionWithText(this.control.value ?? "", value, {
      start,
      end,
    });
    this.control.setValue(newValue);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tags, event.previousIndex, event.currentIndex);
  }

  onDragStart(index: number) {
    // Breite für den Platzhalter berechnen
    var rootElement = document.querySelector<HTMLElement>(":root");
    var chip = document.getElementById("add-chip-in-row-" + index.toString());
    rootElement?.style.setProperty("--drag-chip-width", chip?.offsetWidth.toString() + "px");
  }

  async onOptionClick(option: CompleterEntry, event: Event, trigger: MatAutocompleteTrigger) {
    if (this.keepCompleterAlwaysOpen || this.keepCompleterOpenAfterClick) {
      event.stopPropagation();
      this.add.emit(option.text);
      this.input.nativeElement.focus();
      trigger.openPanel();
      await new Promise((f) => setTimeout(f, 100));
      this.control.setValue("");
    } else if (this.addOnClick) {
      this.add.emit(option.text);
      this.control.setValue("");
    }
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeBrowserTabClose(event: any) {
    preventBrowserTabClosing(event, this.tags.length > 6);
  }
}
