import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Action } from "shared/models/action.type";
import { LocaleService } from "shared/services/locale.service";

@Component({
  selector: "app-search-action-button",
  templateUrl: "./search-action-button.component.html",
  styleUrls: ["./search-action-button.component.scss"],
})
export class SearchActionButtonComponent {
  @Input() action: Action;

  @Output() buttonClick = new EventEmitter<null>();

  constructor(protected localeService: LocaleService) {}
}
