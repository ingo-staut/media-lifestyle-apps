import { Platform } from "@angular/cdk/platform";
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Observable, Subject, combineLatest, map, startWith } from "rxjs";
import { MenuItem, sortByFavorite } from "shared/models/menu-item.type";
import { alphanumericKeyPressedInputFocus } from "shared/utils/keyboard";

export type MenuDialogData<ValueType> = {
  actions: MenuItem<ValueType>[];
  showFilterInput?: boolean;
  menuItemsChanged?: Subject<MenuItem<ValueType>[]>;
  addMenuItem?: Subject<MenuItem<ValueType>[]>;
  editMenuItem?: Subject<{
    menuItems: MenuItem<ValueType & { favorite?: boolean }>[];
    item: MenuItem<ValueType & { favorite?: boolean }>;
  }>;
  showAddButton?: boolean;
  showDescriptions?: boolean;
  showShowDescriptionsButton?: boolean;
  descriptionsReplace?: string;
  groupNames?: Map<string, string>;
  showFirstGroupName?: boolean;
  groupHighlightOnHover?: boolean;
  filterFunction?: (item: ValueType) => boolean;
};

export type MenuDialogReturnData<MenuItemValueType> = {
  actions: MenuItem<MenuItemValueType>[];
  value: MenuItemValueType;
};

@Component({
  selector: "app-menu-bottom-sheet",
  templateUrl: "./menu-bottom-sheet.component.html",
  styleUrls: ["./menu-bottom-sheet.component.scss"],
})
export class MenuBottomSheetComponent<MenuItemValueType extends { favorite?: boolean }>
  implements OnInit
{
  @ViewChild("filterInput") filterInput: ElementRef<HTMLInputElement>;

  isMobileDevice = this.platform.ANDROID || this.platform.IOS;

  filteredOptions$: Observable<MenuItem<MenuItemValueType>[]> = new Observable<
    MenuItem<MenuItemValueType>[]
  >();
  filterControl = new FormControl("");
  /**
   * Wird nur getriggert,
   * wenn Favorit o.Ä. geändert wurde
   */
  favoriteClickedSubject = new BehaviorSubject<MenuItem<MenuItemValueType>[]>([]);
  showDescriptions = this.data.showDescriptions;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<MenuBottomSheetComponent<MenuItemValueType>>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: MenuDialogData<MenuItemValueType>,
    private translateService: TranslateService,
    protected platform: Platform
  ) {}

  ngOnInit(): void {
    this.filteredOptions$ = combineLatest([
      this.filterControl.valueChanges.pipe(startWith("")),
      this.favoriteClickedSubject.asObservable(),
    ]).pipe(
      map(([value, _]) =>
        this.filterMenuItems(value ?? "").filter(
          (item) =>
            !item.hide && (this.data.filterFunction ? this.data.filterFunction(item.value) : true)
        )
      )
    );
  }

  private _filter(value: string): MenuItem<MenuItemValueType>[] {
    const filterValue = value.toLowerCase();
    return this.data.actions.filter((value) =>
      this.translateService.instant(value.text).toLowerCase().includes(filterValue)
    );
  }

  private filterMenuItems(value: string): MenuItem<MenuItemValueType>[] {
    const data = value?.length ?? 0 >= 1 ? this._filter(value || "") : [...this.data.actions];
    data.sort(sortByFavorite);
    return data;
  }

  @HostListener("window:keydown.control.a")
  selectAll() {
    this.filterInput.nativeElement.focus();
    this.filterInput.nativeElement.select();
  }

  @HostListener("window:keydown", ["$event"])
  keypressed(event: KeyboardEvent) {
    alphanumericKeyPressedInputFocus(event, this.filterInput);
  }

  @HostListener("window:keydown.backspace")
  removeAll() {
    // FilterInput hat bereits Fokus
    if (this.filterInput.nativeElement === document.activeElement) return;
    if (!this.filterControl || !this.filterControl.value) return;

    this.filterInput.nativeElement.focus();
  }

  onEnter() {
    const filteredActions = this.filterMenuItems(this.filterControl.value ?? "").filter((item) =>
      this.data.filterFunction ? this.data.filterFunction(item.value) : true
    );

    const data: MenuDialogReturnData<MenuItemValueType> = {
      actions: this.data.actions,
      value: filteredActions[0].value,
    };
    this.bottomSheetRef.dismiss(data);
  }

  onMenuItemClicked(value: MenuItemValueType) {
    const data: MenuDialogReturnData<MenuItemValueType> = {
      actions: this.data.actions,
      value,
    };
    this.bottomSheetRef.dismiss(data);
  }

  onSearchInputClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFavoriteClicked(event: Event, item: MenuItem<MenuItemValueType>) {
    event.preventDefault();
    event.stopPropagation();

    this.data.actions = this.data.actions.map((i) => {
      if (i.id === item.id) {
        i.favorite = !i.favorite;
        i.value.favorite = !i.value.favorite;
      }
      return i;
    });

    this.favoriteClickedSubject.next(this.data.actions);
    this.data.menuItemsChanged?.next(this.data.actions);
  }

  addMenuItem() {
    this.data.addMenuItem?.next(this.data.actions);
  }

  onShowDescriptions(event: Event) {
    event.stopPropagation();
    this.showDescriptions = !this.showDescriptions;
  }

  onEditSearchEngine(event: Event, item: MenuItem<MenuItemValueType>, index: number) {
    event.preventDefault();
    event.stopPropagation();

    this.data.editMenuItem?.next({ menuItems: this.data.actions, item });
  }
}
