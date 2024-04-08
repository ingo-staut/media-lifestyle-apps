import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { Instruction } from "../../models/instruction.class";
import { UtensilObject } from "../../models/utensil-object.class";
import { Utensil } from "../../models/utensil.class";
import { UtensilObjectService } from "../../services/utensil-object/utensil-object.service";
import { UtensilDialogsService } from "../../services/utensil/utensil.dialogs.service";

export type UtensilChange = { utensil: Utensil; isDeleted?: boolean };

@Component({
  selector: "app-utensils-list",
  templateUrl: "./utensils-list.component.html",
  styleUrls: ["./utensils-list.component.scss"],
})
export class UtensilsListComponent {
  @Input() parentFormGroup: FormGroup;

  @Input() utensils: Utensil[] = [];
  @Input() instructions: Instruction[] = [];
  @Input() utensilObjects: UtensilObject[] | null;

  /**
   * Wird verwendet, wenn nur Zutaten zu einem Zubereitungsschritt in der Liste sind
   * Wird benötigt für `showInstructionTitle`, damit geklickt werden kann
   */
  @Input() instructionId?: string;

  @Input() editable = true;
  @Input() moveable = true;
  @Input() removeable = true;

  /**
   * Zubereitungstitel bei Hinzufügen/Entfernen-Buttons anzeigen
   */
  @Input() showInstructionTitle: string = "";
  @Input() instructionIsOptional = false;
  /**
   * Zubereitungstitel zwischen Utensilien anzeigen
   */
  @Input() showInstructionTitleInBetween = false;
  @Input() showUtensilButton: boolean = true;
  @Input() showEditButton: boolean = true;
  @Input() addAndRemoveAll: boolean = true;

  @Output() utensilsChange = new EventEmitter<Utensil[]>();
  @Output() openById = new EventEmitter<string>();

  previousInstructionTitle = "";

  constructor(
    private notificationService: NotificationService,
    private utensilDialogsService: UtensilDialogsService,
    protected utensilObjectService: UtensilObjectService
  ) {}

  getNextIntructionTitle(title: string): string | null {
    if (title !== this.previousInstructionTitle) {
      this.previousInstructionTitle = title;
      return this.previousInstructionTitle;
    } else {
      return null;
    }
  }

  onAdd(value: string) {
    const ingredients = Utensil.parseAll(value);
    if (!ingredients.length) return;
    this.utensils = [...ingredients, ...this.utensils];
    this.utensilsChange.emit(this.utensils);
  }

  drop(event: CdkDragDrop<Utensil[], any, any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // moveItemInArray(this.ingredients, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.utensilsChange.emit(this.utensils);
  }

  onOpenAddUtensilDialog() {
    this.utensilDialogsService
      .openAddOrEditUtensilDialogWithUtensilsList(this.utensils)
      .subscribe((utensils) => {
        this.utensils = utensils;
      });
  }

  onRemoveAll() {
    const utensilsCopy = this.utensils;

    this.utensils = [];
    this.utensilsChange.emit(this.utensils);

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.utensils = utensilsCopy;
      this.utensilsChange.emit(this.utensils);
    });
  }

  utensilChanged(utensilChange: UtensilChange, index: number) {
    const { utensil, isDeleted } = utensilChange;
    if (isDeleted) this.utensils.splice(index, 1);
    else this.utensils[index] = utensil;
    this.utensilsChange.emit(this.utensils);
  }
}
