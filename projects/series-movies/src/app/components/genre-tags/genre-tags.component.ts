import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Platform } from "@angular/cdk/platform";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { getAllSearchTerms } from "projects/series-movies/src/utils/translation";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { splitTags } from "shared/utils/string";
import { GENRES } from "../../data/genres.data";
import { Genre } from "../../models/genre.class";

@Component({
  selector: "app-genre-tags",
  templateUrl: "./genre-tags.component.html",
  styleUrls: ["./genre-tags.component.scss"],
})
export class GenreTagsComponent {
  @Input() genreIds: number[];
  @Input() addIcon: string = "add";
  @Input() withPadding: boolean = true;

  @Output() tagsChange = new EventEmitter<number[]>();

  isMobileDevice = this.platform.ANDROID || this.platform.IOS;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  addValue = "";
  blinkingIndex = -1;
  completerList: CompleterEntry[] | null = GENRES.map((genre) => {
    const { name, icon, alternativeNames } = genre;
    const data: CompleterEntry = {
      text: name,
      icons: [icon],
      alternativeNames: [...getAllSearchTerms(name), ...alternativeNames],
    };
    return data;
  });

  constructor(private platform: Platform, private notificationService: NotificationService) {}

  add(value: string): void {
    value = value.trim();

    const newTags = splitTags(value, ",").map((tag) => Genre.findGenreIdByName(tag));

    if (newTags.includes(-1)) {
      return;
    }

    if (value) {
      this.genreIds.unshift(...newTags);
      this.genreIds = [...new Set(this.genreIds)];
    }

    this.tagsChange.emit(this.genreIds);

    this.blinkingIndex = newTags.length;

    setTimeout(() => {
      this.blinkingIndex = -1;
    }, 1000);
  }

  remove(id: number): void {
    const index = this.genreIds.indexOf(id);

    if (index >= 0) {
      this.genreIds.splice(index, 1);
    }

    this.tagsChange.emit(this.genreIds);
  }

  onRemoveAll() {
    const genresCopy = this.genreIds;
    this.genreIds = [];
    this.tagsChange.emit(this.genreIds);

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.genreIds = genresCopy;
      this.tagsChange.emit(this.genreIds);
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.genreIds, event.previousIndex, event.currentIndex);
    this.tagsChange.emit(this.genreIds);
  }
}
