import { AfterViewInit, Component } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { SwUpdate, VersionReadyEvent } from "@angular/service-worker";
import { TranslateService } from "@ngx-translate/core";
import { filter } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { Icon } from "shared/models/icon";
import { DB_ID, DatabaseService } from "shared/services/database.service";
import { NotificationService } from "shared/services/notification.service";
import { VersionService } from "shared/services/version.service";
import { SearchEngineApiService } from "../../../../shared/services/search-engine/search-engine.api.service";
import json from "../version.json";
import { NotificationComponent } from "./components/notification/notification.component";
import { SettingsDialogService } from "./dialogs/settings-dialog/settings-dialog.service";
import { IngredientApiService } from "./services/ingredient/ingredient.api.service";
import { PurchaseApiService } from "./services/purchase/purchase.api.service";
import { RecipeApiService } from "./services/recipe/recipe.api.service";
import { SettingsApiService } from "./services/settings/settings.api.service";
import { StoreApiService } from "./services/store/store.api.service";
import { UtensilObjectApiService } from "./services/utensil-object/utensil-object.api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements AfterViewInit {
  iconsUrl = "../../../assets/icons/";
  iconCategoriesUrl = this.iconsUrl + "categories/";
  iconPreparationsUrl = this.iconsUrl + "preparations/";
  iconRatingsUrl = this.iconsUrl + "rating/";
  iconDifficultiesUrl = this.iconsUrl + "difficulty/";
  iconPreparationHistoryUrl = this.iconsUrl + "preparationHistory/";
  iconCalendarUrl = this.iconsUrl + "calendar/";
  iconAvailableUrl = this.iconsUrl + "available/";
  iconI18nUrl = this.iconsUrl + "i18n/";
  iconLevelUrl = this.iconsUrl + "level/";
  iconSortUrl = this.iconsUrl + "sorting/";
  iconThemeUrl = this.iconsUrl + "theme/";
  iconContentsUrl = this.iconsUrl + "contents/";
  iconNutritionUrl = this.iconsUrl + "nutrition/";
  iconUtensilsUrl = this.iconsUrl + "utensils/";
  iconSizeUrl = this.iconsUrl + "size/";

  icons: Icon[] = [
    { name: "app-favicon" },
    { name: "app-icon" },
    { name: "app-media-favicon" },
    { name: "app-media-icon" },
    { name: "arrow-down" },
    { name: "explore" },
    { name: "more" },
    { name: "separated-horizontal" },
    { name: "note" },
    { name: "note-not" },
    { name: "note-filled" },
    { name: "favorite" },
    { name: "favorite-not" },
    { name: "favorite-filled" },
    { name: "filter" },
    { name: "filter-not" },
    { name: "arrow-down" },
    { name: "arrow-up" },
    { name: "arrow-left" },
    { name: "arrow-right" },
    { name: "arrow-multiple-down" },
    { name: "arrow-multiple-up" },
    { name: "arrow-multiple-left" },
    { name: "arrow-multiple-right" },
    { name: "arrow-single-down" },
    { name: "arrow-single-up" },
    { name: "arrow-single-left" },
    { name: "arrow-single-right" },
    { name: "recipe" },
    { name: "open" },
    { name: "idea" },
    { name: "random" },
    { name: "recipe-basic" },
    { name: "recipe-basic-filled" },
    { name: "recipe-not" },
    { name: "shopping-cart" },
    { name: "shopping-cart-filled" },
    { name: "shopping-cart-not" },
    { name: "shopping-list" },
    { name: "statistics" },
    { name: "rename" },
    { name: "clear" },
    { name: "search" },
    { name: "search-show-in" },
    { name: "check" },
    { name: "add" },
    { name: "minus" },
    { name: "count-up" },
    { name: "count-down" },
    { name: "menu" },
    { name: "settings" },
    { name: "time" },
    { name: "time-not" },
    { name: "time-choose" },
    { name: "move" },
    { name: "add-to-text" },
    { name: "delete" },
    { name: "drag" },
    { name: "edit" },
    { name: "edit-not" },
    { name: "optional" },
    { name: "optional-not" },
    { name: "share" },
    { name: "portion" },
    { name: "portion-eat" },
    { name: "portion-eat-not" },
    { name: "temperature" },
    { name: "reset" },
    { name: "link" },
    { name: "unlink" },
    { name: "timer" },
    { name: "ingredient" },
    { name: "ingredient-not" },
    { name: "ingredient-conversion" },
    { name: "ingredient-conversion-add" },
    { name: "utensil" },
    { name: "utensil-not" },
    { name: "reload" },
    { name: "info" },
    { name: "info-not" },
    { name: "help" },
    { name: "screen" },
    { name: "preparation" },
    { name: "error" },
    { name: "image" },
    { name: "image-not" },
    { name: "image-filled" },
    { name: "globe" },
    { name: "keymap" },
    { name: "database" },
    { name: "language" },
    { name: "mobile" },
    { name: "history" },
    { name: "versions" },
    { name: "copyright" },
    { name: "last-edited" },
    { name: "sort-direction-asc" },
    { name: "sort-direction-desc" },
    { name: "sort-search-result" },
    { name: "alphabet" },
    { name: "store" },
    { name: "replace" },
    { name: "quick-add" },
    { name: "quick-add-not" },
    { name: "money" },
    { name: "added" },
    { name: "min" },
    { name: "max" },
    { name: "show" },
    { name: "hide" },
    { name: "list" },
    { name: "grid" },
    { name: "tag" },
    { name: "tag-not" },
    { name: "tag-filled" },
    { name: "pause" },
    { name: "pause-circle" },
    { name: "url" },
    { name: "url-not" },
    { name: "add-to" },
    { name: "remove-from" },
    { name: "unit" },
    { name: "factor" },
    { name: "thing" },
    { name: "emoji" },
    { name: "notification" },
    { name: "check-checked" },
    { name: "check-unchecked" },
    { name: "quick-row-with" },
    { name: "quick-row-without" },
    { name: "select-all" },
    { name: "select-none" },
    { name: "select-invert" },
    { name: "download" },
    { name: "upload" },
    { name: "copy" },
    { name: "api" },
    { name: "experimental" },
    { name: "import" },
    { name: "testing" },
    { name: "search-engine" },
    { name: "clipboard" },
    { name: "country" },
    { name: "country-not" },
    { name: "calendar", url: this.iconCalendarUrl },
    { name: "calendar-days", url: this.iconCalendarUrl },
    { name: "calendar-missed", url: this.iconCalendarUrl },
    { name: "calendar-today", url: this.iconCalendarUrl },
    { name: "calendar-tomorrow", url: this.iconCalendarUrl },
    { name: "calendar-yesterday", url: this.iconCalendarUrl },
    { name: "calendar-choose", url: this.iconCalendarUrl },
    { name: "calendar-range", url: this.iconCalendarUrl },
    { name: "calendar-not", url: this.iconCalendarUrl },
    { name: "calendar-checked", url: this.iconCalendarUrl },
    { name: "calendar-until", url: this.iconCalendarUrl },
    { name: "calendar-3-days", url: this.iconCalendarUrl },
    { name: "calendar-week", url: this.iconCalendarUrl },
    { name: "calendar-month", url: this.iconCalendarUrl },
    { name: "calendar-future", url: this.iconCalendarUrl },
    { name: "available", url: this.iconAvailableUrl },
    { name: "available-full", url: this.iconAvailableUrl },
    { name: "available-not", url: this.iconAvailableUrl },
    { name: "available-half", url: this.iconAvailableUrl },
    { name: "available-empty", url: this.iconAvailableUrl },
    { name: "available-undefined", url: this.iconAvailableUrl },
    { name: "available-add-to", url: this.iconAvailableUrl },
    { name: "available-move-to", url: this.iconAvailableUrl },
    { name: "rating", url: this.iconRatingsUrl },
    { name: "rating-not", url: this.iconRatingsUrl },
    { name: "rating-half", url: this.iconRatingsUrl },
    { name: "rating-full", url: this.iconRatingsUrl },
    { name: "difficulty", url: this.iconDifficultiesUrl },
    { name: "difficulty-not", url: this.iconDifficultiesUrl },
    { name: "difficulty-half", url: this.iconDifficultiesUrl },
    { name: "difficulty-full", url: this.iconDifficultiesUrl },
    { name: "category", url: this.iconCategoriesUrl },
    { name: "none", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "after", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "drinks", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "main", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "pre", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "salad", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "soup", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "sandwich", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "sauce", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "casserole", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "pasta", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "pan-dish", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "burger", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "pizza", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "oven-dish", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "cake", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "cupcake", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "ice-cream", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "cookie", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "juice", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "cocktail", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "smoothie", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "waffles", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "cutlets", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "bread", url: this.iconCategoriesUrl, prefix: "category-" },
    { name: "none", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "top-under-heat", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "fan", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "top-heat", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "under-heat", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "grill", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "pot-cook", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "pot-blanch", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "pot-cooking", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "pan", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "pan-saute", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "kitchenmachine", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    {
      name: "kitchenmachine-attachment",
      url: this.iconPreparationsUrl,
      prefix: "preparationType-",
    },
    { name: "rest", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "rest-fridge", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "rest-freezer", url: this.iconPreparationsUrl, prefix: "preparationType-" },
    { name: "prepared", url: this.iconPreparationHistoryUrl, prefix: "preparationHistory-" },
    { name: "prepared-no", url: this.iconPreparationHistoryUrl, prefix: "preparationHistory-" },
    { name: "prepared-all", url: this.iconPreparationHistoryUrl, prefix: "preparationHistory-" },
    { name: "planned", url: this.iconPreparationHistoryUrl, prefix: "preparationHistory-" },
    {
      name: "prepare-until",
      url: this.iconPreparationHistoryUrl,
      prefix: "preparationHistory-",
    },
    { name: "de", url: this.iconI18nUrl, prefix: "language-" },
    { name: "en", url: this.iconI18nUrl, prefix: "language-" },
    { name: "fr", url: this.iconI18nUrl, prefix: "language-" },
    { name: "es", url: this.iconI18nUrl, prefix: "language-" },
    { name: "none", url: this.iconLevelUrl, prefix: "level-" },
    { name: "sl", url: this.iconLevelUrl, prefix: "level-" },
    { name: "low", url: this.iconLevelUrl, prefix: "level-" },
    { name: "medium", url: this.iconLevelUrl, prefix: "level-" },
    { name: "high", url: this.iconLevelUrl, prefix: "level-" },
    { name: "pride-flag", url: this.iconThemeUrl, prefix: "theme-" },
    { name: "christmas", url: this.iconThemeUrl, prefix: "theme-" },
    { name: "contents", url: this.iconContentsUrl },
    { name: "choose", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "alcohol", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "alcohol-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "egg", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "egg-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "fish", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "fish-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "fructose", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "fructose-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "gluten", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "gluten-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "meat", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "meat-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "lactose", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "lactose-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "sugar", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "sugar-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "vegan", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "vegan-not", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "vegetarian", url: this.iconContentsUrl, prefix: "contents-" },
    { name: "vegetarian-not", url: this.iconContentsUrl, prefix: "contents-" },

    { name: "nutrition" },
    { name: "calories", url: this.iconNutritionUrl, prefix: "nutrition-" },
    { name: "carbohydrate", url: this.iconNutritionUrl, prefix: "nutrition-" },
    { name: "fiber", url: this.iconNutritionUrl, prefix: "nutrition-" },
    { name: "fat", url: this.iconNutritionUrl, prefix: "nutrition-" },
    { name: "saturated-fat", url: this.iconNutritionUrl, prefix: "nutrition-" },
    { name: "protein", url: this.iconNutritionUrl, prefix: "nutrition-" },
    { name: "sodium", url: this.iconNutritionUrl, prefix: "nutrition-" },
    { name: "sugar", url: this.iconNutritionUrl, prefix: "nutrition-" },

    { name: "auflaufform", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "blech", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "brett", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "deckel", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "dose", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "geschirrtuch", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "glas", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "kuchenform", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "kuechenmaschine-mit-garkorb", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "kuechenmaschine-ohne-garkorb", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "messbecher", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "muffinblech", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "nudelholz", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "pfanne", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "pfannenwender", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "pinsel", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "puerrierstab", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "reibe", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "ruehrgeraet", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "schneebesen", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "schuessel", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "sieb", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "smoothie", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "tasse", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "teigschaber", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "teller", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "toaster", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "topf", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "waage", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "wasserkocher", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "gabel-klein", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "gabel-groß", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "loeffel-klein", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "loeffel-groß", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "messer", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "schaeler", url: this.iconUtensilsUrl, prefix: "utensil-" },
    { name: "small", url: this.iconSizeUrl, prefix: "size-" },
    { name: "medium", url: this.iconSizeUrl, prefix: "size-" },
    { name: "big", url: this.iconSizeUrl, prefix: "size-" },
    { name: "none", url: this.iconSizeUrl, prefix: "size-" },
  ];

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private utensilApiService: UtensilObjectApiService,
    private settingsApiService: SettingsApiService,
    private swUpdate: SwUpdate,
    private notificationService: NotificationService,
    private settingsDialogService: SettingsDialogService,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private recipeApiService: RecipeApiService,
    private versionService: VersionService,
    private storeApiService: StoreApiService,
    private purchaseApiService: PurchaseApiService,
    private ingredientApiService: IngredientApiService,
    private searchEngineService: SearchEngineApiService,
    private databaseService: DatabaseService
  ) {
    this.notificationService.component = NotificationComponent;
    this.databaseService.db_id = DB_ID.RECIPE;

    this.versionService.initialLoadAllData(json);
    this.settingsApiService.getSettings();

    this.translateService.setDefaultLang("de");
    this.translateService.use("de");

    this.settingsApiService.settings$.subscribe((settings) => {
      this.translateService.use(settings.language);
    });

    this.purchaseApiService.getPurchases();
    this.storeApiService.getStores();

    this.ingredientApiService.getIngredientsConversion();
    this.ingredientApiService.getIngredientsAvailable();
    this.ingredientApiService.getIngredientsAdditional();
    this.ingredientApiService.getIngredientsChecked();

    this.utensilApiService.getUtensils();
    this.recipeApiService.getRecipes();
    this.searchEngineService.getSearchEngines();

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === "VERSION_READY"))
        .subscribe(() => {
          this.notificationService.show(NotificationTemplateType.VERSION_READY)?.subscribe(() => {
            // Reload the page to update to the latest version.
            document.location.reload();
          });
        });
    }

    this.icons.forEach((icon) => {
      // Icon Name: name + prefix (egal in welchem Ordner)
      // Für Dropdowns muss ein Prefix gesetzt werden, da sonst die Icons nicht gefunden werden
      this.matIconRegistry.addSvgIcon(
        (icon.prefix ?? "") + icon.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          (icon.url ?? this.iconsUrl) + icon.name + ".svg"
        )
      );
    });
  }

  ngAfterViewInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params["settings"] === "true") {
        this.settingsDialogService.openAndReloadData();
      }
    });
  }
}
