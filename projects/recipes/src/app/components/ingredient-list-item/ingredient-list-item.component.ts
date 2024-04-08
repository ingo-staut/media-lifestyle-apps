import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DateAdapter, MAT_DATE_LOCALE } from "@angular/material/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import moment from "moment";
import { Subject, startWith, take, takeUntil } from "rxjs";
import { ButtonIconDirective } from "shared/directives/button-icon.directive";
import { DialogData } from "shared/models/dialog.type";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { LocaleService } from "shared/services/locale.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { AvailableType } from "../../models/enum/available.enum";
import { IngredientConversionContentType } from "../../models/enum/ingredient-conversion-content.enum";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { Instruction } from "../../models/instruction.class";
import { Recipe } from "../../models/recipe.class";
import { WithInList } from "../../pages/shopping-list/shopping-list.component";
import { IngredientAvailableDialogsService } from "../../services/ingredient/ingredient-available.dialogs.service";
import { IngredientConversionDialogsService } from "../../services/ingredient/ingredient-conversion.dialogs.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { IngredientDialogsService } from "../../services/ingredient/ingredient.dialogs.service";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { SettingsService } from "../../services/settings/settings.service";
import { StoreApiService } from "../../services/store/store.api.service";
import { IngredientChange } from "../ingredients-list/ingredients-list.component";

@Component({
  selector: "app-ingredient-list-item[parentFormGroup][ingredient]",
  templateUrl: "./ingredient-list-item.component.html",
  styleUrls: ["./ingredient-list-item.component.scss"],
})
export class IngredientListItemComponent implements OnInit, OnDestroy {
  @Input() parentFormGroup: FormGroup;

  // Daten - Zutat
  @Input() ingredient: Ingredient;
  @Input() isIngredientAvailable: boolean = false;
  @Input() blinking = false;
  @Input() amountFactor: number = 1;
  @Input() hideIngredientNotes: boolean = true;
  @Input() showIngredientNoteDialogOnClick: boolean = false;

  // Daten - Allgemein
  @Input() instructions: Instruction[] = [];
  @Input() ingredientsConversion?: IngredientConversion[] | null;
  @Input() ingredientsAvailable?: Ingredient[] | null;

  // Funktionen
  @Input() editable = true;
  @Input() moveable = true;
  @Input() removeable = true;
  @Input() checkable = false;
  @Input() checkableIfNotEditable = false;
  @Input() additional = false;

  // Buttons anzeigen
  @Input() showAvailability = true;
  @Input() showAddAvailabilityButton = true;
  @Input() showCheckBoxButton = true;
  @Input() showUseUntilButton = true;
  @Input() showAddConversionButton = true;
  @Input() showEditButton = true;
  @Input() withRecipes = WithInList.WITHOUT;

  @Input() searchTextHighlight?: string | null;

  @Output() ingredientChange = new EventEmitter<IngredientChange>();
  @Output() openById = new EventEmitter<string>();
  @Output() hideIngredientNotesChange = new EventEmitter<boolean>();

  @ViewChild("amount") amount: ElementRef;

  FormfieldType = FormfieldType;
  WithRecipesInList = WithInList;
  AvailableType = AvailableType;
  ItemType = ItemType;
  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  readonly isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  MIN_VALUE = Number.MIN_VALUE;
  IngredientConversionContentType = IngredientConversionContentType;
  ButtonIconDirective = ButtonIconDirective;
  moment = moment;

  private readonly destroySubject = new Subject<void>();

  key = Math.random().toString(36).substring(2);

  formGroup: FormGroup;
  isEditMode = false;
  recipes: Recipe[] = [];

  inThreeDays = DateFns.addDaysToDate(new Date(), 3);
  inOneWeek = DateFns.addDaysToDate(new Date(), 7);
  inOneMonth = DateFns.addMonthsToDate(new Date(), 1);

  get _removeable(): boolean {
    return new Ingredient(this.ingredient).hasNotOneRecipe() && this.removeable;
  }

  constructor(
    private adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private locale: string,
    private formBuilder: FormBuilder,
    private recipeApiService: RecipeApiService,
    private recipeDialogService: RecipeDialogService,
    private ingredientsApiService: IngredientApiService,
    private ingredientDialogsService: IngredientDialogsService,
    private ingredientAvailableDialogsService: IngredientAvailableDialogsService,
    private settingsService: SettingsService,
    private ingredientConversionDialogsService: IngredientConversionDialogsService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    protected storeApiService: StoreApiService,
    protected localeService: LocaleService
  ) {}

