import { Clipboard } from "@angular/cdk/clipboard";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Platform } from "@angular/cdk/platform";
import { Location } from "@angular/common";
import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatAccordion } from "@angular/material/expansion";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { FormErrorsPipe } from "projects/recipes/src/pipes/form-errors.pipe";
import { getRecipe } from "projects/recipes/src/utils/recipe-import/recipe.import.json";
import { preventBrowserTabClosing } from "projects/recipes/src/utils/warning-dialog";
import { Subject, combineLatest, map, startWith, take, takeUntil } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { FormfieldType, SuffixPadding } from "shared/models/enum/formfield.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { Url } from "shared/models/url.class";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { SearchEngineApiService } from "shared/services/search-engine/search-engine.api.service";
import { UrlService } from "shared/services/url.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_NORMAL_SCREEN_MAX,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { scrollToElementById } from "shared/utils/scroll";
import { ShareService } from "../../../../../../shared/services/share.service";
import { DropdownWithGroupsComponent } from "../../components/dropdown-with-groups/dropdown-with-groups.component";
import { IngredientChange } from "../../components/ingredients-list/ingredients-list.component";
import {
  AVAILABLE_DROPDOWN_DATA,
  showIngredientFilterByAvailable,
} from "../../data/available.data";
import { CATEGORIES } from "../../data/category.data";
import { INGREDIENT_CONTENTS_DROPDOWN_DATA } from "../../data/ingredient-contents.data";
import { RECIPE_DROPDOWN } from "../../data/recipe-dialog.dropdowns.data";
import { CategoryType, findCategoryByType } from "../../models/enum/category.enum";
import { IngredientConversionContentType } from "../../models/enum/ingredient-conversion-content.enum";
import { PreparationHistoryType } from "../../models/enum/preparation-history.enum";
import { IngredientFilterListSelectedKeys } from "../../models/filter-ingredients-selected-keys.type";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { Instruction } from "../../models/instruction.class";
import { Nutrition } from "../../models/nutrition.type";
import { PreparationHistoryEntry } from "../../models/preparation-history.class";
import { RecipeOnShoppingList } from "../../models/recipe-shoppinglist.type";
import { Recipe } from "../../models/recipe.class";
import { Utensil } from "../../models/utensil.class";
import { WithInList } from "../../pages/shopping-list/shopping-list.component";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { InstructionDialogsService } from "../../services/instruction.dialogs.service";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { RecipeCompleterService } from "../../services/recipe/recipe.completer.service";
import { RecipeDialogsService } from "../../services/recipe/recipe.dialogs.service";
import { RequestService } from "../../services/request.service";
import { RoutingService } from "../../services/routing.service";
import { UtensilObjectApiService } from "../../services/utensil-object/utensil-object.api.service";
import { DialogService } from "../dialog/dialog.service";

export type OptionalsType = {
  searchText?: string;
  openEditTitle?: boolean;
  triggerQuickAdd?: boolean;
};

