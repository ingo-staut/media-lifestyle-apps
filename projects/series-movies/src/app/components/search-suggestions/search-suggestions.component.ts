import { Component, Input } from "@angular/core";
import { Action } from "shared/models/action.type";

@Component({
  selector: "app-search-suggestions",
  templateUrl: "./search-suggestions.component.html",
  styleUrls: ["./search-suggestions.component.scss"],
})
export class SearchSuggestionsComponent {
  @Input() results: any[] | null = [];
  @Input() suggestions: Action[] | null = [];
  @Input() filtersSetOrSearchText: boolean = false;
}
