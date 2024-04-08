import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { SortKey } from "../../models/enum/sort.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Recipe } from "../../models/recipe.class";

@Component({
  selector: "app-search-result-item",
  templateUrl: "./search-result-item.component.html",
  styleUrls: ["./search-result-item.component.scss"],
})
export class SearchResultItemComponent implements OnChanges {
  @Input() recipe!: Recipe;
  @Input() searchTextHighlight?: string | null;
  @Input() columns: SortKey[] = [];
  @Input() ingredientsConversion: IngredientConversion[] | null;

  SortKey = SortKey;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  today = new Date();

  get lastPreparationDate() {
    return DateFns.isSameDate(this.recipe.lastPreparationDate, new Date(-1))
      ? null
      : this.recipe.lastPreparationDate;
  }

  get lastEditedDate() {
    return DateFns.isSameDate(this.recipe.lastEditedDate, new Date(-1)) ||
      this.recipe.lastEditedDate === undefined
      ? null
      : this.recipe.lastEditedDate;
  }

  get firstPlannedDate() {
    return DateFns.isSameDate(this.recipe.firstPlannedDate, new Date(-1)) ||
      this.recipe.firstPlannedDate === undefined
      ? null
      : this.recipe.firstPlannedDate;
  }

  constructor(
    private recipeDialogService: RecipeDialogService,
    protected translateService: TranslateService,
    protected localeService: LocaleService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // repeat() mit 0 ist nicht erlaubt
    if (changes["columns"]) {
      this.columns = this.columns.filter(
        (column) => column !== SortKey.SORT_NONE && column !== SortKey.SORT_ALPHABET
      );
    }
  }

  onOpen(event: Event) {
    event.stopPropagation();

    this.recipeDialogService.openAndReloadData(this.recipe, {
      searchText: this.searchTextHighlight ?? undefined,
    });
  }
}
