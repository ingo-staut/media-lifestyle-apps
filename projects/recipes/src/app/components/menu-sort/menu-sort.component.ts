import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { SortingDirection } from "../../../../../../shared/models/enum/sort-direction.enum";
import { MenuItem } from "../../../../../../shared/models/menu-item.type";
import { MenuDialogData } from "../../bottom-sheets/menu-bottom-sheet/menu-bottom-sheet.component";
import { MenuBottomSheetService } from "../../bottom-sheets/menu-bottom-sheet/menu-bottom-sheet.service";
import { SortType } from "../../models/enum/sort.enum";
import { Sort } from "../../models/sort.type";

@Component({
  selector: "app-menu-sort",
  templateUrl: "./menu-sort.component.html",
  styleUrls: ["./menu-sort.component.scss"],
})
export class MenuSortComponent {
  @Input() data: ReadonlyArray<Sort>;
  @Input() defaultSortType: SortType;
  @Input() sortType: SortType;
  @Input() sortingDirection?: SortingDirection;
  @Input() buttonWithText?: boolean;
  @Input() buttonWithTextIfDefaultSortType?: boolean;

  @Output() sortingDirectionChange = new EventEmitter<SortingDirection>();
  @Output() sortTypeChange = new EventEmitter<SortType>();

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  SortingDirection = SortingDirection;
  SortType = SortType;

  get showButtonText() {
    return (
      (this.buttonWithTextIfDefaultSortType && this.sortType === this.defaultSortType) ||
      (this.sortType !== this.defaultSortType && this.buttonWithText)
    );
  }

  constructor(private menuBottomSheetService: MenuBottomSheetService) {}

  onChangeSortDirection(event: Event) {
    event.stopPropagation();
    this.sortingDirection =
      this.sortingDirection === SortingDirection.ASC ? SortingDirection.DESC : SortingDirection.ASC;
    this.sortingDirectionChange.emit(this.sortingDirection);
  }

  onChangeSortType(sortType: SortType) {
    this.sortType = sortType;
    this.sortTypeChange.emit(sortType);
  }

  onOpenSortMenu() {
    if (!this.isMobileScreen.matches) return;

    const items: MenuDialogData<SortType> = {
      actions: this.data.map((sort) => {
        const item: MenuItem<SortType> = {
          text: sort.text,
          value: sort.type,
          icon: sort.icon,
          highlight: this.sortType === sort.type,
        };
        return item;
      }),
      showFilterInput: true,
    };

    this.menuBottomSheetService.open(items).subscribe((data) => {
      if (data) {
        this.sortType = data.value;
        this.sortTypeChange.emit(data.value);
      }
    });
  }
}
