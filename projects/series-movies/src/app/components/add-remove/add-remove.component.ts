import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { getNewUUID } from "shared/utils/uuid";

@Component({
  selector: "app-add-remove",
  templateUrl: "./add-remove.component.html",
  styleUrls: ["./add-remove.component.scss"],
})
export class AddRemoveComponent implements OnChanges {
  @Input() value: string;
  @Input() completerList?: string[] | CompleterEntry[] | null = null;
  @Input() addText: string;
  @Input() removeText: string;
  @Input() isNoContent: boolean = false;
  @Input() addIcon: string = "add";
  @Input() addIconWhenBigButton?: string = "";
  @Input() removeIcon: string = "clear";
  @Input() addButtonId: string = getNewUUID();
  @Input() smallerWidth?: number | boolean;
  @Input() chipSeparators: string[] = [];
  @Input() askIfCloseIfDiscard: boolean = false;
  @Input() scrollToElementIdAfterAdd: string;
  @Input() badge: number | undefined | null = 0;
  @Input() sticky: boolean = false;
  @Input() doNotCloseAfterReturn: boolean = false;
  @Input() withBackground: string = "main-background";
  @Input() noPaddingLeftRight: boolean = false;
  @Input() openDialogOnClick: boolean = false;
  @Input() inputInfoText?: string = "";
  @Input() firstCharToTitleCase?: boolean = true;

  @Output() add = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<string>();
  @Output() removeAll = new EventEmitter<void>();
  @Output() openDialog = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isNoContent"]) {
      this.isNoContent = changes["isNoContent"].currentValue;
    }
  }

  onOpenDialog() {
    this.openDialog.emit();
  }
}
