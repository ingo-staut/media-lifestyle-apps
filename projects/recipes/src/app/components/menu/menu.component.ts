import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatMenuTrigger } from "@angular/material/menu";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Observable, Subject, combineLatest, map, startWith } from "rxjs";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { alphanumericKeyPressedInputFocus } from "shared/utils/keyboard";
import { MenuItem, sortByFavorite } from "../../../../../../shared/models/menu-item.type";
import { MenuBottomSheetService } from "../../bottom-sheets/menu-bottom-sheet/menu-bottom-sheet.service";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent<Type extends { favorite?: boolean }> implements OnInit {
  @Input() type: Type;
  @Input() icon: string;
  @Input() iconBigButton?: string;
  @Input() image: string;
  @Input() tooltip?: string;
  @Input() text?: string;
  @Input() textBigButton?: string;
  @Input() showBigButton?: boolean;
  @Input() showMenu?: boolean = true;
  @Input() switchOnMobile?: boolean = false;
  @Input() openMenuByRightClick?: boolean = true;
  @Input() menuItems: MenuItem<Type & { favorite?: boolean }>[];
  @Input() showAddButton?: boolean;
  @Input() showDescriptions?: boolean;
  @Input() showShowDescriptionsButton?: boolean;
  @Input() descriptionsReplace?: string;
  @Input() showFilterInput?: boolean;
  @Input() classList: string[] = [];
  @Input() textSize: number;
  @Input() padding?: number;
  @Input() width?: string;
  @Input() iconPaddingLeft?: number;
  @Input() checked?: boolean;
  @Input() selected?: boolean;
  @Input() groupNames?: Map<string, string>;
  @Input() showFirstGroupName?: boolean;
  @Input() groupHighlightOnHover?: boolean;
  @Input() dragable?: boolean;
  @Input() blinking?: boolean = false;
  @Input() noBackground?: boolean = false;
  @Input() disabled?: boolean = false;
  @Input() filterFunction: (item: Type) => boolean = (item: Type) => true;

  @Output() onContextMenu = new EventEmitter<MouseEvent>();
  @Output() onItemClick = new EventEmitter<{
    event?: MouseEvent;
    value: Type & { favorite?: boolean };
  }>();
  @Output() updateMenuItems = new EventEmitter<MenuItem<Type & { favorite?: boolean }>[]>();
  @Output() addMenuItem = new EventEmitter<MenuItem<Type & { favorite?: boolean }>[]>();
  @Output() editMenuItem = new EventEmitter<{
    menuItems: MenuItem<Type & { favorite?: boolean }>[];
    item: MenuItem<Type & { favorite?: boolean }>;
  }>();

  @ViewChild("filterInput") filterInput?: ElementRef<HTMLInputElement>;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  filteredOptions$: Observable<MenuItem<Type>[]> = new Observable<MenuItem<Type>[]>();
  filterControl = new FormControl("");
  /**
   * Wird nur getriggert,
   * wenn Favorit o.Ä. geändert wurde
   */
  favoriteClickedSubject = new BehaviorSubject<MenuItem<Type>[]>([]);

  constructor(
    private menuBottomSheetService: MenuBottomSheetService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.filteredOptions$ = combineLatest([
      this.filterControl.valueChanges.pipe(startWith("")),
      this.favoriteClickedSubject.asObservable(),
    ]).pipe(
      map(([value, _]) =>
        this.filterMenuItems(value ?? "").filter(
          (item) => !item.hide && this.filterFunction(item.value)
        )
      )
    );
  }

  private _filter(value: string): MenuItem<Type>[] {
    const filterValue = value.toLowerCase();
    return this.menuItems.filter((value) =>
      this.translateService.instant(value.text).toLowerCase().includes(filterValue)
    );
  }

  private filterMenuItems(value: string): MenuItem<Type>[] {
    const data = value?.length ?? 0 >= 1 ? this._filter(value || "") : [...this.menuItems];
    data.sort(sortByFavorite);
    return data;
  }

  @HostListener("window:keydown.control.a")
  selectAll() {
    this.filterInput?.nativeElement.focus();
    this.filterInput?.nativeElement.select();
  }

  @HostListener("window:keydown", ["$event"])
  keypressed(event: KeyboardEvent) {
    alphanumericKeyPressedInputFocus(event, this.filterInput);

    if (event.key === "Backspace") {
      this.filterInput?.nativeElement.focus();
    }
  }

  onEnter() {
    const filteredActions = this._filter(this.filterControl.value || "");
    if (filteredActions.length >= 1) {
      this.onItemClick.emit({ value: filteredActions[0].value });
    }
  }

  openMenu() {
    if (this.showFilterInput) this.filterInput?.nativeElement.focus();

    this.filterControl.setValue("");
    if (!this.isSmallScreen.matches) return;

    const menuItemsChanged = new Subject<MenuItem<Type>[]>();
    const addMenuItem = new Subject<MenuItem<Type>[]>();
    const editMenuItem = new Subject<{
      menuItems: MenuItem<Type & { favorite?: boolean }>[];
      item: MenuItem<Type & { favorite?: boolean }>;
    }>();
    this.menuBottomSheetService
      .open<Type>(
        {
          actions: this.menuItems,
          showFilterInput: this.showFilterInput,
          menuItemsChanged,
          addMenuItem,
          editMenuItem,
          showAddButton: this.showAddButton,
          showDescriptions: this.showDescriptions,
          showShowDescriptionsButton: this.showShowDescriptionsButton,
          descriptionsReplace: this.descriptionsReplace,
          groupNames: this.groupNames,
          showFirstGroupName: this.showFirstGroupName,
          groupHighlightOnHover: this.groupHighlightOnHover,
          filterFunction: this.filterFunction,
        },
        "without-padding"
      )
      .subscribe((value) => {
        if (value && value.value) {
          this.onItemClick.emit({ value: value.value });
        }
      });

    menuItemsChanged.asObservable().subscribe((value) => {
      this.menuItems = value;
      this.updateMenuItems.emit(this.menuItems);
    });

    addMenuItem.asObservable().subscribe((value) => {
      this.addMenuItem.emit(value);
    });

    editMenuItem.asObservable().subscribe((value) => {
      this.editMenuItem.emit(value);
    });
  }

  openContextMenu(event: MouseEvent) {
    this.onContextMenu.emit(event);
  }

  onOpenContextMenu(event: MouseEvent) {
    event.preventDefault();

    if (this.openMenuByRightClick && !this.isSmallScreen.matches) {
      this.trigger.openMenu();
    } else if (this.showMenu && this.switchOnMobile && this.isSmallScreen.matches) {
      this.openMenu();
    } else {
      this.openContextMenu(event);
    }
  }

  onOpenMenu(event: MouseEvent) {
    event.stopPropagation();

    if (this.openMenuByRightClick && !this.isSmallScreen.matches) {
      this.openContextMenu(event);
      this.trigger.closeMenu();
    } else if (this.switchOnMobile && this.isSmallScreen.matches) {
      this.openContextMenu(event);
    } else if (this.showMenu) {
      this.openMenu();
    } else {
      this.openContextMenu(event);
    }
  }

  onMenuItemClicked(event: MouseEvent, item: MenuItem<Type>): void {
    this.onItemClick.emit({ event, value: item.value });
  }

  onSearchInputClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFavoriteClicked(event: Event, item: MenuItem<Type>) {
    event.preventDefault();
    event.stopPropagation();

    this.menuItems = this.menuItems.map((i) => {
      if (i.id === item.id) {
        i.favorite = !i.favorite;
        i.value.favorite = !i.value.favorite;
      }
      return i;
    });

    this.favoriteClickedSubject.next(this.menuItems);
    this.updateMenuItems.emit(this.menuItems);
  }

  addSearchEngine() {
    this.addMenuItem.emit(this.menuItems);
  }

  onShowDescriptions(event: Event) {
    event.stopPropagation();
    this.showDescriptions = !this.showDescriptions;
  }

  onEditSearchEngine(event: Event, item: MenuItem<Type>) {
    event.preventDefault();
    event.stopPropagation();

    this.trigger.closeMenu();

    this.editMenuItem.emit({ menuItems: this.menuItems, item });
  }

  onHoverEnter(groupKey?: string) {
    if (groupKey && this.groupHighlightOnHover) {
      const buttonTexts = document.getElementsByClassName("menu-button");
      Array.from(buttonTexts).forEach((button) => {
        if (button.classList.contains("button-" + groupKey)) button.classList.add("white");
        else button.classList.add("transparent");
      });
      const menuTitles = document.getElementsByClassName("menu-section-title");
      Array.from(menuTitles).forEach((button) => {
        if (button.id === groupKey) button.classList.add("white");
        else button.classList.add("transparent");
      });
    }
  }

  onHoverLeave(groupKey?: string) {
    if (groupKey && this.groupHighlightOnHover) {
      const buttonTexts = document.getElementsByClassName("menu-button");
      Array.from(buttonTexts).forEach((button) => {
        button.classList.remove("white");
        button.classList.remove("transparent");
      });
      const menuTitles = document.getElementsByClassName("menu-section-title");
      Array.from(menuTitles).forEach((button) => {
        button.classList.remove("white");
        button.classList.remove("transparent");
      });
    }
  }
}
