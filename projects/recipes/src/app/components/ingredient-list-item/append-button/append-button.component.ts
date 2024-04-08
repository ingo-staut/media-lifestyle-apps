import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FromWith } from "../../../models/ingredient.class";
import { WithInList } from "../../../pages/shopping-list/shopping-list.component";

@Component({
  selector: "app-append-button",
  templateUrl: "./append-button.component.html",
  styleUrls: ["./append-button.component.scss"],
})
export class AppendButtonComponent {
  @Input() fromWith: FromWith[];
  @Input() withInList: WithInList;
  @Input() hasAtLeastOne: boolean;
  @Input() hasNotAtLeastOne: boolean;
  @Input() tooltip: string;
  @Input() icon: string;

  @Output() withInListChange = new EventEmitter<WithInList>();

  WithInList = WithInList;
}
