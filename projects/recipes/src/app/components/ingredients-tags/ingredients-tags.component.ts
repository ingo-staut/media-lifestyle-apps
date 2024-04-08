import { Platform } from "@angular/cdk/platform";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { IngredientConversionCompleterService } from "../../services/ingredient/ingredient-conversion.completer.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { IngredientDialogsService } from "../../services/ingredient/ingredient.dialogs.service";

@Component({
  selector: "app-ingredients-tags",
  templateUrl: "./ingredients-tags.component.html",
  styleUrls: ["./ingredients-tags.component.scss"],
})
export class IngredientsTagsComponent {
  @Input() parentFormGroup: FormGroup = new FormGroup({});
  @Input() tags: Ingredient[] = [];
  @Input() withPadding: boolean = true;
  @Input() withSpaceForScrollbar: boolean = true;
  @Input() editable: boolean = true;
  @Input() wrap: boolean = false;
  @Input() amountFactor: number = 1;
  @Input() hideIngredientNotes: boolean = true;
  @Input() editInDialog: boolean | null = false;
  @Input() ingredientsConversion: IngredientConversion[] | null = [];
  @Input() ingredientsAvailable: Ingredient[] | null = [];

  @Output() tagsChange = new EventEmitter<Ingredient[]>();
  @Output() factorButtonClicked = new EventEmitter<void>();
  @Output() hideIngredientNotesChange = new EventEmitter<boolean>();

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isMobileDevice = this.platform.ANDROID || this.platform.IOS;

  addValue = "";

  constructor(
    private platform: Platform,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    protected localeService: LocaleService,
    protected ingredientApiService: IngredientApiService,
    protected ingredientConversionCompleterService: IngredientConversionCompleterService,
    private ingredientDialogsService: IngredientDialogsService
  ) {}

  edit(tag: Ingredient, index: number, event?: Event) {
    event?.preventDefault();

    if (this.editInDialog) {
      this.ingredientDialogsService
        .openAddOrEditIngredientDialogWithIngredientsList(this.tags, {
          ingredient: tag,
          index,
          ingredientsConversion: this.ingredientsConversion,
          ingredientsAvailable: this.ingredientsAvailable,
        })
        .subscribe((tags) => {
          this.tags = tags;
          this.tagsChange.emit(this.tags);
        });
    } else {
      this.addValue = new Ingredient(tag).getIngredientString(this.translateService.currentLang);
      this.remove(tag);
    }
  }

  add(value: string): void {
    const ingredients = Ingredient.parseAll(value);
    if (!ingredients.length) return;
    this.tags = [...ingredients, ...this.tags];
    this.tagsChange.emit(this.tags);
  }

  onOpenAddIngredientDialog() {
    this.ingredientDialogsService
      .openAddOrEditIngredientDialogWithIngredientsList(this.tags)
      .subscribe((ingredients) => {
        this.tags = ingredients;
        this.tagsChange.emit(this.tags);
      });
  }

  remove(tag: Ingredient): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }

    this.tagsChange.emit(this.tags);
  }

  onRemoveAll() {
    const tagsCopy = this.tags;
    this.tags = [];
    this.tagsChange.emit(this.tags);

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.tags = tagsCopy;
      this.tagsChange.emit(this.tags);
    });
  }
}
