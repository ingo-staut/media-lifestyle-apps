import { Injectable } from "@angular/core";
import { Firestore, collection, doc, getDocs, onSnapshot, setDoc } from "@angular/fire/firestore";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { BehaviorSubject } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { environment } from "../../../environments/environment";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { Utensil } from "../../models/utensil.class";
import { LocalStorageService } from "../local-storage.service";
import { RoutingService } from "../routing.service";

@Injectable({
  providedIn: "root",
})
export class IngredientApiService {
  private readonly COLLECTION_INGREDIENTS_AVAILABLE = environment.production
    ? "ingredients-available"
    : "ingredients-available-dev";
  private readonly COLLECTION_INGREDIENTS_ADDITIONAL = environment.production
    ? "ingredients-additional"
    : "ingredients-additional-dev";
  private readonly COLLECTION_INGREDIENTS_CHECKED = environment.production
    ? "ingredients-checked"
    : "ingredients-checked-dev";
  private readonly COLLECTION_INGREDIENTS_CONVERSION = environment.production
    ? "ingredients-conversion"
    : "ingredients-conversion-dev";

  private readonly ID_INGREDIENTS_ADDITIONAL = "5540def6-fe7e-48a2-88d4-ffddbe6a6c95";
  private readonly ID_INGREDIENTS_AVAILABLE = "95aa795b-ba98-41a1-8d3f-dbc2e30288a2";
  private readonly ID_INGREDIENTS_CHECKED = "b7d44212-047b-11ee-be56-0242ac120002";

  private ingredientsAvailableSubject = new BehaviorSubject<Ingredient[]>([]);
  ingredientsAvailable$ = this.ingredientsAvailableSubject.asObservable();

  get ingredientsAvailableSnapshot() {
    return this.ingredientsAvailableSubject.value;
  }

  ingredientsConversionSubject = new BehaviorSubject<IngredientConversion[]>([]);
  ingredientsConversion$ = this.ingredientsConversionSubject.asObservable();

  get ingredientsConversionSnapshot() {
    return this.ingredientsConversionSubject.value;
  }

  ingredientsAdditionalSubject = new BehaviorSubject<Ingredient[]>([]);
  ingredientsAdditional$ = this.ingredientsAdditionalSubject.asObservable();

