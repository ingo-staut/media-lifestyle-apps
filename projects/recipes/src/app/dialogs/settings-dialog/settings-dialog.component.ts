import { Clipboard } from "@angular/cdk/clipboard";
import { Platform } from "@angular/cdk/platform";
import { Location } from "@angular/common";
import { Component, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSidenav } from "@angular/material/sidenav";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as cheerio from "cheerio";
import JSZip from "jszip";
import { environment } from "projects/recipes/src/environments/environment";
import { getRecipe } from "projects/recipes/src/utils/recipe-import/recipe.import.json";
import { Subject, combineLatest, take, takeUntil } from "rxjs";
import { DropdownData } from "shared/models/dropdown.type";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { VersionService } from "shared/services/version.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { LANGUAGES_SYSTEM } from "../../../../../../shared/data/language.data";
import { Language } from "../../../../../../shared/models/enum/language.enum";
import { SearchEngineApiService } from "../../../../../../shared/services/search-engine/search-engine.api.service";
import { ITEM_DATA } from "../../data/item.data";
import { PLANNED_RECIPES_DROPDOWN_DATA } from "../../data/planned-recipes.tabs.data";
import { SETTINGS_MENU } from "../../data/settings.menu.data";
import { ItemType } from "../../models/enum/item.enum";
import { SettingsMenu, SettingsMenuKey } from "../../models/enum/settings-menu.enum";
import { Settings } from "../../models/settings.class";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { PurchaseApiService } from "../../services/purchase/purchase.api.service";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { INITIAL_SETTINGS, SettingsApiService } from "../../services/settings/settings.api.service";
import { StoreApiService } from "../../services/store/store.api.service";
import { UtensilObjectApiService } from "../../services/utensil-object/utensil-object.api.service";
import { RecipeDialogService } from "../recipe-dialog/recipe-dialog.service";
import { SettingsDialogData } from "./settings-dialog.service";

@Component({
  selector: "app-settings-dialog",
  templateUrl: "./settings-dialog.component.html",
  styleUrls: ["./settings-dialog.component.scss"],
})
export class SettingsDialogComponent implements OnInit, OnDestroy {
  @ViewChild("sidenav") sidenav!: MatSidenav;

  ITEM_DATA = ITEM_DATA;
  environment = environment;

  private readonly destroySubject = new Subject<void>();

  formGroup: ReturnType<typeof this.initializeFormGroup>;
  purchaseType: ItemType = ItemType.FOOD;

  JSON = JSON;
  plannedRecipesDropdownData = PLANNED_RECIPES_DROPDOWN_DATA;
  SettingsMenu = SettingsMenu;
  SettingsMenuKey = SettingsMenuKey;
  LANGUAGES_SYSTEM = LANGUAGES_SYSTEM;
  menu = SETTINGS_MENU;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;

  isMobileDevice = this.platform.ANDROID || this.platform.IOS;
  settings: Settings = INITIAL_SETTINGS;
  selectedSubmenu = SettingsMenuKey.APPLICATION;
  showRawData = this.localStorageService.getSettingsShowRawData();
  dragPosition = { x: 0, y: 0 };
  showDialogWindowResetButton = false;
  lockDragging = this.isMobileScreen.matches;
  showAllVersionsEntry = false;

  recipes$ = this.recipeApiService.recipes$;

