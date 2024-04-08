import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { getNewUUID } from "shared/utils/uuid";

@Component({
  selector: "app-rating",
  templateUrl: "./rating.component.html",
  styleUrls: ["./rating.component.scss"],
})
export class RatingComponent implements OnChanges, OnInit {
  @Input() rating: number;
  @Input() icon: string;
  @Input() text: string;
  @Input() noText: string;

  @Output() ratingChange = new EventEmitter<number>();

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  rating_tmp: number;
  ratingList = [true, true, true, true, true, true, true, true, true, true, true];
  open = false;
  hover = false;
  private wasInside = false;
  left_px = 0;

  id = getNewUUID();

  ngOnInit(): void {
    this.rating_tmp = this.rating;
    this.ratingList = this.ratingList.map((_, index) => index <= this.rating_tmp);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["rating"]) {
      this.ratingList = this.ratingList.map((_, index) => index <= this.rating_tmp);
    }
  }

  onOpen() {
    const rect = document.getElementById("rating-button-" + this.id)?.getBoundingClientRect();
    this.left_px = rect?.left || 0;
    this.open = true;
  }

  onClose() {
    this.open = false;
  }

  onRating(value: number) {
    this.rating = value;

    this.ratingChange.emit(value);
    this.onClose();
  }

  onHover(value: number) {
    this.rating_tmp = value;
    this.ratingList = this.ratingList.map((_, index) => index <= value);
  }

  onHoverEnter() {
    this.hover = true;
  }

  onHoverLeave() {
    this.hover = false;
    this.rating_tmp = this.rating;
    this.ratingList = this.ratingList.map((_, index) => index <= this.rating_tmp);
  }

  @HostListener("click")
  clickInside() {
    this.wasInside = true;
  }

  @HostListener("document:click")
  clickout() {
    if (!this.wasInside) {
      this.onClose();
    }
    this.wasInside = false;
  }
}
