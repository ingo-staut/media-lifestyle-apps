import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { take } from "rxjs";
import { FormfieldType, SuffixPadding } from "shared/models/enum/formfield.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { getNewUUID } from "shared/utils/uuid";
import { SortingDirection } from "../../../../../../shared/models/enum/sort-direction.enum";
import { SortType } from "../../models/enum/sort.enum";
import { IngredientFilterListSelectedKeys } from "../../models/filter-ingredients-selected-keys.type";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { Instruction } from "../../models/instruction.class";
import { Sort } from "../../models/sort.type";
import { WithInList } from "../../pages/shopping-list/shopping-list.component";
import { IngredientConversionCompleterService } from "../../services/ingredient/ingredient-conversion.completer.service";
import { IngredientDialogsService } from "../../services/ingredient/ingredient.dialogs.service";
import { StoreApiService } from "../../services/store/store.api.service";

export type IngredientChange = { ingredient: Ingredient; isDeleted?: boolean };

@Component({
  selector: "app-ingredient-list[ingredients]",
  templateUrl: "./ingredients-list.component.html",
  styleUrls: ["./ingredients-list.component.scss"],
})
export class IngredientsListComponent implements OnChanges {
  @Input() parentFormGroup: FormGroup;
  // Daten
  @Input() ingredients: Ingredient[];
  @Input() isIngredientAvailable: boolean = false;

  @Input() instructions: Instruction[] = [];
  @Input() ingredientsConversion?: IngredientConversion[] | null;
  @Input() ingredientsAvailable?: Ingredient[] | null;

  @Input() addButtonId: string = getNewUUID();

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

  @Input() showSearchSelectionOption = false;
  @Input() showSearch = false;

  /**
   * Zubereitungstitel bei Hinzufügen/Entfernen-Buttons anzeigen
   */
  @Input() showInstructionTitle: string = "";
  @Input() instructionIsOptional: boolean = false;
  /**
   * Wird verwendet, wenn nur Zutaten zu einem Zubereitungsschritt in der Liste sind
   * Wird benötigt für `showInstructionTitle`, damit geklickt werden kann
   */
  @Input() instructionId?: string;
  /**
   * Zubereitungstitel zwischen Zutaten anzeigen
   */
  @Input() showInstructionTitleInBetween = false;
  /**
   * Zutat kann mit Funktion gefiltert werden
   * z.B.: Nur Zutat mit Emoji wird angezeigt
   */
  @Input() showIngredient?: (
    ingredient: Ingredient,
    parameters: {
      ingredientsConversion?: IngredientConversion[] | null;
      ingredientsAvailable?: Ingredient[] | null;
      filterKey?: IngredientFilterListSelectedKeys;
    }
  ) => boolean;
  @Input() filterKey: IngredientFilterListSelectedKeys;
  @Input() sortType = SortType.SORT_CUSTOM;
  @Input() sortingDirection = SortingDirection.DESC;
  @Input() sortData?: ReadonlyArray<Sort>;
  @Input() searchText: string = "";
  @Input() customAddIngredientDialog: boolean = false;
  @Input() amountFactor: number = 1;
  @Input() hideIngredientNotes: boolean = true;
  @Input() showIngredientNoteDialogOnClick: boolean = true;
  @Input() marginTop?: number;

  @Output() ingredientsChange = new EventEmitter<Ingredient[]>();
  @Output() ingredientChange = new EventEmitter<IngredientChange>();
  @Output() openById = new EventEmitter<string>();
  @Output() searchApply = new EventEmitter<Ingredient[]>();
  @Output() openAddIngredientDialog = new EventEmitter();
  @Output() hideIngredientNotesChange = new EventEmitter<boolean>();

  FormfieldType = FormfieldType;
  SuffixPadding = SuffixPadding;
  SortType = SortType;
  SortingDirection = SortingDirection;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  previousInstructionTitle = "";
  ingredientsSorted: Ingredient[] = [];

  inputInfoText = "";

  // Für Auswahl von Zutaten
  isSelectionMode = false;
  selectedIngredients: Ingredient[] = [];
  equalFunction = (a: Ingredient, b: Ingredient) => new Ingredient(a).equalAll(b);

