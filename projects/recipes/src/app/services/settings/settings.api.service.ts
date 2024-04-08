import { BreakpointObserver } from "@angular/cdk/layout";
import { Injectable } from "@angular/core";
import { collection, doc, Firestore, getDocs, setDoc } from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { Language } from "../../../../../../shared/models/enum/language.enum";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Settings } from "../../models/settings.class";
import { IngredientConversionImportService } from "../ingredient/ingredient-conversion.import.service";
import { IngredientApiService } from "../ingredient/ingredient.api.service";
import { PurchaseApiService } from "../purchase/purchase.api.service";
import { PurchaseImportService } from "../purchase/purchase.import.service";
import { RecipeApiService } from "../recipe/recipe.api.service";
import { RecipeImportService } from "../recipe/recipe.import.service";
import { UtensilObjectApiService } from "../utensil-object/utensil-object.api.service";

export const INITIAL_SETTINGS: Settings = {
  id: "",
  language: Language.GERMAN,
  allAccordionInitiallyPanelExpanded: {
    recipes: { mobile: false, screen: false },
    shopping: { mobile: false, screen: false },
    shoppingList: { mobile: false, screen: false },
    statistics: { mobile: false, screen: false },
  },
  plannedRecipesTabGroupInitialSelectedIndex: { mobile: 0, screen: 0 },
  editIngredientInListWithDialog: { mobile: true, screen: true },
  editIngredientInTagsWithDialog: { mobile: true, screen: true },
  editUtensilInTagsWithDialog: { mobile: true, screen: true },
};

@Injectable({
  providedIn: "root",
})
export class SettingsApiService {
  private readonly COLLECTION_SETTINGS = "settings";

  settingsSubject = new BehaviorSubject<Settings>(INITIAL_SETTINGS);
  settings$ = this.settingsSubject.asObservable();

  get settingsSnapshot() {
    return this.settingsSubject.value;
  }

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private recipeApiService: RecipeApiService,
    private recipeImportService: RecipeImportService,
    private ingredientApiService: IngredientApiService,
    private ingredientConversionImportService: IngredientConversionImportService,
    private purchaseApiService: PurchaseApiService,
    private purchaseImportService: PurchaseImportService,
    private utensilObjectApiService: UtensilObjectApiService,
    private breakpointObserver: BreakpointObserver
  ) {}

  getSettings() {
    const db = collection(this.firestore, this.COLLECTION_SETTINGS);
    getDocs(db).then((data) => {
      this.settingsSubject.next(
        data.docs.map((item) => {
          return new Settings({ ...(item.data() as Settings), id: item.id });
        })[0] // Nur ein Eintrag
      );
    });
  }

  async addOrUpdateSettings(settings: Settings) {
    const data = this.convertSettingsToDTO(settings);
    await setDoc(doc(this.firestore, this.COLLECTION_SETTINGS, settings.id), data);
  }

  saveAndReloadSettings(settings: Settings) {
    this.addOrUpdateSettings(settings)
      .then(() => {
        this.getSettings();
        this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
          messageReplace: "SETTINGS.",
          icon: "settings",
        });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  convertSettingsToDTO(settings: Settings) {
    return {
      ...settings,
    };
  }

  async performDBChange() {
    console.log("performDBChange");
  }

  performDBChangeImportRecipe(text: string) {
    this.askForLoadAllUtensilObjects();

    const recipe = this.recipeImportService.readInRecipe(text);
    console.log(recipe);
    return recipe;
  }

  performDBChangeImportRecipeAndSave(text: string) {
    this.askForLoadAllUtensilObjects();

    const recipe = this.recipeImportService.readInRecipe(text);
    console.log(recipe);
    if (!recipe) return;
    this.recipeApiService.saveAndReloadRecipe(recipe);
    return recipe;
  }

  performDBChangeImportIngredientConversion(text: string) {
    const ingredientConversion =
      this.ingredientConversionImportService.readInIngredientConversion(text);
    console.log(ingredientConversion);
    return ingredientConversion;
  }

  performDBChangeImportIngredientConversionAndSave(text: string, id: string = "") {
    const ingredientConversion =
      this.ingredientConversionImportService.readInIngredientConversion(text);
    console.log(ingredientConversion);
    if (!ingredientConversion) return;
    ingredientConversion.id = id || ingredientConversion.id;
    this.ingredientApiService.saveAndReloadIngredientConversion(ingredientConversion);
    return ingredientConversion;
  }

  performDBChangeImportIngredientConversionsAndSave_FOR_INITAL_CREATE(text: string) {
    this.askForLoadAllUtensilObjects();

    const list: IngredientConversion[] = [];
    text.split("\n").forEach((line) => {
      const conversion = this.ingredientConversionImportService.readInIngredientConversion(
        line,
        list
      );
      if (conversion) list.push(conversion);
    });

    this.ingredientApiService.saveAndReloadIngredientConversions_FOR_INITAL_CREATE(list);
    return list.length;
  }

  performDBChangeImportPurchase(text: string, purchaseType: ItemType) {
    const purchase = this.purchaseImportService.readInPurchase(text, purchaseType);
    console.log(purchase);
    return purchase;
  }

  performDBChangeImportPurchaseAndSave(text: string, purchaseType: ItemType) {
    const purchase = this.purchaseImportService.readInPurchase(text, purchaseType);
    console.log(purchase);
    if (!purchase) return;
    this.purchaseApiService.saveAndReloadPurchase(purchase);
    return purchase;
  }

  performDBChangeImportPurchases(text: string, purchaseType: ItemType) {
    const purchases = this.purchaseImportService.readInPurchases(text, purchaseType);
    console.log(purchases);
    return purchases;
  }

  performDBChangeImportPurchasesAndSave(text: string, purchaseType: ItemType) {
    const purchases = this.purchaseImportService.readInPurchases(text, purchaseType);
    console.log(purchases);
    if (!purchases) return;
    this.purchaseApiService.saveAndReloadPurchases(purchases);
    return purchases;
  }

  askForLoadAllUtensilObjects() {
    return this.notificationService
      .showNotificationText("Alle Utensilien laden?")
      ?.subscribe(() => {
        this.loadAllUtensilObjects();
      });
  }

  loadAllUtensilObjects() {
    this.utensilObjectApiService.getUtensils(true);
  }

  loadRecipes(quantity: number) {
    this.recipeApiService.getRecipes(quantity);
  }

  loadAllRecipes() {
    this.recipeApiService.getRecipes(undefined, true);
  }
}
