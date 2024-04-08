import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import moment from "moment";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { IngredientAvailableDialogsService } from "../../services/ingredient/ingredient-available.dialogs.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";

@Component({
  selector: "app-ingredient-chip",
  templateUrl: "./ingredient-chip.component.html",
  styleUrls: ["./ingredient-chip.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientChipComponent implements OnInit {
  @Input() ingredient: Ingredient;
  @Input() ingredientsConversion?: IngredientConversion[] | null;

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  inThreeDays = DateFns.addDaysToDate(new Date(), 3);
  inOneWeek = DateFns.addDaysToDate(new Date(), 7);
  inOneMonth = DateFns.addMonthsToDate(new Date(), 1);

  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private ingredientAvailableDialogsService: IngredientAvailableDialogsService,
    protected ingredientApiService: IngredientApiService,
    protected localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      date: this.ingredient.useUntil ? moment(this.ingredient.useUntil) : null,
    });

    this.formGroup.controls["date"].valueChanges.subscribe((value) => {
      const ingredient = this.ingredient;
      ingredient.useUntil = value ? value.toDate() : null;
      this.ingredientApiService.editOrDeleteIngredientAndUpdateIngredientAvailable(
        this.ingredient,
        false,
        ingredient
      );
    });
  }

  onDelete() {
    this.ingredientApiService.editOrDeleteIngredientAndUpdateIngredientAvailable(
      this.ingredient,
      true
    );
  }

  onEdit() {
    this.ingredientAvailableDialogsService.openAddOrEditIngredientAvailableDialog({
      ingredient: this.ingredient,
      ingredientsConversion: this.ingredientsConversion,
    });
  }

  onUseUntilDateChange(date: Date | null) {
    const ingredient = this.ingredient;
    ingredient.useUntil = date;
    this.ingredientApiService.editOrDeleteIngredientAndUpdateIngredientAvailable(
      this.ingredient,
      false,
      ingredient
    );
  }
}
