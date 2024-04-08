import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-search-no-results",
  templateUrl: "./search-no-results.component.html",
  styleUrls: ["./search-no-results.component.scss"],
})
export class SearchNoResultsComponent {
  @Input() results: any[] | null = [];
  @Input() filtersSet: number = 0;
  @Input() setSearchText: boolean = false;

  @Output() removeSearchText = new EventEmitter<string>();
  @Output() removeAllFilters = new EventEmitter<void>();

  onClickSearchText(value: string) {
    this.removeSearchText.emit(value);
  }

  onRemoveAllFilters() {
    this.removeAllFilters.emit();
  }
}