  ingredientsCheckedSubject = new BehaviorSubject<Ingredient[]>([]);
  ingredientsChecked$ = this.ingredientsCheckedSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService,
    private routingService: RoutingService
  ) {}

  getIngredientsAvailable() {
    const db = collection(this.firestore, this.COLLECTION_INGREDIENTS_AVAILABLE);
    onSnapshot(db, { includeMetadataChanges: true }, (data) => {
      this.ingredientsAvailableSubject.next(
        data.docs.map((item) => {
          const ingredients = (
            item.data() as { ingredientsAvailable: Ingredient[] }
          ).ingredientsAvailable.map((ingredient) =>
            this.convertIngredientAvailableToVM(ingredient)
          );
          return ingredients;
        })[0]
      );
    });
  }

  getIngredientsConversion(all: boolean = false) {
    const db = collection(this.firestore, this.COLLECTION_INGREDIENTS_CONVERSION);

    // let q;
    // if (environment.production || all) {
    //   q = query(db);
    // } else {
    //   q = query(db, limit(10));
    // }

    getDocs(db).then((data) => {
      this.ingredientsConversionSubject.next(
        data.docs.map((item) => {
          return new IngredientConversion({ ...(item.data() as IngredientConversion) });
        })
      );
    });
  }

  getIngredientsAdditional() {
    const db = collection(this.firestore, this.COLLECTION_INGREDIENTS_ADDITIONAL);
    onSnapshot(db, { includeMetadataChanges: true }, (data) => {
      this.ingredientsAdditionalSubject.next(
        data.docs.map((item) => {
          const ingredients = (item.data() as { ingredientsAdditional: Ingredient[] })
            .ingredientsAdditional;
          return ingredients;
        })[0]
      );
    });
  }

  getIngredientsChecked() {
    const db = collection(this.firestore, this.COLLECTION_INGREDIENTS_CHECKED);
    onSnapshot(db, { includeMetadataChanges: true }, (data) => {
      this.ingredientsCheckedSubject.next(
        data.docs.map((item) => {
          const ingredients = (item.data() as { ingredientsChecked: Ingredient[] })
            .ingredientsChecked;
          return ingredients;
        })[0]
      );
    });
  }

  async addOrUpdateIngredientsAdditional(ingredients: Ingredient[]) {
    this.ingredientsAdditionalSubject.next(ingredients);

    await setDoc(
      doc(this.firestore, this.COLLECTION_INGREDIENTS_ADDITIONAL, this.ID_INGREDIENTS_ADDITIONAL),
      this.convertIngredientsAdditionalToDTO(cloneDeep(ingredients), "ingredientsAdditional")
    );
  }

  async addOrUpdateIngredientsChecked(ingredients: Ingredient[]) {
    this.ingredientsCheckedSubject.next(ingredients);

    await setDoc(
      doc(this.firestore, this.COLLECTION_INGREDIENTS_CHECKED, this.ID_INGREDIENTS_CHECKED),
      this.convertIngredientsCheckedToDTO(cloneDeep(ingredients), "ingredientsChecked")
    );
  }

  async addIngredientChecked(ingredient: Ingredient) {
    this.addOrUpdateIngredientsChecked([...this.ingredientsCheckedSubject.value, ingredient]);
  }

  async removeIngredientChecked(ingredient: Ingredient) {
    const ingredients = [...this.ingredientsCheckedSubject.value].filter(
      (ingr) => !new Ingredient(ingr).equalAll(ingredient)
    );
    this.addOrUpdateIngredientsChecked(ingredients);
  }

  async editOrDeleteIngredientAndUpdateIngredientAvailable(
    ingredient: Ingredient,
    remove: boolean,
    newIngredient?: Ingredient
  ) {
    const tmp = [...this.ingredientsAvailableSubject.value];

    let ingredients: Ingredient[] = [];
    if (remove) {
      ingredients = tmp.filter((i) => !new Ingredient(i).equalAll(ingredient));
    } else if (newIngredient) {
      ingredients = tmp.map((i) => {
        if (new Ingredient(i).equalAll(ingredient)) {
          i = newIngredient;
          return i;
        } else {
          return i;
        }
      });
    } else {
      console.error(
        "In 'editOrDeleteIngredientAndUpdateIngredientAvailable': Keine neue Zutat zum Ersetzen mitgeliefert!"
      );
    }

    this.ingredientsAvailableSubject.next(ingredients);

    return this.updateIngredientsAvailable(ingredients);
  }

  async addIngredientAndUpdateIngredientAvailable(ingredient: Ingredient) {
    const ingredients = [...this.ingredientsAvailableSubject.value, ingredient];
    this.ingredientsAvailableSubject.next(ingredients);

    return this.updateIngredientsAvailable(ingredients);
  }

  async saveAndReloadIngredientsAvailable(ingredients: Ingredient[], showNotification = false) {
    this.ingredientsAvailableSubject.next(ingredients);

    await setDoc(
      doc(this.firestore, this.COLLECTION_INGREDIENTS_AVAILABLE, this.ID_INGREDIENTS_AVAILABLE),
      this.convertIngredientsAvailableToDTO(cloneDeep(ingredients), "ingredientsAvailable")
    ).then(() => {
      if (showNotification) {
        this.notificationService
          .show(NotificationTemplateType.SAVING_SUCCESS, {
            messageReplace: "AVAILABLE.INGREDIENTS",
            icon: "available",
            extraDuration: 5,
            extraAction: {
              name: this.translateService.instant("NAVIGATE.TO_VALUE", {
                value: this.translateService.instant("AVAILABLE.INGREDIENTS"),
              }),
              icon: "available",
            },
          })
          ?.subscribe(() => {
            this.localStorageService.setShoppingListTabIndex(2);
            this.routingService.navigateToShoppingList();
          });
      }
    });
  }

  async updateIngredientsAvailable(ingredients: Ingredient[]) {
    await setDoc(
      doc(this.firestore, this.COLLECTION_INGREDIENTS_AVAILABLE, this.ID_INGREDIENTS_AVAILABLE),
      this.convertIngredientsAvailableToDTO(cloneDeep(ingredients), "ingredientsAvailable")
    );
  }

  async addOrUpdateIngredientConversions(ingredients: IngredientConversion[]) {
    for (const ingredient of ingredients) {
      await setDoc(
        doc(this.firestore, this.COLLECTION_INGREDIENTS_CONVERSION, ingredient.id),
        this.convertIngredientConversionToDTO(cloneDeep(ingredient))
      );
    }
  }

  async addOrUpdateIngredientConversion(conversion: IngredientConversion) {
    await setDoc(
      doc(this.firestore, this.COLLECTION_INGREDIENTS_CONVERSION, conversion.id),
      this.convertIngredientConversionToDTO(cloneDeep(conversion))
    );
  }

  saveAndReloadIngredientConversion(conversion: IngredientConversion) {
    this.addOrUpdateIngredientConversion(conversion)
      .then(() => {
        var newConversion = true;
        const conversionWithReplacement = this.ingredientsConversionSubject.value.map((item) => {
          if (item.id === conversion.id) {
            item = conversion;
            newConversion = false;
          }
          return item;
        });

        if (newConversion) conversionWithReplacement.push(conversion);

        this.ingredientsConversionSubject.next([...conversionWithReplacement]);

        this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
          messageReplace: "CONVERSION.",
          icon: "ingredient",
        });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  // ! NUR FÜR EINMALIGEN IMPORT, DA DER AKTUELLE STATE ÜBERSCHRIEBEN WIRD
  saveAndReloadIngredientConversions_FOR_INITAL_CREATE(
    ingredientConversions: IngredientConversion[]
  ) {
    this.addOrUpdateIngredientConversions(ingredientConversions)
      .then(() => {
        this.ingredientsConversionSubject.next(ingredientConversions);

        this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
          messageReplace: "CONVERSION.S",
          icon: "ingredient",
        });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  convertIngredientsToDTO(ingredients: Ingredient[], key: string) {
    return {
      [key]: ingredients.map((item) => {
        return IngredientApiService.convertIngredientToDTO(item);
      }),
    };
  }

  convertIngredientsCheckedToDTO(ingredients: Ingredient[], key: string) {
    return {
      [key]: ingredients.map((item) => {
        return IngredientApiService.convertIngredientCheckedToDTO(item);
      }),
    };
  }

  convertIngredientsAdditionalToDTO(ingredients: Ingredient[], key: string) {
    return {
      [key]: ingredients.map((item) => {
        return IngredientApiService.convertIngredientAdditionalToDTO(item);
      }),
    };
  }

  convertIngredientsAvailableToDTO(ingredients: Ingredient[], key: string) {
    return {
      [key]: ingredients.map((item) => {
        return IngredientApiService.convertIngredientAvailableToDTO(item);
      }),
    };
  }

  convertIngredientConversionToDTO(ingredient: IngredientConversion) {
    const ingr = { ...ingredient } as any;
    delete ingr["fromWithInstruction"];
    delete ingr["fromWithRecipe"];
    delete ingr["available"];
    delete ingr["_lastAdded"];
    delete ingr["_checked"];
    delete ingr["store"];
    delete ingr["variants"];
    return ingr;
  }

  static convertIngredientAvailableToDTO(ingredient: Ingredient) {
    const ingr = { ...ingredient } as any;
    delete ingr["fromWithInstruction"];
    delete ingr["fromWithRecipe"];
    delete ingr["available"];
    delete ingr["id"];
    delete ingr["_lastAdded"];
    delete ingr["_checked"];
    delete ingr["store"];
    delete ingr["variants"];
    return ingr;
  }

  static convertIngredientCheckedToDTO(ingredient: Ingredient) {
    const ingr = { ...ingredient } as any;
    delete ingr["fromWithInstruction"];
    delete ingr["fromWithRecipe"];
    delete ingr["available"];
    delete ingr["id"];
    delete ingr["_lastAdded"];
    delete ingr["_checked"];
    delete ingr["store"];
    // Unterschied zu speziellen Zutaten
    delete ingr["useUntil"];
    delete ingr["variants"];
    return ingr;
  }

  static convertIngredientAdditionalToDTO(ingredient: Ingredient) {
    const ingr = { ...ingredient } as any;
    delete ingr["fromWithInstruction"];
    delete ingr["fromWithRecipe"];
    delete ingr["available"];
    delete ingr["id"];
    delete ingr["_lastAdded"];
    delete ingr["_checked"];
    // Unterschied zu speziellen Zutaten
    delete ingr["useUntil"];
    delete ingr["variants"];
    return ingr;
  }

  static convertIngredientToDTO(ingredient: Ingredient) {
    const ingr = { ...ingredient } as any;
    delete ingr["fromWithInstruction"];
    delete ingr["fromWithRecipe"];
    delete ingr["available"];
    delete ingr["id"];
    delete ingr["_lastAdded"];
    delete ingr["_checked"];
    delete ingr["store"];
    // Unterschied zu speziellen Zutaten
    delete ingr["useUntil"];
    return ingr;
  }

  static convertUtensilToDTO(utensil: Utensil) {
    const u = { ...utensil } as any;
    delete u["fromWithInstruction"];
    delete u["_lastAdded"];
    return u;
  }

  convertIngredientAvailableToVM(data: any): Ingredient {
    let ingredient = new Ingredient({ ...data });
    if (data.useUntil) ingredient.useUntil = new Date(data.useUntil.seconds * 1000);
    return ingredient;
  }
}
