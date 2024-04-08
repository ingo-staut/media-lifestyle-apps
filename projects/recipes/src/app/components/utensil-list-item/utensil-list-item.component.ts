import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { LocaleService } from "shared/services/locale.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { UtensilMaterial } from "../../models/enum/utensil-material.enum";
import { UtensilSize } from "../../models/enum/utensil-size.enum";
import { Instruction } from "../../models/instruction.class";
import { UtensilObject } from "../../models/utensil-object.class";
import { Utensil } from "../../models/utensil.class";
import { UtensilObjectDialogsService } from "../../services/utensil-object/utensil-object.dialogs.service";
import { UtensilDialogsService } from "../../services/utensil/utensil.dialogs.service";
import { UtensilChange } from "../utensils-list/utensils-list.component";

@Component({
  selector: "app-utensil-list-item",
  templateUrl: "./utensil-list-item.component.html",
  styleUrls: ["./utensil-list-item.component.scss"],
})
export class UtensilListItemComponent {
  @Input() parentFormGroup: FormGroup;

  // Daten - Zutat
  @Input() utensil: Utensil;
  @Input() blinking = false;

  // Daten - Allgemein
  @Input() instructions: Instruction[] = [];
  @Input() utensilObjects: UtensilObject[] | null;

  // Funktionen
  @Input() editable = true;
  @Input() moveable = true;
  @Input() removeable = true;

  // Buttons anzeigen
  @Input() showEditButton = true;
  @Input() showUtensilButton = true;

  @Output() utensilChange = new EventEmitter<UtensilChange>();
  @Output() openById = new EventEmitter<string>();

  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  constructor(
    private utensilDialogsService: UtensilDialogsService,
    private utensilObjectDialogsService: UtensilObjectDialogsService,
    protected localeService: LocaleService,
    protected translateService: TranslateService
  ) {}

  async onEdit(): Promise<void> {
    if (!this.editable) return;

    this.utensilDialogsService.openAddOrEditUtensilDialog(this.utensil).subscribe((result) => {
      if (!result) return;

      if (result.actionKey === "apply") {
        const utensil = new Utensil({
          ...this.utensil,
          name: result.textInputs[0],
          note: result.textInputs[1],
          amount: result.numberInputs[0],
          size: result.toggleGroupInputs[0] as UtensilSize,
          material: result.dropdownInputs[0] as UtensilMaterial,
        });

        this.utensilChange.emit({ utensil });
      } else if (result.actionKey === "delete") {
        this.utensilChange.emit({ utensil: this.utensil, isDeleted: true });
      }
    });
  }

  onDelete(): void {
    const data: UtensilChange = { utensil: this.utensil, isDeleted: true };
    this.utensilChange.emit(data);
  }

  onEditUtensilObject(utensilObject: UtensilObject) {
    this.utensilObjectDialogsService.openEditUtensilObjectDialogSaveAndReload(utensilObject);
  }
}