  ngOnInit(): void {
    // Für später, wenn Settings
    // aus dem Rezepte-Dialog heraus geöffnet wird
    this.translateService.onLangChange
      .pipe(
        takeUntil(this.destroySubject),
        startWith({ lang: this.translateService.currentLang } as LangChangeEvent)
      )
      .subscribe((e) => {
        this.locale = e.lang;
        this.adapter.setLocale(e.lang);
      });

    // Initiales Formular
    this.formGroup = this.formBuilder.group({
      amount: this.ingredient.amount || null,
      unit: this.ingredient.unit,
      name: [this.ingredient.name, Validators.required],
      note: this.ingredient.note,
      _lastAdded: this.ingredient._lastAdded,
      date: this.ingredient.useUntil ? moment(this.ingredient.useUntil) : null,
      store: this.ingredient.store,
    });

    this.recipeApiService.recipes$.pipe(takeUntil(this.destroySubject)).subscribe((recipes) => {
      this.recipes = recipes;
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onUseUntilDateChange(date: Date | null) {
    this.formGroup.patchValue({ date });

    const ingredient = this.ingredient;
    ingredient.useUntil = date;
    this.ingredientsApiService.editOrDeleteIngredientAndUpdateIngredientAvailable(
      this.ingredient,
      false,
      ingredient
    );
  }

  async onEdit(): Promise<void> {
    if (!this.editable && this.checkableIfNotEditable) {
      this.onCheck();
      return;
    }

    if (!this.editable) return;

    this.settingsService.editIngredientInListWithDialog$.pipe(take(1)).subscribe((dialog) => {
      if (this.isIngredientAvailable) {
        this.ingredientAvailableDialogsService.openAddOrEditIngredientAvailableDialog({
          ingredient: this.ingredient,
          ingredientsConversion: this.ingredientsConversion,
        });
      }
      // Dialog
      else if (dialog) {
        this.ingredient = this.formGroup.getRawValue();

        this.storeApiService.completerListStores$.pipe(take(1)).subscribe((completerListStores) => {
          this.ingredientDialogsService
            .openAddOrEditIngredientDialog(
              this.ingredient,
              false,
              this.ingredientsConversion,
              this.ingredientsAvailable,
              {
                additional: this.additional,
                completerListStores,
              }
            )
            .subscribe((result) => {
              if (!result) return;

              // Bearbeitet
              if (result.actionAddOrApply) {
                const ingredient = new Ingredient({
                  amount: result.numberInputs[0],
                  name: result.textInputs[0],
                  unit: result.textInputs[1],
                  note: result.textInputs[2],
                  store: result.textInputs[3],
                });
                const data: IngredientChange = { ingredient };
                this.ingredientChange.emit(data);
              }

              // Gelöscht
              else if (result.actionDelete) {
                const data: IngredientChange = { ingredient: this.ingredient, isDeleted: true };
                this.ingredientChange.emit(data);
              }
            });
        });
      }

      // Inline
      else {
        if (this.isEditMode) {
          if (!this.formGroup.valid) return;

          this.ingredient = this.formGroup.getRawValue();
          // WORKAROUND, damit "number"
          this.ingredient.amount = +this.ingredient.amount;
          this.ingredient.available = new Ingredient(this.ingredient).isAvailable(
            this.ingredientsAvailable ?? [],
            this.ingredientsConversion ?? []
          ).ratio;
          const data: IngredientChange = { ingredient: this.ingredient };
          this.ingredientChange.emit(data);
        }

        this.isEditMode = !this.isEditMode;
      }
    });
  }

  onDelete(): void {
    const data: IngredientChange = { ingredient: this.ingredient, isDeleted: true };
    this.ingredientChange.emit(data);
  }

  onCheck() {
    if (this.ingredient._checked) {
      this.ingredientsApiService.removeIngredientChecked(this.ingredient);
    } else {
      this.ingredientsApiService.addIngredientChecked(this.ingredient);
    }

    this.ingredient._checked = !this.ingredient._checked;
  }

  onRecipeDelete(id: string): void {
    const recipe = this.recipes.find((recipe) => recipe.id === id);
    if (!recipe) return;
    this.recipeApiService.getRecipeById(recipe.id).subscribe((recipe) => {
      recipe.isOnShoppingList = null;
      this.recipeApiService.saveAndReloadRecipe(recipe);
    });
  }

  openRecipe(id: string): void {
    const recipe = this.recipes.find((recipe) => recipe.id === id);
    if (!recipe) return;
    this.recipeDialogService.openAndReloadData(recipe);
  }

  openEditIngredientConversionDialog(ingredient: Ingredient) {
    const conversion = IngredientConversion.findIngredientConversion(
      ingredient.name,
      this.ingredientsConversion ?? []
    );

    if (conversion) {
      this.ingredientConversionDialogsService.openEditIngredientConversionDialog(conversion);
    } else {
      this.ingredientConversionDialogsService.openAddIngredientConversionDialog(ingredient.name);
    }
  }

  onNoteClick(event: Event) {
    event.stopPropagation();

    if (!this.showIngredientNoteDialogOnClick) this.hideIngredientNotesChange.emit(false);

    const data: DialogData = {
      title: "NOTE.",
      text: this.ingredient.note,
      icons: ["note"],
      actionClose: true,
      actionPrimary: false,
    };

    this.dialogService.open(data);
  }
}