  // DB Change
  performDBChange_recipe_input =
    // "39^Russischer Zupfkuchen^^Kuchen^1^12^5.87^Käsekuchen#Kuchen^categorie:6^3^0__Für den Teig:_0_Hauptrezept#200_g_Margarine_0_Hauptrezept#200_g_Zucker_0_Hauptrezept#2__Eier_0_Hauptrezept#40_g_Kakao_0_Hauptrezept#360_g_Mehl_0_Hauptrezept#1_Pck._Backpulver_0_Hauptrezept#0__Für die Füllung:_0_Hauptrezept#250_g_Margarine_0_Hauptrezept#250_g_Zucker_0_Hauptrezept#3__Eier_0_Hauptrezept#1_Pck._Puddingpulver, Vanille_0_Hauptrezept#1_Pck._Vanillezucker_0_Hauptrezept#500_g_Quark_0_Hauptrezept^***Einen Knetteig mit [Für den Teig:] erstellen. ⅔ des Teigs in eine Springform geben und den Rand etwas hochdrücken.§§Füllung mit [Für die Füllung:] erstellen. [Eier|2] trennen. Eiweiß steif schlagen und am Schluss unter die Füllung heben.§§Füllung auf dem Teigboden verteilen und den restlichen Teig, verzupft wie Streusel, darauf verteilen.§§Bei $Detail:1$ backen.******^0#60^60_0_180_1_^russischer-zupfkuchen.png^0^1_2020-01-12_2_1_#1_2021-04-14_2_1_#1_2021-05-03_2_1_^^^2_7_-1_-1_Schaumschläger/Knethaken#2_1_1_-1_#1_10_-1_-1_#1_13_-1_-1_^Hauptrezept_2";
    "260^Mexikanische gefüllte Paprika^^Paprikahälften^8^4^4.53^^categorie:4^3^150_g_Reis_0_Hauptrezept#300_ml_Gemüsebrühe oder Salzwasser_0_Hauptrezept#1_EL_Öl_0_Hauptrezept#1__Zwiebeln_0_Hauptrezept#2_Zehen_Knoblauch_0_Hauptrezept#1_TL_Paprikapulver_0_Hauptrezept#1_TL_Chilipulver_0_Hauptrezept#1_TL_Kreuzkümmel_0_Hauptrezept#1_Dose_Kidneybohnen_0_Hauptrezept#0.5_Dose_Mais_0_Hauptrezept#400_g_Tomaten, gehackt_0_Hauptrezept#0__Salz_0_Hauptrezept#0__Pfeffer_0_Hauptrezept#4__Paprika_0_Hauptrezept#100_g_Käse, gerieben (Vegan)_0_Hauptrezept^***Den [Reis] in [Gemüsebrühe] (oder gesalzenem Wasser) nach Packungsanweisung garkochen. Anschließend abkühlen lassen, dabei gelegentlich vorsichtig auflockern (kann am Vortrag vorbereitet werden).§§Das [Öl] in einer ⟦￼ Pfanne|groß|⟧ erhitzen und und die Zwiebel 1-2 Minuten glasig dünsten. Dann den [Knoblauch] hinzugeben und 30 Sekunden anrösten. Danach [Paprikapulver], Chili und [Kreuzkümmel] hinzugeben und kurz anschwitzen.§§Den Herd ausschalten und dann [Reis], Bohnen, [Mais] sowie [Tomaten] unterrühren. Nach Geschmack mit [Salz] und [Pfeffer] würzen und die Hälfte von dem veganen Reibekäse untermischen.§Den Ofen auf $Detail:1$ vorheizen und den Boden einer ofenfesten ⟦￼ Pfanne||⟧ oder ⟦￼ Auflaufform||⟧ mit etwas Wasser bedecken (ca. 60 ml).§§Die halbierten Paprikaschoten in die ⟦￼ Auflaufform||⟧ legen und mit dem mexikanischen [Reis] füllen. Mit dem restlichen [Käse] bestreuen und die ⟦￼ Pfanne||⟧ oder Form mit einem ⟦￼ Deckel||⟧ (oder mit Alufolie) abdecken.§§Die gefüllten [Paprika] 30 Minuten zugedeckt backen. Dann den ⟦￼ Deckel||⟧ entfernen, den Ofen auf $Detail:2$ stellen, bis die Paprikaschoten weich und leicht goldbraun sind.******^0#30^30_0_220_4_#10_15_200_1_^mexikanische-gefuellte-paprika.png^1^8_2023-05-10_2_1_^https://biancazapatka.com/de/gefuellte-paprika-vegan/^^2_31_-1_-1_#1_5_-1_-1_#1_34_-1_-1_#1_9_-1_-1_#1_4_1_-1_#1_4_-1_-1_#1_13_-1_-1_#1_22_-1_-1_#1_40_-1_-1_#1_23_-1_-1_^Hauptrezept_0";
  performDBChange_recipe_output: any;
  performDBChange_ingredientConversion_input =
    "1#Nudeln#500#g#0.59#Hoernchen_Penne_Fusilli_Di Pasta#55838_Aldi~7661_Aldi~55834_Aldi~4733_Aldi~11041_Aldi#1~0_2~0_3~0_4~0_5~0_6~0_7~0_8~0_";
  performDBChange_ingredientConversion_id_input = "0000";
  performDBChange_ingredientConversion_output: any;
  performDBChange_ingredientConversions_input =
    "1#Agavendicksaft#300#ml#2.59###1~0_2~0_3~0_4~0_5~0_6~0_7~0_8~0_\n1#Amaretto#0##0###1~0_2~2_3~2_4~0_5~0_6~0_7~0_8~0_";
  performDBChange_ingredientConversions_output: any;
  performDBChange_purchase_input =
    "13.05 €	Netto	31.05.2017	Süßigkeiten {work}; Apfelmus; Reibekuchen; Naturjoghurt; Chips";
  performDBChange_purchase_output: any;
  performDBChange_purchases_input =
    "13.05 €	Netto	31.05.2017	Süßigkeiten {work}; Apfelmus; Reibekuchen; Naturjoghurt; Chips" +
    "\n" +
    "13.66 €	Penny	03.06.2017	Wurstsalat; Schinken; Emmentaler; Toast; Pizzateig; Gurke [2]; Milch; Mais; Pilze	" +
    "\n" +
    "2.63 €	Netto	08.06.2017	Brötchen; Salat {lunch}	";
  performDBChange_purchases_output: any;

