import { Component, Input } from "@angular/core";
import { SortKey } from "../../../models/enum/sort.enum";

@Component({
  selector: "app-search-result-column",
  templateUrl: "./search-result-column.component.html",
  styleUrls: ["./search-result-column.component.scss"],
})
export class SearchResultColumnComponent {
  @Input() sortKey: SortKey;
  @Input() columns: SortKey[];
  @Input() text: string | null;
  @Input() show: boolean;
  @Input() icon: string;
  @Input() tooltip?: string | null;
}
