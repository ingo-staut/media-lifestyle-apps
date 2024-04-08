import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import moment, { Moment } from "moment";
import { DropdownData } from "shared/models/dropdown.type";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import {
  PREPARATION_HISTORY_DATA,
  PREPARATION_HISTORY_TYPES,
} from "../../data/preparation-history.data";
import { PreparationHistoryType } from "../../models/enum/preparation-history.enum";
import { PreparationHistoryEntry } from "../../models/preparation-history.class";
import { RecipeDialogsService } from "../../services/recipe/recipe.dialogs.service";

@Component({
  selector: "app-preparation-history-chip[preparationHistory][portions][amountText]",
  templateUrl: "./preparation-history-chip.component.html",
  styleUrls: ["./preparation-history-chip.component.scss"],
})
export class PreparationHistoryChipComponent implements OnInit {
  @Input() amountText: string;
  @Input() portions: number;
  @Input() preparationHistory: PreparationHistoryEntry;
  @Input() blinking: boolean = false;

  @Output() remove = new EventEmitter<undefined>();
  @Output() edit = new EventEmitter<PreparationHistoryEntry>();

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  FormfieldType = FormfieldType;
  PreparationHistoryType = PreparationHistoryType;
  PREPARATION_HISTORY_TYPES = PREPARATION_HISTORY_TYPES;
  PREPARATION_HISTORY_DATA = PREPARATION_HISTORY_DATA;

  editMode = false;

  formGroup: ReturnType<typeof this.initializeFormGroup>;

  get totalPortions(): number {
    return this.portions * this.preparationHistory.amount;
  }

  get showPreparedButton(): boolean {
    return this.preparationHistory.type === PreparationHistoryType.PLANNED;
  }

  constructor(
    private formBuilder: FormBuilder,
    protected translateService: TranslateService,
    private recipeDialogsService: RecipeDialogsService,
    protected localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.initializeFormGroup();
  }

  initializeFormGroup() {
    const date: Moment = moment(this.preparationHistory.date);
    return this.formBuilder.group({
      amount: [this.preparationHistory.amount],
      portionsAvailable: [this.preparationHistory.portionsAvailable],
      date: [date],
      type: [this.preparationHistory.type],
      note: [this.preparationHistory.note],
    });
  }

  onRemove(): void {
    this.remove.emit();
  }

  onToggleEditMode(): void {
    if (this.editMode) {
      this.edit.emit(this.currentData());
    } else {
      this.recipeDialogsService
        .openAddOrEditPreparationHistoryEntryDialog({
          preparationHistoryEntry: this.preparationHistory,
          amountText: this.amountText,
          edit: this.edit,
          remove: this.remove,
        })
        .subscribe();
    }
  }

  currentData() {
    const data = new PreparationHistoryEntry({
      ...this.preparationHistory,
      amount: this.formGroup.controls.amount.value ?? 1,
      portionsAvailable: this.formGroup.controls.portionsAvailable.value ?? null,
      // WORKAROUND: Moment-Date wird zurückgegeben
      date: this.formGroup.controls.date.value?.toDate(),
      type: this.formGroup.controls.type.value ?? PreparationHistoryType.PLANNED,
      note: this.formGroup.controls.note.value ?? "",
    });
    return data;
  }

  onSelectedChange(selected: DropdownData<string, string>): void {
    // this.preparationHistory.type = selected.key;
    this.formGroup.controls.type.setValue(selected.key as PreparationHistoryType);
  }

  onMarkAsPrepared(): void {
    this.preparationHistory.type = PreparationHistoryType.PREPARED;
    this.edit.emit(this.preparationHistory);
  }
}
