import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { RatingIndex } from "shared/models/enum/rating.enum";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { SortKey } from "../../models/enum/sort.enum";
import { Media } from "../../models/media.class";

@Component({
  selector: "app-search-result-item",
  templateUrl: "./search-result-item.component.html",
  styleUrls: ["./search-result-item.component.scss"],
})
export class SearchResultItemComponent implements OnChanges {
  @Input() media!: Media;
  @Input() searchTextHighlight?: string | null;
  @Input() columns: SortKey[] = [];

  SortKey = SortKey;
  RatingIndex = RatingIndex;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  today = new Date();

  get lastEditedDate() {
    return DateFns.isSameDate(this.media.lastEditedDate, new Date(-1)) ||
      this.media.lastEditedDate === undefined
      ? null
      : this.media.lastEditedDate;
  }

  constructor(
    private mediaDialogService: MediaDialogService,
    protected translateService: TranslateService,
    protected localeService: LocaleService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // repeat() mit 0 ist nicht erlaubt
    if (changes["columns"]) {
      this.columns = this.columns.filter(
        (column) => column !== SortKey.SORT_NONE && column !== SortKey.SORT_ALPHABET
      );
    }
  }

  onOpen(event: Event) {
    event.stopPropagation();

    this.mediaDialogService.openAndReloadData(this.media, {
      searchText: this.searchTextHighlight ?? undefined,
    });
  }
}
