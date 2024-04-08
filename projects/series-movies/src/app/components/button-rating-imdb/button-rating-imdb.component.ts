import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RatingIndex } from "shared/models/enum/rating.enum";
import { LocaleService } from "shared/services/locale.service";

@Component({
  selector: "app-button-rating-imdb",
  templateUrl: "./button-rating-imdb.component.html",
  styleUrls: ["./button-rating-imdb.component.scss"],
})
export class ButtonRatingImdbComponent {
  @Input() rating: number | null = null;
  @Input() showAddButton: boolean = false;
  @Input() showTotal: boolean = false;
  @Input() medium: boolean = false;
  @Input() noPadding: boolean = false;
  @Input() disabled: boolean = false;

  @Output() open = new EventEmitter<boolean>();

  RatingIndex = RatingIndex;

  constructor(protected localeService: LocaleService) {}

  onOpen(event: Event, add: boolean): void {
    event.stopPropagation();

    this.open.emit(add);
  }
}