@Component({
  selector: "app-recipe-dialog",
  templateUrl: "./recipe-dialog.component.html",
  styleUrls: ["./recipe-dialog.component.scss"],
})
export class RecipeDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild("catgorieSelect") catgorieSelect: DropdownWithGroupsComponent<CategoryType>;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isNormalScreen = MEDIA_QUERY_NORMAL_SCREEN_MAX;
  CategoryType = CategoryType;
  CATEGORIES = CATEGORIES;
  RecipeDropdown = RECIPE_DROPDOWN;
  AVAILABLE_DROPDOWN_DATA = AVAILABLE_DROPDOWN_DATA;
  INGREDIENT_CONTENTS_DROPDOWN_DATA = INGREDIENT_CONTENTS_DROPDOWN_DATA;
  findCategoryByType = findCategoryByType;
  PreparationHistoryType = PreparationHistoryType;
  PreparationHistoryEntry = PreparationHistoryEntry;
  SearchEngineType = SearchEngineType;

  private readonly destroySubject = new Subject<void>();

  isMobileDevice = this.platform.ANDROID || this.platform.IOS;
  formGroup: ReturnType<typeof this.initializeFormGroup>;

  filterListSelectedKeys: IngredientFilterListSelectedKeys = {
    available: "all",
    contents: "all",
  };

  savingAllowed = false;

  favorite = false;
  basic = false;
  isOnShoppingList: RecipeOnShoppingList | null = null;
  preparationHistory: PreparationHistoryEntry[];
  linkedRecipes: Recipe[] = [];
  similarRecipes: Recipe[] = [];

  isStepsView = false;
  selectedStepIndex = 2;
  width = 0;

  saveButtonTooltip = "";

  completerListRecipes$ = this.recipeCompleterService.completerListRecipes$.pipe(
    takeUntil(this.destroySubject)
  );
  completerListPreparationHistory$ =
    this.recipeCompleterService.completerListPreparationHistory$.pipe(
      takeUntil(this.destroySubject)
    );
  completerListTags$ = this.recipeCompleterService.completerListTags$.pipe(
    takeUntil(this.destroySubject)
  );

  recipe_tmp: Recipe = cloneDeep(new Recipe({ ...this.data.recipe }));

  instructions: Instruction[] = [];

  FormfieldType = FormfieldType;
  SuffixPadding = SuffixPadding;
  WithRecipesInList = WithInList;

  instructionsFormGroup: FormGroup;

  selectedIndex = 0;
  openPreparationStepIndex = -1;

  amountFactor = 1;
  hideUtensils = true;
  hideIngredients = true;
  hideIngredientNotes = true;

  // Utensilien + Zutaten
  readonly EXTRA_STEPS = 2;

  searchText = "";
  editableIngredientsInList = true;

  dragPosition = { x: 0, y: 0 };
  showDialogWindowResetButton = false;
  lockDragging = this.isNormalScreen.matches;
  blinkFirstHistoryEntry: Date | null = null;

  get instructionControls() {
    return this.formGroup.controls.instructions as FormArray;
  }

  get nutritions() {
    return this.data.recipe.nutritionDetails && this.data.recipe.nutritionDetails.length
      ? this.data.recipe.nutritionDetails[0]
      : undefined;
  }

  nutritionMenuItems = [
    {
      text: "NUTRITION.S",
      icon: "nutrition",
      value: "open-dialog",
      groupKey: "open-dialog",
    },
    {
      text: "QUICKADD.",
      icon: "quick-add",
      value: "quick-add",
      groupKey: "quick-add",
    },
    {
      text: "Rezeptrechner",
      image: "https://www.rezeptrechner-online.de/rezeptrechner_logo.jpg",
      value: "https://www.rezeptrechner-online.de/",
    },
    {
      text: "Nutriscore Rechner",
      icon: "keymap",
      value: "https://www.ladr-lebensmittel.de/service/rechner/nutriscore",
    },
  ];

  constructor(
    private dialogRef: MatDialogRef<RecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { recipe: Recipe } & { stepsView: boolean } & OptionalsType,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private notificationService: NotificationService,
    private routingService: RoutingService,
    private recipeApiService: RecipeApiService,
    private recipeDialogsService: RecipeDialogsService,
    private recipeCompleterService: RecipeCompleterService,
    private location: Location,
    private dialogService: DialogService,
    private formErrorsPipe: FormErrorsPipe,
    private shareService: ShareService,
    private instructionDialogsService: InstructionDialogsService,
    private searchEngineApiService: SearchEngineApiService,
    private requestService: RequestService,
    private clipboard: Clipboard,
    private urlService: UrlService,
    protected translateService: TranslateService,
    protected ingredientApiService: IngredientApiService,
    protected utensilObjectApiService: UtensilObjectApiService,
    protected localeService: LocaleService
  ) {}

  ngAfterViewInit(): void {
    if (this.data.openEditTitle) this.openTitlesDialog();
  }

  ngOnInit(): void {
    this.isStepsView = this.data.stepsView;

    if (this.data.triggerQuickAdd && this.data.recipe.urls.length)
      this.quickAddDataOnTrigger(this.data.recipe.urls[0]);

    if (this.data.recipe.id) {
      this.recipeApiService
        .getRecipeById(this.data.recipe.id)
        .pipe(takeUntil(this.destroySubject))
        .subscribe((recipe) => {
          const equal = this.recipe_tmp.isEqualTo(recipe);
          if (!equal.equal) {
            this.notificationService
              .show(NotificationTemplateType.RECIPE_WAS_CHANGED, {
                additionalMessages: equal.messages.map((message) =>
                  this.translateService.instant(message)
                ),
              })
              ?.subscribe(() => {
                this.data.recipe = recipe;
                this.recipe_tmp = cloneDeep(this.data.recipe);
                this.formGroup.patchValue(this.data.recipe);
                // this.formGroup.markAsDirty();
                this.checkSavingAllowed();
              });

            console.log('Änderungen zwischen "recipe_tmp" und "recipe"', { diff: equal.diff });
          }
        });
    }

    this.setUrl(this.data.recipe.id, this.isStepsView);

    this.favorite = this.data.recipe.favorite;
    this.basic = this.data.recipe.basic;
    this.isOnShoppingList = this.data.recipe.isOnShoppingList;
    this.preparationHistory = [...this.data.recipe.preparationHistory];

    // Breite und Höhe von Rezepte-Dialog ändern: RECIPE_DIALOG_SIZE
    this.isNormalScreen.onchange = (e) => {
      this.dialogRef.updateSize(e.matches ? "100vw" : "80vw", e.matches ? "100dvh" : "80vh");
      this.lockDragging = e.matches;
      if (e.matches) {
        this.onDialogWindowReset();
      }
    };

    // Initiales Formular
    this.formGroup = this.initializeFormGroup();

    this.addIntructionControls(this.data.recipe.instructions);

    // Änderungen in Formular
    this.formGroup.valueChanges.pipe(takeUntil(this.destroySubject)).subscribe((values) => {
      this.checkSavingAllowed();
    });

    // Ähnliche Rezepte zusammenstellen
    combineLatest([
      this.formGroup.controls.name.valueChanges.pipe(startWith(this.data.recipe.name)),
      this.formGroup.controls.tags.valueChanges.pipe(startWith(this.data.recipe.tags)),
      this.formGroup.controls.category.valueChanges.pipe(startWith(this.data.recipe.category)),
      this.formGroup.controls.linkedRecipes.valueChanges.pipe(
        startWith(this.data.recipe.linkedRecipes)
      ),
      this.recipeApiService.recipes$.pipe(startWith([])),
    ])
      .pipe(takeUntil(this.destroySubject))
      .subscribe(([title, tags, category, linkedRecipes, recipes]) => {
        if (
          !recipes ||
          !recipes.length ||
          !title ||
          !tags ||
          !category ||
          category <= 0 ||
          !linkedRecipes
        )
          return;

        const similar = recipes.filter(
          (recipe) =>
            // Titel ähnlich
            (recipe.name.includes(title) ||
              title.includes(recipe.name) ||
              // ODER: Mind. 1 Tag gleich
              tags.some((tag) => recipe.tags.includes(tag)) ||
              recipe.tags.some((tag) => tags.includes(tag))) &&
            // Selbe Kategorie
            recipe.category === category &&
            // Nicht das aktuelle Rezept hinzufügen
            this.data.recipe.id !== recipe.id &&
            // Nicht bereits verlinkte Rezepte vorschlagen
            !linkedRecipes.includes(recipe.id)
        );

        // Max. 10 Rezepte vorschlagen
        this.similarRecipes = similar.slice(0, 10);
      });

    this.formGroup.controls.instructions.valueChanges
      .pipe(takeUntil(this.destroySubject), startWith(this.data.recipe.instructions))
      .subscribe((instructions) => {
        this.checkSavingAllowed();
        this.instructions =
          instructions.flatMap((instruction) => (instruction ? [instruction] : [])) ?? [];
      });

    // Verlinkte Rezepte laden
    combineLatest([
      this.recipeApiService.recipes$,
      // Braucht einen initialen Wert
      // Triggert u.a. wenn "reset" geklickt wird
      this.formGroup.statusChanges.pipe(startWith("INVALID")),
    ])
      .pipe(
        map(([r, status]) => {
          return r.filter((r) => {
            if (this.formGroup.controls.linkedRecipes.value?.includes(r.id)) return r;
            return;
          });
        }),
        takeUntil(this.destroySubject)
      )
      .subscribe((recipes) => {
        this.linkedRecipes = recipes;
      });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  initializeFormGroup() {
    return this.formBuilder.group({
      name: [this.data.recipe.name, Validators.required],
      note: [this.data.recipe.note],
      images: [this.data.recipe.images],
      tags: [this.data.recipe.tags],
      cuisines: [this.data.recipe.cuisines],
      urls: [this.data.recipe.urls],
      rating: [this.data.recipe.rating],
      difficulty: [this.data.recipe.difficulty],
      amountNumber: [this.data.recipe.amountNumber, Validators.required],
      amountText: [this.data.recipe.amountText, Validators.required],
      portions: [this.data.recipe.portions, Validators.required],
      instructions: this.formBuilder.array([] as Instruction[]),
      preparationHistory: [this.data.recipe.preparationHistory],
      linkedRecipes: [this.data.recipe.linkedRecipes],
      category: [
        this.data.recipe.category,
        [
          Validators.required,
          // Keine 0 als Value, also nicht "Keine Kategorie"
          Validators.pattern(/[^0]+/),
        ],
      ],
    });
  }

  setUrl(id: string, steps: boolean): void {
    const url = this.routingService.getRecipeRoute(id, steps, "merge");
    this.location.replaceState(url);
  }

  async quickAddDataOnTrigger(url: Url) {
    const data = await this.requestService.requestUrl(url.url);

    const recipe = getRecipe(data, url.url, this.utensilObjectApiService.utensilObjectsSnapshot);

    if (!recipe) {
      this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);
      return;
    }

    this.data.recipe = recipe;
    this.formGroup.patchValue(recipe);
    this.addIntructionControls(recipe.instructions);

    this.checkSavingAllowed();
  }

  onChangeRecipeMode(): void {
    this.isStepsView = !this.isStepsView;

    this.setUrl(this.data.recipe.id, this.isStepsView);
  }

  /**
   * Zubereitungen zum Formular hinzufügen
   */
  addIntructionControls(instructions: (Instruction | null)[]) {
    instructions.forEach((instruction) => {
      instruction && this.addInstructionControl(instruction);
    });
  }

  /**
   * Zubereitung zum Formular hinzufügen
   */
  addInstructionControl(instruction: Instruction) {
    const instructionForm = this.formBuilder.group({
      name: [instruction.name, Validators.required],
      note: instruction.note,
      optional: instruction.optional,
      minTime: instruction.minTime,
      maxTime: instruction.maxTime,
      text: instruction.text,
      temperature: instruction.temperature,
      preparationType: instruction.preparationType,
      level: instruction.level,
      utensils: [instruction.utensils],
      ingredients: [instruction.ingredients],
      _lastAdded: [instruction._lastAdded],
    });

    (this.formGroup.controls["instructions"] as FormArray).push(instructionForm);
  }

  /**
   * Überprüfen ob gespeichert werden darf
   */
  checkSavingAllowed() {
    const isEqual = this.recipe_tmp.isEqualTo(this.currentData());
    const add = this.data.recipe.id === "";

    // Rezept hinzufügen muss nur VALID sein,
    // aber der Inhalt kann derselbe sein
    this.savingAllowed = add
      ? this.formGroup.status === "VALID"
      : this.formGroup.status === "VALID" && !isEqual.equal;

    this.saveButtonTooltip = "ACTION.SAVE";

    // Nur wenn es nicht gleich ist
    // und ein Rezept bearbeitet wird, anzeigen
    if (!isEqual.equal && !add) {
      this.saveButtonTooltip =
        this.translateService.instant("CHANGED_DATA") +
        ": " +
        isEqual.messages.map((m) => this.translateService.instant(m)).join(", ");
    }
  }

  onSave() {
    this.dialogRef.close(this.currentData());
  }

  /**
   * Schließen des Dialogs
   */
  onClose() {
    this.dialogRef.close();
  }

  /**
   * Aktuelle Daten im Formular, aber auch extra Daten
   * (Enthält nicht den neuen Zeitstemel in der Bearbeitungshistorie)
   * @returns Daten, die aktuell gesetzt sind
   */
  private currentData() {
    return new Recipe({
      ...this.data.recipe,
      ...(this.formGroup.getRawValue() as Recipe),
      favorite: this.favorite,
      basic: this.basic,
      isOnShoppingList: this.isOnShoppingList,
      preparationHistory: this.preparationHistory,
    });
  }

  dropInstruction(event: CdkDragDrop<Instruction[]>) {
    const instructions = this.formGroup.controls.instructions.value;

    moveItemInArray(instructions, event.previousIndex, event.currentIndex);

    (this.formGroup.controls.instructions as FormArray).clear();
    this.addIntructionControls(instructions);

    this.formGroup.patchValue({ instructions });

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Zurücksetzen der Rezeptdetails
   */
  onReset() {
    if (this.data.recipe.id) {
      this.recipeApiService
        .getRecipeById(this.data.recipe.id)
        .pipe(take(1))
        .subscribe((recipe) => {
          this.formGroup.reset(recipe);
          this.favorite = recipe.favorite;
          this.basic = recipe.basic;
          this.isOnShoppingList = recipe.isOnShoppingList;

          (this.formGroup.controls["instructions"] as FormArray).clear();

          this.addIntructionControls(recipe.instructions);

          this.data.recipe = recipe;
          this.recipe_tmp = cloneDeep(recipe);

          this.formGroup.markAsPristine();
          this.checkSavingAllowed();
        });
    }
  }

  /**
   * Auf Favorit geklickt
   */
  onFavorite() {
    this.formGroup.markAsDirty();
    this.favorite = !this.favorite;
    this.formGroup.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  /**
   * Auf Grundrezept geklickt
   */
  onBasicRecipe() {
    this.formGroup.markAsDirty();
    this.basic = !this.basic;
    this.formGroup.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  /**
   * Verschieben des Dialogfensters gestartet
   */
  onDragStarted() {
    this.showDialogWindowResetButton = true;
    const elements = document.getElementsByClassName("cdk-overlay-backdrop");
    for (var i = 0; i < elements.length; i++) {
      (elements.item(i) as HTMLElement).style.display = "none";
    }
  }

  /**
   * Dialogfenster zurücksetzen
   */
  onDialogWindowReset() {
    this.showDialogWindowResetButton = false;
    (document.getElementsByClassName("cdk-overlay-backdrop")[0] as HTMLElement).style.display =
      "block";
    this.dragPosition = { x: 0, y: 0 };
  }

  // /**
  //  * Zutaten wurden geändert
  //  */
  // onIngredientsChanged(ingredients: Ingredient[]) {
  //   this.formGroup.patchValue({ ingredients: [...ingredients] });
  //   this.formGroup.markAsDirty();
  //   this.checkSavingAllowed();
  // }

  /**
   * Tags wurden geändert
   */
  onTagsChanged(tags: string[]) {
    this.formGroup.patchValue({ tags: [...tags] });
    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  onCuisinesChanged(cuisines: string[]) {
    this.formGroup.patchValue({ cuisines: [...cuisines] });
    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Urls wurden geändert
   */
  onUrlsChanged(urls: Url[]) {
    this.formGroup.patchValue({ urls: [...urls] });
    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Zubereitungseintrag hinzufügen
   */
  onAddInstruction(value: string) {
    if (!value?.trim()) return;

    const instruction = Instruction.parse(value);
    if (instruction) {
      const instructions = [...this.formGroup.controls.instructions.value];
      instruction._lastAdded = new Date();
      instructions.push(instruction);

      this.addInstructionControl(instruction);

      this.formGroup.patchValue({ instructions });

      this.formGroup.markAsDirty();
      this.checkSavingAllowed();
    }
  }

  onAccordionActionClicked(instruction: Instruction, index: number, actionId: string) {
    if (actionId === "delete") {
      this.onRemoveInststruction(index);
    } else if (actionId === "edit") {
      this.instructionDialogsService
        .openAddOrEditInstruction(instruction, index)
        .subscribe((instruction) => {
          // Zubereitungsschritt löschen
          if (!instruction) {
            const instructions = [...this.formGroup.controls.instructions.value];

            this.formGroup.controls.instructions.removeAt(index);
            instructions.splice(index, 1);

            this.formGroup.patchValue({ instructions });

            this.formGroup.markAsDirty();
            this.checkSavingAllowed();
          }

          // Zubereitungsschritt hat sich geändert
          else {
            const instructions = [...this.formGroup.controls.instructions.value];

            instructions[index] = instruction;

            this.formGroup.patchValue({ instructions });

            this.formGroup.markAsDirty();
            this.checkSavingAllowed();
          }
        });
    } else if (actionId === "preparationDetails") {
      this.instructionDialogsService
        .openAddOrEditInstructionDetails(instruction, false)
        .subscribe((instruction) => {
          const instructions = [...this.formGroup.controls.instructions.value];

          instructions[index] = instruction;

          this.formGroup.patchValue({ instructions });

          this.formGroup.markAsDirty();
          this.checkSavingAllowed();
        });
    } else if (actionId === "optional") {
      const instructions = [...this.formGroup.controls.instructions.value];

      const instruction = instructions[index];
      if (!instruction) return;

      instruction.optional = !instruction.optional;

      instructions[index] = instruction;

      this.formGroup.patchValue({ instructions });

      this.formGroup.markAsDirty();
      this.checkSavingAllowed();
    } else if (actionId === "utensils") {
      this.hideUtensils = false;
      document
        .getElementById("accordion-preparation-" + index.toString() + "-more-button-collapsed")
        ?.click();
    } else if (actionId === "ingredients") {
      this.hideIngredients = false;
      document
        .getElementById("accordion-preparation-" + index.toString() + "-more-button-collapsed")
        ?.click();
    }
    // Zutaten, Utensils, ... geklickt
    else {
      // Button nur klicken, wenn zusammengeplappt
      document
        .getElementById("accordion-preparation-" + index.toString() + "-more-button-collapsed")
        ?.click();
    }
  }

  accordionChange(expandAll: boolean) {
    if (expandAll) {
      this.accordion.openAll();
    } else {
      this.accordion.closeAll();
    }
  }

  /**
   * Zubereitungseintrag entfernen
   */
  onRemoveInststruction(index: number) {
    const instructions = [...this.formGroup.controls.instructions.value];
    instructions.splice(index, 1);

    this.formGroup.patchValue({ instructions });

    // Es wird zwar in der Liste mit `splice` der Wert entfent,
    // und mit `patchValue` die neue Liste gesetzt,
    // so werden die Controls im FormArray angepasst
    // und das letzte Element würde einfach das Letzte bleiben,
    // der letzte Wert wäre dann doppelt,
    // somit wird immer das letzte Element entfernt
    (this.formGroup.controls.instructions as FormArray).removeAt(
      this.formGroup.controls.instructions.length - 1
    );

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Alle Zubereitungseinträge entfernen
   */
  onRemoveAllInstructions(withNotification: boolean = true) {
    const instructionsCopy = [...(this.formGroup.controls.instructions.value ?? [])];

    this.formGroup.patchValue({ instructions: [] });
    (this.formGroup.controls.instructions as FormArray).clear();

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();

    if (!withNotification) return;

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.formGroup.patchValue({ instructions: instructionsCopy });

      this.addIntructionControls(instructionsCopy);

      this.checkSavingAllowed();
    });
  }

  onOpenAddInstructionDialog() {
    this.instructionDialogsService.openAddOrEditInstruction().subscribe((instruction) => {
      if (!instruction) return;

      this.addInstructionControl(instruction);

      this.formGroup.markAsDirty();
      this.checkSavingAllowed();
    });
  }

  async onQuickAddInstructions() {
    const text = await navigator.clipboard.readText();

    const instructions = Instruction.getInstructionsWithDetailsAndTitleOfMultilineText(text);

    // Wenn keine Zubereitungsschritte gefunden wurden, dann abbrechen
    if (instructions.length === 0 || text?.trim().length < 50) {
      this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND)?.subscribe();
      return;
    }

    // Wenn keine Zubereitungsschritte vorhanden sind, dann direkt hinzufügen
    if (this.formGroup.controls.instructions.value.length === 0) {
      instructions.forEach((i) => {
        i._lastAdded = new Date();
        this.addInstructionControl(i);
      });
      return;
    }

    const data: DialogData = {
      title: "QUICKADD.REPLACE_OR_ADD.TITLE",
      text: "QUICKADD.REPLACE_OR_ADD.TEXT",
      icons: ["replace"],
      textReplace: {
        amount: this.formGroup.controls.instructions.value.length,
        value: this.translateService.instant("INSTRUCTION.S"),
      },
      actionPrimary: {
        key: "replace",
        text: "REPLACE.", // Ersetzen
        icon: "replace",
      },
      actions: [
        {
          key: "add",
          text: "ACTION.ADD", // Hinzufügen
          icon: "add",
        },
      ],
      actionCancel: true,
    };

    this.dialogService.open(data).subscribe((data) => {
      if (data && data.actionKey === "replace") {
        this.onRemoveAllInstructions(false);
        instructions.forEach((i) => this.addInstructionControl(i));
      } else if (data && data.actionKey === "add") {
        instructions.forEach((i) => {
          i._lastAdded = new Date();
          this.addInstructionControl(i);
        });
      }
    });

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  async onQuickAddIngredients() {
    const text = await navigator.clipboard.readText();

    // Ohne Zubereitungsschritte kann nichts hinzugefügt werden
    if (this.formGroup.controls.instructions.value.length === 0) {
      this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND)?.subscribe();
      return;
    }

    const ingredients = Ingredient.getIngredientsOfMultilineText(
      text,
      this.ingredientApiService.ingredientsConversionSnapshot
    );

    // Wenn keine Zutaten gefunden wurden, dann abbrechen
    if (ingredients.length === 0) {
      this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND)?.subscribe();
      return;
    }

    const instructions = Ingredient.addIngredientsToInstructions(
      ingredients,
      cloneDeep(this.formGroup.controls.instructions.value.filter((i): i is Instruction => !!i))
    );

    this.onRemoveAllInstructions(false);
    this.addIntructionControls(instructions);

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  onRemoveAllIngredients() {
    this.onRemoveAll(true);
  }

  onRemoveAllUtensils() {
    this.onRemoveAll(false);
  }

  onRemoveAll(removeAllIngredients: boolean) {
    const backup: (Ingredient | Utensil)[][] = [];

    const instructionsFromForm = this.formGroup.controls.instructions.value.map((instruction) => {
      if (!instruction) return instruction;

      if (removeAllIngredients) {
        backup.push(cloneDeep(instruction.ingredients));
        instruction.ingredients = [];
      } else {
        backup.push(cloneDeep(instruction.utensils));
        instruction.utensils = [];
      }

      return instruction;
    });

    this.formGroup.controls.instructions.patchValue(instructionsFromForm);

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      const instructions = instructionsFromForm.map((instruction, index) => {
        if (!instruction) return instruction;

        if (removeAllIngredients) {
          instruction.ingredients = backup[index] as Ingredient[];
        } else {
          instruction.utensils = backup[index] as Utensil[];
        }

        return instruction;
      });

      this.formGroup.controls.instructions.patchValue(instructions);

      this.formGroup.markAsDirty();
      this.checkSavingAllowed();
    });
  }

  onQuickAddUtensils() {
    const instructions = Utensil.findUtensilsAndAddToInstructions(
      this.formGroup.controls.instructions.value! as Instruction[],
      this.utensilObjectApiService.utensilObjectsSnapshot
    );

    this.formGroup.controls.instructions.patchValue(instructions);

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  onIngredientChange(ingr: IngredientChange) {
    const { ingredient, isDeleted } = ingr;

    const instructions = this.formGroup.controls.instructions.value.map((instruction) => {
      if (!instruction) return instruction;
      // Bisher nur Löschen hizugefügt
      if (isDeleted) {
        instruction.ingredients = instruction.ingredients.filter(
          (i) => !new Ingredient(i).equalAll(ingredient)
        );
      }
      return instruction;
    });

    // WORKAROUND: Oben wird nicht erkannt, dass es Änderungen gibt (auch nicht mit forEach)
    this.formGroup.patchValue({ instructions });

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  onIngredientsChangeWithInstructionIndex(index: number, ingredients: Ingredient[]): void {
    const instructions = this.formGroup.controls.instructions.value;
    const instruction = instructions[index];

    if (!instruction) return;

    instruction.ingredients = ingredients;
    instructions[index] = instruction;

    // WORKAROUND: Oben wird nicht erkannt, dass es Änderungen gibt (auch nicht mit forEach)
    this.formGroup.patchValue({ instructions });

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  onUtensilsChangeWithInstructionIndex(index: number, utensils: Utensil[]): void {
    const instructions = this.formGroup.controls.instructions.value;
    const instruction = instructions[index];

    if (!instruction) return;

    instruction.utensils = utensils;
    instructions[index] = instruction;

    // WORKAROUND: Oben wird nicht erkannt, dass es Änderungen gibt (auch nicht mit forEach)
    this.formGroup.patchValue({ instructions });

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  onOpenInstructionByIndex(index: string) {
    // Zum Tab "Zuebereitungen"
    this.selectedIndex = 0;

    this.openPreparationStepIndex = +index;
  }

  onGoToInstructionByIndex(index: string): void {
    this.selectedStepIndex = +index + 2;
  }

  /**
   * Zubereitungseintrag wurde geändert
   */
  onInstructionChange(instruction: Instruction | null, index: number) {
    const instructions = [...this.formGroup.controls.instructions.value];
    if (!instruction) instructions.splice(index, 1);
    else instructions[index] = instruction;

    this.formGroup.patchValue({ instructions: [...instructions] });
    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Alle Zubereitungshistorieneinträge entfernen
   */
  onRemoveAllPreparationHistory() {
    const preparationHistoryCopy = [...(this.formGroup.controls.preparationHistory.value ?? [])];

    this.formGroup.patchValue({ preparationHistory: [] });
    this.formGroup.markAsDirty();

    this.preparationHistory = [];
    this.checkSavingAllowed();

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.formGroup.patchValue({ preparationHistory: preparationHistoryCopy });
      this.preparationHistory = preparationHistoryCopy;
      this.checkSavingAllowed();
      scrollToElementById("history");
    });
  }

  onPortionsLeftClicked() {
    this.blinkFirstHistoryEntry = new Date();
    scrollToElementById("history");
  }

  /**
   * Zuberetungshistorieneintrag entfernen
   */
  onRemovePreparationHistoryEntry(index: number) {
    const sortedList =
      this.formGroup.controls.preparationHistory.value
        ?.slice()
        ?.sort(PreparationHistoryEntry.sortDescending) ?? [];

    const preparationHistory = [...sortedList];
    preparationHistory.splice(index, 1);

    this.preparationHistory = preparationHistory;

    this.formGroup.patchValue({ preparationHistory });

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Zubereitungshistorieneintrag hinzufügen
   */
  onAddPreparationHistoryEntry(value: string) {
    const preparationHistoryEntry = PreparationHistoryEntry.parse(value, this.translateService);
    this.addPreparationHistoryEntry(preparationHistoryEntry);
  }

  onEditPreparationHistoryEntry(entry: PreparationHistoryEntry, index: number) {
    this.onRemovePreparationHistoryEntry(index);
    this.addPreparationHistoryEntry(entry);
  }

  /**
   * QuickAdd: Zubereitungshistorieneintrag hinzufügen
   */
  quickAddPreparationHistoryEntry(dayOffset: number, type: PreparationHistoryType) {
    const date = DateFns.addDaysToDate(new Date(), dayOffset);
    this.addPreparationHistoryEntry(
      new PreparationHistoryEntry({
        amount: this.formGroup.controls.amountNumber.value ?? 0,
        date,
        type,
        portionsAvailable:
          type === PreparationHistoryType.PREPARED
            ? Math.max((this.formGroup.controls.portions.value ?? 0) - 1, 0)
            : null,
      })
    );
  }

  /**
   * Zubereitungshistorieneintrag hinzufügen
   */
  private addPreparationHistoryEntry(preparationHistoryEntry: PreparationHistoryEntry) {
    if (preparationHistoryEntry) {
      const preparationHistory = [...(this.formGroup.controls.preparationHistory.value ?? [])];
      preparationHistory.push(preparationHistoryEntry);

      this.preparationHistory = preparationHistory;

      this.formGroup.patchValue({ preparationHistory });

      this.formGroup.markAsDirty();
      this.checkSavingAllowed();

      scrollToElementById("history");
    }
  }

  /**
   * Teilen geklickt
   */
  onShare() {
    this.shareService.share(
      this.shareContent(),
      "Rezept: " + this.data.recipe.name,
      this.data.recipe.name + ":"
    );
  }

  /**
   * Teileninhalt zurückgeben
   */
  shareContent() {
    // Aktuelle URL mit allen Parametern und Unterseiten
    return window.location.href;
  }

  /**
   * Rezept verlinken
   */
  onAddLinkedRecipe(name: string) {
    name = name.trim();
    if (name) {
      this.recipeApiService
        .findRecipeByName(name)
        .pipe(take(1))
        .subscribe((recipe) => {
          if (recipe) {
            const linkedRecipes = [...(this.formGroup.controls.linkedRecipes.value ?? [])];

            // Ist das Rezept bereits verlinkt?
            if (linkedRecipes.includes(recipe.id)) {
              this.notificationService.show(NotificationTemplateType.RECIPE_ALREADY_LINKED);
              return;
            }

            linkedRecipes.push(recipe.id);
            this.linkedRecipes.push(recipe);

            this.formGroup.patchValue({ linkedRecipes });

            this.formGroup.markAsDirty();
            this.checkSavingAllowed();
          } else {
            this.notificationService.show(NotificationTemplateType.RECIPE_NOT_FOUND);
          }
        });
    }
  }

  /**
   * Verlinktes Rezept entfernen
   */
  onRemoveLinkedRecipe(id: string) {
    let linkedRecipes = [...(this.formGroup.controls.linkedRecipes.value ?? [])];
    linkedRecipes = linkedRecipes.filter((recipeId) => recipeId !== id);

    this.linkedRecipes = this.linkedRecipes.filter((recipes) => recipes.id !== id);

    this.formGroup.patchValue({ linkedRecipes });

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Rezept verlinken
   */
  onLinkRecipe(id: string) {
    // Falls Rezept bereits verlinkt ist, nicht verlinken
    if (this.formGroup.controls.linkedRecipes.value?.includes(id)) {
      this.notificationService.show(NotificationTemplateType.RECIPE_ALREADY_LINKED);
      return;
    }

    let linkedRecipes = [...(this.formGroup.controls.linkedRecipes.value ?? []), id];

    this.linkedRecipes = this.linkedRecipes.filter((recipes) => recipes.id !== id);

    this.formGroup.patchValue({ linkedRecipes });

    this.formGroup.markAsDirty();
    this.checkSavingAllowed();
  }

  /**
   * Alle verlinkten Rezepte entfernen
   */
  onRemoveAllLinkedRecipes() {
    const copy = [...(this.formGroup.controls.linkedRecipes.value ?? [])];

    this.linkedRecipes = [];
    this.formGroup.patchValue({ linkedRecipes: [] });
    this.formGroup.markAsDirty();
    this.checkSavingAllowed();

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.formGroup.patchValue({ linkedRecipes: copy });
      this.checkSavingAllowed();
    });
  }

  onAddToShoppingList() {
    this.recipeDialogsService
      .openAddToShoppingListDialog(
        this.isOnShoppingList,
        this.formGroup.controls.amountNumber.value ?? 1
      )
      .subscribe((result) => {
        this.isOnShoppingList = result;
        this.formGroup.markAsDirty();
        this.checkSavingAllowed();
      });
  }

  onShowErrors() {
    this.formGroup.markAllAsTouched();
    this.dialogService.open({
      title: "ERRORS",
      text: this.formErrorsPipe.transform("", this.formGroup, true).join("<br>"),
      icons: ["error"],
      actionClose: true,
    } as DialogData);
  }

  onNextStep() {
    const max = this.formGroup.controls["instructions"].value.length + this.EXTRA_STEPS - 1;
    const index = this.selectedStepIndex + 1;
    this.selectedStepIndex = Math.min(index, max);
  }

  onPreviousStep() {
    const index = this.selectedStepIndex - 1;
    this.selectedStepIndex = Math.max(index, 0);
  }

  // onDropImage(event: any) {
  //   event.stopPropagation();
  //   event.preventDefault();
  //   var files = event.target.files; // Array of all files
  // }

  // onImageChange(event: Event) {
  //   console.log("onImageChange", event);
  // }

  onRemoveRecipe() {
    this.dialogService
      .open({
        title: "RECIPE.DELETE_ACTION.TITLE",
        text: "RECIPE.DELETE_ACTION.TEXT",
        icons: ["delete"],
        textReplace: { name: this.formGroup.controls.name.value },
        actionPrimary: false,
        actionDelete: true,
        actionCancel: true,
      })
      .subscribe((result) => {
        if (result) {
          this.onClose();
          this.recipeApiService.deleteRecipeById(this.recipe_tmp);
        }
      });
  }

  onOpenAddHistoryEntryDialog() {
    this.recipeDialogsService.openAddOrEditPreparationHistoryEntryDialog().subscribe((result) => {
      if (!result) return;
      this.addPreparationHistoryEntry(result);
    });
  }

  openNutritionsDialog() {
    this.recipeDialogsService
      .openNutritionsDialog(this.data.recipe.nutritionDetails[0])
      .subscribe((result) => {
        if (!result) return;

        this.data.recipe.nutritionDetails = result;
        this.checkSavingAllowed();
      });
  }

  async quickAddNutritions() {
    const text = await navigator.clipboard.readText();
    if (!text?.trim()) return;

    const nutrition = Nutrition.getNutritionOfMultilineText(text);

    if (!nutrition) {
      this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);
      return;
    }

    this.data.recipe.nutritionDetails = [nutrition];
    this.checkSavingAllowed();
  }

  showIngredientFilter = (
    ingredient: Ingredient,
    parameters: {
      ingredientsConversion?: IngredientConversion[] | null;
      ingredientsAvailable?: Ingredient[] | null;
      filterKey?: IngredientFilterListSelectedKeys;
    }
  ) => {
    const { filterKey, ingredientsConversion, ingredientsAvailable } = parameters;

    const available =
      showIngredientFilterByAvailable(
        new Ingredient(ingredient).isAvailable(
          ingredientsAvailable ?? [],
          ingredientsConversion ?? []
        ).ratio,
        filterKey?.available ?? ""
      ) || filterKey?.available === "all";

    const contents = this.filterContentsType(
      ingredient,
      filterKey?.contents ?? "all",
      ingredientsConversion ?? []
    );

    return available && contents;
  };

  filterContentsType(
    ingredient: Ingredient,
    contents: string,
    ingredientsConversion: IngredientConversion[]
  ) {
    const ingredientContents = new Ingredient(ingredient).getMostlyContentsTypeObject(
      ingredientsConversion ?? []
    )?.all;

    if (!ingredientContents)
      return contents === "all" || contents === IngredientConversionContentType.NO;

    return (
      contents === "all" ||
      ingredientContents.includes(contents as IngredientConversionContentType) ||
      (contents === IngredientConversionContentType.VEGAN_NOT &&
        !ingredientContents.includes(IngredientConversionContentType.VEGAN)) ||
      (contents === IngredientConversionContentType.VEGETARIAN_NOT &&
        !ingredientContents.includes(IngredientConversionContentType.VEGETARIAN))
    );
  }

  filterAvailableChanged(available?: string) {
    this.filterListSelectedKeys = { ...this.filterListSelectedKeys, available };
  }

  filterIngredientContentsChanged(contents?: string) {
    this.filterListSelectedKeys = { ...this.filterListSelectedKeys, contents };
  }

  openTitlesDialog() {
    this.recipeDialogsService.openTitlesDialog(this.data.recipe).subscribe((result) => {
      if (result === undefined) return;

      this.data.recipe.name = result;
      this.formGroup.controls.name.patchValue(result);

      this.checkSavingAllowed();
    });
  }

  openNoteDialog() {
    this.recipeDialogsService.openNoteDialog(this.data.recipe).subscribe((result) => {
      if (result === undefined) return;

      this.data.recipe.note = result;
      this.formGroup.controls.note.patchValue(result);

      this.checkSavingAllowed();
    });
  }

  openPortionDialog() {
    this.recipeDialogsService.openPortionDialog(this.data.recipe).subscribe((result) => {
      if (result === undefined) return;

      this.data.recipe.amountText = result.amountText;
      this.data.recipe.amountNumber = result.amountNumber;
      this.data.recipe.portions = result.portions;
      this.formGroup.controls.amountText.patchValue(result.amountText);
      this.formGroup.controls.amountNumber.patchValue(result.amountNumber);
      this.formGroup.controls.portions.patchValue(result.portions);

      this.checkSavingAllowed();
    });
  }

  openImagesDialog() {
    this.recipeDialogsService
      .openImagesDialog(
        this.data.recipe,
        this.searchEngineApiService.searchEnginesSnapshot,
        this.data.recipe.name
      )
      .subscribe((result) => {
        if (result === undefined) return;

        this.data.recipe.images = result;
        this.formGroup.controls.images.patchValue(result);

        this.checkSavingAllowed();
      });
  }

  async onQuickAdd(url: Url) {
    const data = await this.requestService.requestUrl(url.url);

    const recipe = getRecipe(data, url.url, this.utensilObjectApiService.utensilObjectsSnapshot);

    if (!recipe) {
      this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);
      return;
    }

    this.formGroup.controls.cuisines.patchValue([
      ...new Set([...(this.formGroup.controls.cuisines.value ?? []), ...recipe.cuisines]),
    ]);

    this.formGroup.controls.tags.patchValue([
      ...new Set([...(this.formGroup.controls.tags.value ?? []), ...recipe.tags]),
    ]);

    if (!this.formGroup.controls.images.value?.length) {
      this.formGroup.controls.images.patchValue(recipe.images);
    }

    if (!this.formGroup.controls.instructions.value?.length) {
      this.formGroup.controls.instructions.patchValue(recipe.instructions);
      this.addIntructionControls(recipe.instructions);
    }

    if (recipe.nutritionDetails.length) {
      this.data.recipe.nutritionDetails = recipe.nutritionDetails;

      this.checkSavingAllowed();
    }
  }

  onNutritionClicked(event: { event?: MouseEvent; value: string }) {
    if (event.value === "open-dialog") {
      this.openNutritionsDialog();
    } else if (event.value === "quick-add") {
      this.quickAddNutritions();
    } else {
      this.urlService.openOrCopyUrl({ event: event.event, url: event.value });
    }
  }

  onCopyIngredients() {
    const text = this.formGroup.controls.instructions.value
      .flatMap((instruction) => instruction?.ingredients ?? ([] as Ingredient[]))
      .map((ingredient) =>
        new Ingredient(ingredient).getIngredientString("de", [], { hideIngredientNotes: true })
      )
      .join("\n");
    this.clipboard.copy(text);
    this.notificationService.show(NotificationTemplateType.SAVED_TO_CLIPBOARD);
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeBrowserTabClose(event: any) {
    const isEqual = this.recipe_tmp.isEqualTo(this.currentData());
    const add = this.data.recipe.id === "";
    preventBrowserTabClosing(event, !isEqual.equal || add);
  }

  @HostListener("window:keydown.control.s", ["$event"])
  shortcutSave(event: any) {
    event.stopPropagation();
    event.preventDefault();

    if (this.savingAllowed) {
      this.dialogRef.close(this.currentData());
    } else {
      this.notificationService.show(NotificationTemplateType.SAVING_NOT_NEEDED, {
        messageReplace: "RECIPE.",
      });
    }
  }
}
