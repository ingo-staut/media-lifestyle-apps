import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  quickAddAppendAll,
  quickAddButtonAppend,
  quickAddButtonReplace,
  quickReplaceAll,
} from "projects/series-movies/src/utils/quickaddbuttons";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { isValue } from "shared/utils/type";
import { UrlService } from "../../../../../../shared/services/url.service";
import { Media } from "../../models/media.class";
import { QuickAddButton, Strategy } from "../../services/request-apis/request.api.service";

@Component({
  selector: "app-quick-add-button[key][data][media]",
  templateUrl: "./quick-add-button.component.html",
  styleUrls: ["./quick-add-button.component.scss"],
  // host: { class: "scrollbox no-scrollbar-on-mobile" },
})
export class QuickAddButtonComponent implements OnInit, OnChanges {
  @Input() key: keyof Media;
  @Input() data: QuickAddButton[] | null;
  @Input() media: Media;
  @Input() margin?: { top?: number; right?: number; bottom?: number; left?: number };
  @Input() overflowXAuto?: boolean = false;
  @Input() imageSize: number = 16;

  @Output() mediaChange = new EventEmitter<Media>();
  @Output() dataChange = new EventEmitter<QuickAddButton[]>();

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  Strategy = Strategy;
  isValue = isValue;

  entries?: QuickAddButton[] = [];

  get withSwitchButton() {
    return this.key === "name" || this.key === "nameOriginal";
  }

  constructor(private urlService: UrlService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["data"] && changes["data"].currentValue) {
      this.entries = this.data?.filter((d) => d.key === this.key);
    }
  }

  onClick(event: Event, entry: QuickAddButton) {
    event.stopPropagation();

    let media = quickAddButtonAppend(this.media, entry);
    media = quickAddButtonReplace(media, entry, true);

    this.mediaChange.emit(media);
  }

  onQuickAddAppendAll() {
    this.media = quickAddAppendAll(this.media, this.entries ?? []);
    this.mediaChange.emit(this.media);
  }

  onQuickReplaceAll() {
    this.media = quickReplaceAll(this.media, this.entries ?? []);
    this.mediaChange.emit(this.media);
  }

  onOpenUrl(event: MouseEvent, url: string) {
    event.stopPropagation();

    this.urlService.openOrCopyUrl({ event, url });
  }

  onSwitchClicked(event: Event) {
    event.stopPropagation();

    this.data =
      this.data?.map((value) => {
        if (value.key === "name") {
          value.key = "nameOriginal";
        } else if (value.key === "nameOriginal") {
          value.key = "name";
        }

        return value;
      }) ?? null;

    if (this.data) this.dataChange.emit(this.data);
  }
}
