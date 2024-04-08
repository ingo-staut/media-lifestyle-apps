import { Injectable } from "@angular/core";
import {
  deleteDoc,
  deleteField,
  doc,
  Firestore,
  getDoc,
  limit,
  query,
  setDoc,
  updateDoc,
} from "@angular/fire/firestore";
import { collection, getDocs } from "@firebase/firestore";
import { BehaviorSubject, from, map, take, tap } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { NotificationService } from "shared/services/notification.service";
import { getTitleOfUrl, URL_FAVICON } from "shared/utils/url";
import { getNewUUID } from "shared/utils/uuid";
import { environment } from "../../../environments/environment";
import { Instruction } from "../../models/instruction.class";
import { Nutrition } from "../../models/nutrition.type";
import { Recipe } from "../../models/recipe.class";
import { IngredientApiService } from "../ingredient/ingredient.api.service";

@Injectable({
  providedIn: "root",
})
export class RecipeApiService {
  private readonly COLLECTION_RECIPES = environment.production ? "recipes" : "recipes-dev";

  searchFilterSourceUrlsSubject = new BehaviorSubject<ReadonlyArray<Group<string>>>([]);
  searchFilterSourceUrls$ = this.searchFilterSourceUrlsSubject.asObservable();

  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  recipes$ = this.recipesSubject.asObservable().pipe(
    // ! Füllt das Subject "searchFilterSourceUrlsSubject"
    tap((recipes) => {
      const allUrls = recipes
        .flatMap((recipe) => recipe.urls)
        .filter((url) => !!url)
        .map((url) => {
          return { name: getTitleOfUrl(url.url), url };
        });
      const uniqueUrls = [...new Map(allUrls.map((v) => [v.name, v])).values()].map((obj) => {
        const entry: Entry<string> = {
          name: obj.name,
          type: obj.name.toLowerCase(), // ? key / type sourceUrl
          icon: "",
          image: URL_FAVICON + obj.url.url,
        };
        return entry;
      });

      const group: ReadonlyArray<Group<string>> = [
        {
          name: "URL.S",
          icon: "url",
          entries: uniqueUrls,
        },
      ];
      // return group;

      this.searchFilterSourceUrlsSubject.next(group);
    })
  );

  get recipesSnapshot() {
    return this.recipesSubject.value;
  }

  constructor(private firestore: Firestore, private notificationService: NotificationService) {}

  getRecipes(quantity?: number, loadAll?: boolean) {
    const db = collection(this.firestore, this.COLLECTION_RECIPES);

    let q;
    if (environment.production || loadAll) {
      q = query(db);
    } else if (quantity) {
      q = query(db, limit(quantity));
    } else {
      q = query(db, limit(10));
    }

    getDocs(q).then((data) => {
      const recipes = data.docs.map((item) => {
        const recipe = this.convertRecipeToVM(item.data());
        return new Recipe({ ...recipe, id: item.id });
      });
      this.recipesSubject.next(recipes);
    });
  }

  getRecipeById(id: string) {
    return from(
      getDoc(doc(this.firestore, this.COLLECTION_RECIPES, id)).then((data) => {
        return this.convertRecipeToVM(data.data());
      })
    );
  }

  private async addOrUpdateRecipe(recipe: Recipe) {
    // Wenn Id nicht gesetzt ist, dann generiere eine
    if (!recipe.id) recipe.id = getNewUUID();

    const data = this.convertRecipeToDTO(recipe);

    await setDoc(doc(this.firestore, this.COLLECTION_RECIPES, recipe.id), data);
  }

