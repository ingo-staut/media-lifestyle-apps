import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-button-show-more",
  templateUrl: "./button-show-more.component.html",
  styleUrls: ["./button-show-more.component.scss"],
})
export class ButtonShowMoreComponent {
  @Input() show: boolean;

  @Output() loadMore = new EventEmitter<void>();

  constructor() {}
}
