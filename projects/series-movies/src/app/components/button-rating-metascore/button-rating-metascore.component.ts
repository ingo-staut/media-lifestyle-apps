import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RatingIndex } from "shared/models/enum/rating.enum";
import { LocaleService } from "shared/services/locale.service";

@Component({
  selector: "app-button-rating-metascore",
  templateUrl: "./button-rating-metascore.component.html",
  styleUrls: ["./button-rating-metascore.component.scss"],
})
export class ButtonRatingMetascoreComponent {
  @Input() rating: number | null = null;
  @Input() showAddButton: boolean = false;
  @Input() showTotal: boolean = false;
  @Input() small: boolean = false;
  @Input() medium: boolean = false;
  @Input() disabled: boolean = false;

  @Output() open = new EventEmitter<boolean>();

  RatingIndex = RatingIndex;

  constructor(protected localeService: LocaleService) {}

  onOpen(event: Event, add: boolean): void {
    event.stopPropagation();

    this.open.emit(add);
  }
}