  constructor(
    private notificationService: NotificationService,
    private ingredientDialogsService: IngredientDialogsService,
    private translateService: TranslateService,
    private storeApiService: StoreApiService,
    protected ingredientConversionCompleterService: IngredientConversionCompleterService,
    protected localeService: LocaleService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["sortType"]?.currentValue || changes["sortingDirection"]?.currentValue) {
      this.sort();
    }
  }

  sort() {
    const sortAsc = this.sortingDirection === SortingDirection.ASC;

    switch (this.sortType) {
      case SortType.SORT_CUSTOM:
        this.ingredientsSorted = this.ingredients;
        break;

      case SortType.SORT_ALPHABET:
        this.ingredientsSorted = cloneDeep(this.ingredients).sort((a, b) =>
          sortAsc ? b.name?.localeCompare(a.name) : a.name?.localeCompare(b.name)
        );
        break;

      case SortType.SORT_USE_UNTIL:
        this.ingredientsSorted = cloneDeep(this.ingredients).sort((a, b) =>
          sortAsc
            ? (a.useUntil?.getTime() ?? 0) - (b.useUntil?.getTime() ?? 0)
            : (b.useUntil?.getTime() ?? 0) - (a.useUntil?.getTime() ?? 0)
        );
        break;

      case SortType.SORT_AVAILABLE:
        const ingredients = cloneDeep(this.ingredients).map((ingredient) => {
          const ingr = new Ingredient(ingredient);
          ingr.setAvailable(this.ingredientsAvailable ?? [], this.ingredientsConversion ?? []);

          return ingr;
        });

        this.ingredientsSorted = ingredients.sort((a, b) =>
          sortAsc ? a.available - b.available : b.available - a.available
        );
        break;

      default:
        break;
    }
  }

  getNextIntructionTitle(title: string): string | null {
    if (title !== this.previousInstructionTitle) {
      this.previousInstructionTitle = title;
      return this.previousInstructionTitle;
    } else {
      return null;
    }
  }

  drop(event: CdkDragDrop<Ingredient[], any, any>) {
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
    this.ingredientsChange.emit(this.ingredients);
  }

  ingredientChanged(ingredient: IngredientChange, index: number) {
    if (ingredient.isDeleted) this.ingredients.splice(index, 1);
    else this.ingredients[index] = ingredient.ingredient;
    this.ingredientsChange.emit(this.ingredients);
    this.ingredientChange.emit(ingredient);
  }

  onAdd(value: string) {
    const ingredients = Ingredient.parseAll(value);
    if (!ingredients.length) return;
    this.ingredients = [...ingredients, ...this.ingredients];
    this.ingredientsChange.emit(this.ingredients);
  }

  onOpenAddIngredientDialog() {
    if (this.customAddIngredientDialog) {
      this.openAddIngredientDialog.emit();
      return;
    }

    this.storeApiService.completerListStores$.pipe(take(1)).subscribe((completerListStores) => {
      this.ingredientDialogsService
        .openAddOrEditIngredientDialogWithIngredientsList(this.ingredients, {
          additional: this.additional,
          completerListStores,
        })
        .subscribe((ingredients) => {
          this.ingredients = ingredients;
          this.ingredientsChange.emit(this.ingredients);
        });
    });
  }

  onRemoveAll() {
    const ingredientsCopy = this.ingredients;

    this.ingredients = [];
    this.ingredientsChange.emit(this.ingredients);

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.ingredients = ingredientsCopy;
      this.ingredientsChange.emit(this.ingredients);
    });
  }

  onChangeSortDirection(sortingDirection: SortingDirection) {
    this.sortingDirection = sortingDirection;
    this.sort();
  }

  onChangeSortType(sortType: SortType) {
    this.sortType = sortType;
    this.sort();
  }

  onAddValueChanged(searchText: string) {
    this.inputInfoText = Ingredient.findIngredientWithNameBySearchText(
      searchText,
      this.ingredients,
      this.ingredientsConversion,
      this.translateService.currentLang
    );
  }
}