  requestYoutubeID = "VqqwOOOLyC8";
  responseYoutubeAPI: any;

  requestUrl = "https://www.lecker.de/apfel-kokos-kuller-74895.html";
  responseUrlData: any;

  requestXMLUrlData = "https://www.chefkoch.de/recipe-of-the-day/rss";
  responseXMLAsJSONUrlData: any;

  requestUrlWithHeadersValues = "Jonathan Nolan";
  requestUrlWithHeadersUrl = "https://online-movie-database.p.rapidapi.com/auto-complete?q=";
  requestUrlWithHeadersHost = "online-movie-database.p.rapidapi.com";
  responseUrlWithHeadersData: any;

  downloadWithZipFolder = true;
  downloadWithCurrentDate = true;

  constructor(
    private dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SettingsDialogData,
    @Inject(Router) private router: Router,
    private platform: Platform,
    private location: Location,
    protected localeService: LocaleService,
    protected settingsApiService: SettingsApiService,
    protected localStorageService: LocalStorageService,
    protected translateService: TranslateService,
    protected versionService: VersionService,
    private notificationService: NotificationService,
    protected recipeApiService: RecipeApiService,
    protected ingredientApiService: IngredientApiService,
    protected purchaseApiService: PurchaseApiService,
    protected storeApiService: StoreApiService,
    protected utensilObjectApiService: UtensilObjectApiService,
    private searchEngineApiService: SearchEngineApiService,
    private recipeDialogService: RecipeDialogService,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.selectedSubmenu = this.data.selectedSubmenu ?? this.selectedSubmenu;
    this.setUrl();
    this.formGroup = this.initializeFormGroup();

    this.settingsApiService.settings$.pipe(takeUntil(this.destroySubject)).subscribe((settings) => {
      this.settings = settings;
      this.formGroup.patchValue(settings);
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  initializeFormGroup() {
    return new FormGroup({
      language: new FormControl(this.settings.language),
      allAccordionInitiallyPanelExpanded: new FormGroup({
        recipes: new FormGroup({
          mobile: new FormControl(this.settings.allAccordionInitiallyPanelExpanded.recipes.mobile),
          screen: new FormControl(this.settings.allAccordionInitiallyPanelExpanded.recipes.screen),
        }),
        shoppingList: new FormGroup({
          mobile: new FormControl(this.settings.allAccordionInitiallyPanelExpanded.recipes.mobile),
          screen: new FormControl(this.settings.allAccordionInitiallyPanelExpanded.recipes.screen),
        }),
      }),
      plannedRecipesTabGroupInitialSelectedIndex: new FormGroup({
        mobile: new FormControl(this.settings.plannedRecipesTabGroupInitialSelectedIndex.mobile),
        screen: new FormControl(this.settings.plannedRecipesTabGroupInitialSelectedIndex.screen),
      }),
      editIngredientInListWithDialog: new FormGroup({
        mobile: new FormControl(this.settings.editIngredientInListWithDialog.mobile),
        screen: new FormControl(this.settings.editIngredientInListWithDialog.screen),
      }),
      editIngredientInTagsWithDialog: new FormGroup({
        mobile: new FormControl(this.settings.editIngredientInTagsWithDialog.mobile),
        screen: new FormControl(this.settings.editIngredientInTagsWithDialog.screen),
      }),
      editUtensilInTagsWithDialog: new FormGroup({
        mobile: new FormControl(this.settings.editUtensilInTagsWithDialog.mobile),
        screen: new FormControl(this.settings.editUtensilInTagsWithDialog.screen),
      }),
    });
  }

  languageChange(data: DropdownData<Language, string>) {
    this.formGroup.controls.language.patchValue(data.key);
    // this.translateService.use(data.key);
  }

  selectedChange(data: DropdownData<number | null, null>, isMobileScreen: boolean) {
    if (!data.key) return;

    this.formGroup.patchValue({
      plannedRecipesTabGroupInitialSelectedIndex: {
        [isMobileScreen ? "mobile" : "screen"]: +data.key,
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Neue Daten, die gespeichert werden sollen
   * @returns Daten, die der Dialog zurückgibt
   */
  newData() {
    const settings = new Settings({
      ...this.settings,
      ...(this.formGroup.getRawValue() as Settings),
    });

    return settings;
  }

  setUrl(): void {
    var queryParams: { [k: string]: any } = {};
    queryParams["settings"] = "true";
    if (this.selectedSubmenu) queryParams["submenu"] = this.selectedSubmenu;

    const url = this.router
      .createUrlTree([], {
        queryParams,
        queryParamsHandling: "merge",
      })
      .toString();
    this.location.replaceState(url);
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

  closeSidebar() {
    this.sidenav.close();
  }

  toggle() {
    this.sidenav.toggle();
  }

  setActive(key: SettingsMenuKey) {
    if (this.isSmallScreen.matches) this.sidenav?.close();
    this.selectedSubmenu = key;
    this.setUrl();
  }

  showRawDataChanged(showRawData: boolean) {
    this.showRawData = showRawData;
    this.localStorageService.setSettingsShowRawData(this.showRawData);
  }

  showTestNotification() {
    this.notificationService.show(NotificationTemplateType.TEST_CLOSEABLE);
  }

  showTestNotificationWithDuration() {
    this.notificationService.show(NotificationTemplateType.TEST_DURATION);
  }

  loadAllUtensilObjects() {
    this.settingsApiService.loadAllUtensilObjects();
  }

  loadAllIngredientConversions() {
    this.ingredientApiService.getIngredientsConversion(true);
  }

  loadRecipes(quantity: number) {
    this.settingsApiService.loadRecipes(quantity);
  }

  loadAllRecipes() {
    this.settingsApiService.loadAllRecipes();
  }

  requestYoutubeAPI(requestYoutubeID: string) {
    fetch("" + requestYoutubeID, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        console.log(response.headers);
        return response.json();
      })
      .then((data) => {
        // Handle the data
        console.log(data);
        this.responseYoutubeAPI = data;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  requestRecipe(url: string) {
    fetch("" + encodeURIComponent(url), {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const recipe = getRecipe(data, url, this.utensilObjectApiService.utensilObjectsSnapshot);

        if (!recipe) {
          this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);
          return;
        }

        this.recipeDialogService.openAndReloadData(recipe);

        this.responseUrlData = recipe;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  requestURLWithSpecial(url: string) {
    fetch("" + encodeURIComponent(url), {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const $ = cheerio.load(data);
        const scriptTag = $('script[type="application/ld+json"]').last();
        // const scriptTag = $('script[type="application/ld+json"]').find((obj: any) => obj["@context"].text() === "https://schema.org/");

        if (scriptTag.length <= 0) {
          console.error('No script tag with type "application/ld+json" found.');
          return;
        }

        const jsonContent = JSON.parse(scriptTag.html() || "");

        console.log("jsonContent", jsonContent);

        const recipeData =
          (jsonContent["@graph"] as any[])?.find((json) => json["@type"] === "Recipe") ??
          jsonContent;

        console.log("Rezept", recipeData);

        if (!recipeData) {
          console.error("Nicht den Rezepte-Eintrag in der Liste gefunden!");
          return;
        }

        this.responseUrlData = recipeData;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  requestRapidAPI(text: string, url: string, host: string) {
    const apiUrl = "";

    // const options = {
    //   method: "GET",
    //   headers: {
    //     "X-RapidAPI-Key": "c9abee0953msh05e3f40429b2745p1bc3afjsn81aacc83da0a",
    //     "X-RapidAPI-Host": host,
    //   },
    // };

    // Set your API endpoint and parameters
    const apiParams = new URLSearchParams({
      url: url + encodeURIComponent(text),
      host: encodeURIComponent(host),
    });

    console.log(apiParams);
    console.log("url", url + encodeURIComponent(text));
    console.log("host", encodeURIComponent(host));

    fetch(`${apiUrl}?${apiParams}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the data
        console.log(data);
        this.responseUrlWithHeadersData = data;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  requestXMLData(url: string) {
    fetch("" + encodeURIComponent(url), {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        const text = response.json();
        console.log(text);
        return text;
      })
      .then((data) => {
        // Handle the data
        console.log(data);
        this.responseXMLAsJSONUrlData = data;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  downloadJSON(data: any, fileName: string) {
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async downloadFilesAsZip(jsonDataArray: { fileName: string; data: any }[]) {
    const zip = new JSZip();

    jsonDataArray.forEach((jsonData) => {
      zip.file(jsonData.fileName + ".json", JSON.stringify(jsonData.data));
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);

    if (this.downloadWithCurrentDate)
      link.download = `backup-recipes-${DateFns.formatDateByFormatString(
        new Date(),
        "yyyy-MM-dd"
      )}.zip`;
    else link.download = `backup-recipes.zip`;

    link.click();
  }

  downloadAllJSON() {
    if (this.downloadWithZipFolder) {
      const fileNames = [
        "recipes",
        "ingredientsConversion",
        "utensils",
        "purchases",
        "searchEngines",
        "settings",
        "stores",
      ];
      combineLatest([
        this.recipes$,
        this.ingredientApiService.ingredientsConversion$,
        this.utensilObjectApiService.utensilObjects$,
        this.purchaseApiService.getAllPurchases(),
        this.searchEngineApiService.searchEngines$,
        this.settingsApiService.settings$,
        this.storeApiService.stores$,
      ])
        .pipe(take(1))
        .subscribe((data) => {
          this.downloadFilesAsZip(
            data.map((file, index) => {
              return { fileName: fileNames[index], data: file };
            })
          );
        });
    } else {
      this.downloadRecipesJSON();
      this.downloadIngredientsConversionJSON();
      this.downloadUtensilObjectsJSON();
      this.downloadPurchasesJSON();
      this.downloadSearchEnginesJSON();
      this.downloadSettingsJSON();
      this.downloadStoresJSON();
    }
  }

  downloadRecipesJSON() {
    this.recipes$.pipe(take(1)).subscribe((data) => {
      this.downloadJSON(data, "recipes");
    });
  }

  downloadIngredientsConversionJSON() {
    this.downloadJSON(
      this.ingredientApiService.ingredientsConversionSnapshot,
      "ingredientsConversion"
    );
  }

  downloadUtensilObjectsJSON() {
    this.downloadJSON(this.utensilObjectApiService.utensilObjectsSnapshot, "utensils");
  }

  downloadPurchasesJSON() {
    this.purchaseApiService.getAllPurchases().then((data) => {
      this.downloadJSON(data, "purchases");
    });
  }

  downloadSearchEnginesJSON() {
    this.downloadJSON(this.searchEngineApiService.searchEnginesSnapshot, "searchEngines");
  }

  downloadSettingsJSON() {
    this.downloadJSON(this.settingsApiService.settingsSnapshot, "settings");
  }

  downloadStoresJSON() {
    this.downloadJSON(this.storeApiService.storesSnapshot, "stores");
  }

  onCopyToClipboard(responseUrlData: string) {
    this.clipboard.copy(responseUrlData);
  }
}