  saveAndReloadRecipe(recipe: Recipe, withNotification = true) {
    recipe.editHistory = [new Date()].concat(recipe.editHistory);

    this.addOrUpdateRecipe(recipe)
      .then(() => {
        var newRecipe = true;
        const recipesWithReplacement = this.recipesSubject.value.map((item) => {
          if (item.id === recipe.id) {
            item = recipe;
            newRecipe = false;
          }
          return item;
        });

        if (newRecipe) recipesWithReplacement.push(recipe);

        this.recipesSubject.next([...recipesWithReplacement]);

        if (withNotification)
          this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
            messageReplace: "RECIPE.",
            icon: "recipe",
            extraActionOpen: {
              id: recipe.id,
            },
          });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  private async deleteRecipe(id: string) {
    await deleteDoc(doc(this.firestore, this.COLLECTION_RECIPES, id));
  }

  async deleteEntry(id: string) {
    await updateDoc(doc(this.firestore, this.COLLECTION_RECIPES, id), {
      newUrls: deleteField(),
    });
  }

  deleteRecipeById(recipe: Recipe, withNotification = true) {
    this.deleteRecipe(recipe.id)
      .then(() => {
        this.recipesSubject.next([
          ...this.recipesSubject.value.filter((item) => item.id !== recipe.id),
        ]);
        if (withNotification)
          this.notificationService
            .show(NotificationTemplateType.DELETE_SUCCESS, {
              messageReplace: "RECIPE.",
              icon: "recipe",
            })
            ?.subscribe(() => {
              this.saveAndReloadRecipe(recipe, withNotification);
            });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.DELETE_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  findRecipeByName(name: string) {
    return this.recipes$.pipe(
      take(1),
      map((recipes) => {
        return recipes.find(
          (recipe) => recipe.name.toLowerCase().trim() === name.toLowerCase().trim()
        );
      })
    );
  }

  convertRecipeToDTO(recipe: Recipe) {
    const obj = {
      ...recipe,
      instructions: recipe.instructions.map((item) => {
        const utensils = item.utensils.map((item) => {
          return IngredientApiService.convertUtensilToDTO(item);
        });
        const ingredients = item.ingredients.map((item) => {
          return IngredientApiService.convertIngredientToDTO(item);
        });
        const x = item as any;
        delete x["_lastAdded"];
        return { ...x, utensils, ingredients };
      }),
      preparationHistory: recipe.preparationHistory.map((item) => {
        const tmp = item as any;
        delete tmp["_lastAdded"];
        return { ...tmp };
      }),
      urls: recipe.urls.map((url) => {
        return { ...(url as any) };
      }),
      nutritionDetails: recipe.nutritionDetails.map((nutrition) => {
        return { ...(nutrition as any) };
      }),
    } as any;

    console.log(obj);

    delete obj["_searchMatchScore"];
    delete obj["_ingredientsCount"];
    delete obj["_categoryGroupType"];
    delete obj["_totalPreparationDuration"];
    delete obj["_isVegan"];
    delete obj["_isVegetarian"];
    delete obj["_costs"];
    delete obj["image"];
    return obj;
  }

  convertRecipeToVM(data: any): Recipe {
    let recipe = new Recipe({ ...data });
    recipe.preparationHistory = data.preparationHistory.map((item: any) => {
      const date = new Date(item.date.seconds * 1000);
      return { ...item, date };
    });
    recipe.instructions = data.instructions.map((item: any) => {
      return new Instruction(item);
    });
    recipe.nutritionDetails = data.nutritionDetails?.map((item: any) => {
      return new Nutrition(item);
    });

    recipe.editHistory = data.editHistory?.map((item: any) => new Date(item.seconds * 1000));
    recipe.images = data.image ? [data.image] : [];
    recipe.images = data.images ? data.images : recipe.images;

    return recipe;
  }

  /**
   * Entfernt komplettes Datenfeld aus allen Rezepten
   */
  removeDatafieldFromRecipe(datafield: string) {
    this.recipesSubject.value.forEach((recipe) => {
      updateDoc(doc(this.firestore, this.COLLECTION_RECIPES, recipe.id), {
        [datafield]: deleteField(),
      });
    });
  }

  /**
   * Erstellt komplett neues Datenfeld in allen Rezepten
   */
  addDatafieldToRecipe(datafield: string, value: any) {
    this.recipesSubject.value.forEach((recipe) => {
      updateDoc(doc(this.firestore, this.COLLECTION_RECIPES, recipe.id), {
        [datafield]: value,
      });
    });
  }
}
