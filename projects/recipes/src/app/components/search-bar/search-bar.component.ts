import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { QuickAddFilterFromSearch } from "../../../../../../shared/models/search-filter.type";
import { PageIndex } from "../../data/sidenav.menu.data";
import { RecipeDialogsService } from "../../services/recipe/recipe.dialogs.service";

@Component({
  selector: "app-search-bar",
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"],
})
export class SearchBarComponent {
  @Input() searchValue: string;
  @Input() quickAddFilterFromSearch: QuickAddFilterFromSearch[];

  @Output() searchValueChange = new EventEmitter<string>();
  @Output() searchValueEnter = new EventEmitter<void>();
  @Output() closeSearch = new EventEmitter<void>();

  @ViewChild("searchInput") searchInput: ElementRef;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private recipeDialogsService: RecipeDialogsService) {}

  onFocus() {
    this.searchInput.nativeElement.focus();
  }

  onChange(value: string) {
    this.searchValueChange.emit(value);
  }

  onClose() {
    this.closeSearch.emit();
  }

  onEnter() {
    this.searchValueEnter.emit();
  }

  onOpenCreateDialog() {
    this.recipeDialogsService.openCreateDialog(this.searchValue, PageIndex.SEARCH);
  }
}
