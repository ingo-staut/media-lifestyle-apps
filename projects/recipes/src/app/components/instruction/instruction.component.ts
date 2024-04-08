import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup, FormGroupDirective } from "@angular/forms";
import { FormfieldType, SuffixPadding } from "shared/models/enum/formfield.enum";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { Ingredient } from "../../models/ingredient.class";
import { Instruction } from "../../models/instruction.class";

import { DropdownData } from "shared/models/dropdown.type";
import { LocaleService } from "shared/services/locale.service";
import { LEVELS } from "../../data/level.data";
import { PREPARATIONS } from "../../data/preparation.data";
import { LevelType } from "../../models/enum/level.enum";
import { PreparationType, findPreparationByType } from "../../models/enum/preparation.enum";
import { UtensilObject } from "../../models/utensil-object.class";
import { Utensil } from "../../models/utensil.class";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { InstructionDialogsService } from "../../services/instruction.dialogs.service";
import { SettingsService } from "../../services/settings/settings.service";
import { UtensilObjectService } from "../../services/utensil-object/utensil-object.service";

@Component({
  selector: "app-instruction[formGroupName][instruction]",
  templateUrl: "./instruction.component.html",
  styleUrls: ["./instruction.component.scss"],
})
export class InstructionComponent implements OnInit {
  @Input() formGroupName: string;
  @Input() instruction: Instruction;
  @Input() utensilObjects: UtensilObject[] | null = null;
  @Input() index: number;
  @Input() hideUtensils: boolean = false;
  @Input() hideIngredients: boolean = false;
  @Input() hideIngredientNotes: boolean = false;

  @Output() instructionChange = new EventEmitter<Instruction>();
  @Output() proofSavingAllowed = new EventEmitter<void>();
  @Output() hideIngredientNotesChange = new EventEmitter<boolean>();
  @Output() hideUtensilsChange = new EventEmitter<boolean>();
  @Output() hideIngredientsChange = new EventEmitter<boolean>();

  FormfieldType = FormfieldType;
  SuffixPadding = SuffixPadding;
  preparationType = PreparationType;
  findPreparationByType = findPreparationByType;
  PREPARATIONS = PREPARATIONS;
  LEVELS = LEVELS;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  parentFormGroup: FormGroup;
  formGroup: FormGroup;
  isCollapsed = true;

  constructor(
    private rootFormGroup: FormGroupDirective,
    protected settingsService: SettingsService,
    protected utensilObjectService: UtensilObjectService,
    protected ingredientApiService: IngredientApiService,
    protected localeService: LocaleService,
    protected instructionDialogsService: InstructionDialogsService
  ) {}

  ngOnInit(): void {
    this.parentFormGroup = this.rootFormGroup.form.controls["instructions"] as FormGroup;
    this.formGroup = this.parentFormGroup.controls[this.formGroupName] as FormGroup;
  }

  checkSavingAllowed() {
    this.proofSavingAllowed.emit();
  }

  onExpand() {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Tags wurden geändert
   */
  onUtensilsChanged(utensils: Utensil[]) {
    this.formGroup.patchValue({ utensils: [...utensils] });
    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Zutaten wurden geändert
   */
  onIngredientsChanged(ingredients: Ingredient[]) {
    this.formGroup.patchValue({ ingredients: [...ingredients] });
    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  onLevelChange(level: DropdownData<LevelType, string>) {
    this.formGroup.patchValue({ level: level.key });
    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  openAddOrEditInstructionDetails(instruction: Instruction, add: boolean) {
    this.instructionDialogsService
      .openAddOrEditInstructionDetails(instruction, add)
      .subscribe((instruction) => {
        this.instruction = instruction;
        this.instructionChange.emit(instruction);
      });
  }
}
