import { Injectable } from "@angular/core";
import { Url } from "shared/models/url.class";
import { DateFns } from "shared/utils/date-fns";
import { isValidHttpUrl } from "shared/utils/url";
import { getNewUUID } from "shared/utils/uuid";
import {
  delimiter_lvl1,
  delimiter_lvl2,
  delimiter_lvl3,
  delimiter_lvl4,
  delimiter_lvl5,
} from "../../data/settings-delimiter.data";
import { CategoryType } from "../../models/enum/category.enum";
import {
  PreparationHistoryType,
  getPreparationHistoryTimeTypeByIndex,
} from "../../models/enum/preparation-history.enum";
import { PreparationType } from "../../models/enum/preparation.enum";
import { UtensilMaterial } from "../../models/enum/utensil-material.enum";
import { UtensilSize } from "../../models/enum/utensil-size.enum";
import { Ingredient } from "../../models/ingredient.class";
import { Instruction } from "../../models/instruction.class";
import { PreparationHistoryEntry } from "../../models/preparation-history.class";
import { Recipe } from "../../models/recipe.class";
import { Utensil } from "../../models/utensil.class";
import { UtensilObjectApiService } from "../utensil-object/utensil-object.api.service";

@Injectable({
  providedIn: "root",
})
export class RecipeImportService {
  constructor(private utensilApiService: UtensilObjectApiService) {}

  readInRecipe(text: string) {
    const list = text.split(delimiter_lvl1);

    if (list.length < 21) return undefined;

    const id = getNewUUID();
    const id_old = list[0];
    const title = list[1];
    let note = list[2];
    const amountText = list[3];
    const amountNumber_tmp = +list[4];
    const amountNumber = amountNumber_tmp === 0 ? 1 : amountNumber_tmp;
    const portions = +list[5];
    const price = +list[6];
    const tags = list[7].split(delimiter_lvl2).filter((item) => item !== "" && item !== " ");
    const category_tmp = +list[8].replace("categorie:", "");
    const difficulty = +list[9];
    const favorite = +list[15] === 1;
    const image = isValidHttpUrl(list[16]) ? list[16] : "";
    const urls = [list[17]]
      .filter((item) => item !== "" && item !== " ")
      .map((item) => {
        const data = new Url({
          url: item,
        });
        return data;
      });

    urls.forEach((url, index, array) => {
      if (!isValidHttpUrl(url.url)) {
        console.warn("URL is not valid", { url }, { title }, { id_old });
        if (!url.url.includes("www.") && !url.url.includes(".de")) {
          note.trim().length === 0 ? (note = url.url) : (note += "; " + url);
          array.splice(index, 1);
        }
      }
    });

    var category = CategoryType.NONE;
    // 1. Vorspeise/Snack
    //// 2. Salat
    // 3. Beilage
    // 4. Hauptspeise
    // 5. Nachspeise
    //// 6. Kuchen
    //// 7. Muffn
    //// 8. Plätzchen
    //// 9. Eis/Créme
    //// 10. Getränk
    //// 11. Cocktail/Smoothie
    if (category_tmp === 2) category = CategoryType.SALAD;
    else if (category_tmp === 6) category = CategoryType.CAKE;
    else if (category_tmp === 7) category = CategoryType.CUPCAKE;
    else if (category_tmp === 8) category = CategoryType.COOKIE;
    else if (category_tmp === 9) category = CategoryType.ICE_CREAM;
    else if (category_tmp === 10) category = CategoryType.JUICE;
    else if (category_tmp === 11) category = CategoryType.COCKTAIL;
    // + Hauptspeise
    else if (category_tmp === 1 || category_tmp === 3 || category_tmp === 4) {
      if (title.toLowerCase().includes("pfanne") || tags.includes("pfanne")) {
        category = CategoryType.PAN_DISH;
      } else if (
        title.toLowerCase().includes("frikadelle") ||
        tags.includes("frikadelle") ||
        title.toLowerCase().includes("burger") ||
        tags.includes("burger")
      ) {
        category = CategoryType.BURGER;
      } else if (title.toLowerCase().includes("nudeln") || tags.includes("nudeln")) {
        category = CategoryType.PASTA;
      } else if (
        title.toLowerCase().includes("auflauf") ||
        tags.includes("auflauf") ||
        title.toLowerCase().includes("tarte") ||
        tags.includes("tarte") ||
        title.toLowerCase().includes("gratin") ||
        tags.includes("gratin") ||
        title.toLowerCase().includes("lasagne") ||
        tags.includes("lasagne") ||
        title.toLowerCase().includes("kuchen") ||
        tags.includes("kuchen")
      ) {
        category = CategoryType.CASSEROLE;
      } else if (category_tmp === 1) {
        if (title.toLowerCase().includes("suppe") || tags.includes("suppe")) {
          category = CategoryType.SOUP;
        } else if (title.toLowerCase().includes("sandwich") || tags.includes("sandwich")) {
          category = CategoryType.SANDWICH;
        } else if (title.toLowerCase().includes("auflauf") || tags.includes("auflauf")) {
          category = CategoryType.CASSEROLE;
        }
      } else if (category_tmp === 3) {
        if (title.toLowerCase().includes("suppe") || tags.includes("suppe")) {
          category = CategoryType.SOUP;
        } else if (title.toLowerCase().includes("soße") || tags.includes("soße")) {
          category = CategoryType.SAUCE;
        }
      }
    } else if (category_tmp === 5) {
      if (
        title.toLowerCase().includes("waffeln") ||
        title.toLowerCase().includes("pfannkuchen") ||
        tags.includes("waffeln") ||
        tags.includes("pfannkuchen")
      ) {
        category = CategoryType.WAFFFLES;
      } else if (
        title.toLowerCase().includes("schnitten") ||
        tags.includes("schnitten") ||
        title.toLowerCase().includes("taschen") ||
        tags.includes("taschen")
      ) {
        category = CategoryType.CUTLETS;
      }
    }

    if (category == CategoryType.NONE) {
      const categories = [
        "1. Vorspeise/Snack",
        "2. Salat",
        "3. Beilage",
        "4. Hauptspeise",
        "5. Nachspeise",
        "6. Kuchen",
        "7. Muffn",
        "8. Plätzchen",
        "9. Eis/Créme",
        "10. Getränk",
        "11. Cocktail/Smoothie",
      ];
      console.warn(
        "No category found",
        { title },
        { id_old },
        { category_tmp },
        categories[category_tmp - 1]
      );

      category = CategoryType.OVEN_DISH;
    }

    // --- Zutaten einlesen ---
    const ingredients_list = list[10].split(delimiter_lvl2);
    const ingredients = ingredients_list.map((element) => {
      const ingredients_elements = element.split(delimiter_lvl3);
      var amount = 0.0;
      var unit = "";
      var name = "";
      var optional = false;
      var variants: string[] = [];

      if (ingredients_elements.length >= 3) {
        amount = +ingredients_elements[0];
        unit = ingredients_elements[1];
        name = ingredients_elements[2];
      }
      // Optional
      if (ingredients_elements.length >= 4) {
        optional = +ingredients_elements[3] === 1; // 1 = optional
      }
      // Varianten
      if (ingredients_elements.length >= 5) {
        variants = ingredients_elements[4].split(delimiter_lvl4); // 1 = optional
        variants.sort();
      }
      return new Ingredient({ name, unit, amount, variants });
    });

    const times_list = list[12].split(delimiter_lvl2);

    const preparationTime_tmp = +times_list[0];
    const preparationTime = preparationTime_tmp > 0 ? preparationTime_tmp : null;

    const makingTime_tmp = +times_list[1];
    const makingTime = makingTime_tmp > 0 ? makingTime_tmp : null;

    // --- Utensilien einlesen ---
    const utensils = list[19].split(delimiter_lvl2).map((utensilStr) => {
      const utensils_elements = utensilStr.split(delimiter_lvl3);

      if (utensils_elements.length === 5) {
        var amount = +utensils_elements[0];
        var objectId = +utensils_elements[1];
        if (objectId <= 0) objectId = -1;

        const sizeId = +utensils_elements[2];
        var size = UtensilSize.NONE;
        if (sizeId === 0) size = UtensilSize.NONE;
        else if (sizeId === 1 || sizeId === 4 || sizeId === 5) size = UtensilSize.BIG;
        else if (sizeId === 2) size = UtensilSize.MEDIUM;
        else if (sizeId === 3) size = UtensilSize.SMALL;

        var materialId = +utensils_elements[3];
        var material = UtensilMaterial.NONE;
        if (materialId === 0) material = UtensilMaterial.NONE;
        else if (materialId === 1) material = UtensilMaterial.GLASS;
        else if (materialId === 2) material = UtensilMaterial.SILICONE;
        else if (materialId === 3) material = UtensilMaterial.PLASTIC;
        else if (materialId === 4) material = UtensilMaterial.PORCELAIN;
        else if (materialId === 5) material = UtensilMaterial.STEEL;
        else if (materialId === 6) material = UtensilMaterial.TEFLON;
        else if (materialId === 7) material = UtensilMaterial.METAL;

        var note = utensils_elements[4];

        const utensil = this.utensilApiService.utensilObjectsSnapshot.find(
          (utensil) => utensil.id_tmp === objectId
        );

        if (!utensil) {
          console.error("Utensil: ObjektId nicht gefunden", { title }, { objectId });
          return;
        }

        return new Utensil({ name: utensil.name, size, material, amount, note });
      } else {
        console.error("Utensils: Nicht richtige länge", { title }, { element: utensilStr });
        return;
      }
    });

    // --- Zubereitungsschritte einlesen ---
    const instructions_tmp = list[11].split("***");
    if (instructions_tmp.length !== 4) {
      console.error("Zubereitungstexte: Nicht richtige Länge: ", { title }, { instructions_tmp });
      return;
    }

    const titles = ["Vorbereitung", "Zubereitung", "Servieren", "Tipps"];
    const times = [preparationTime, makingTime, null, null];

    // if (instructions_tmp[3] === "") {
    //   titles.splice(3, 1);
    // }
    // if (instructions_tmp[2] === "") {
    //   titles.splice(2, 1);
    // }

    // Titel den Zubereitungsschritten zuweisen
    const instructions = instructions_tmp
      .map((text, index) => {
        return text
          .split(delimiter_lvl5)
          .filter((text) => text.length !== 0)
          .map((paragraph, i) => {
            return new Instruction({
              name: titles[index] === "Zubereitung" ? i + ". Schritt" : titles[index],
              text: paragraph,
              minTime: i === 0 ? times[index] : null,
            });
          });
      })
      .flat()
      .filter((instruction) => !instruction || instruction.text !== "");

    // Erster Schritt ist immer Vorbereitung
    instructions[0].name = "Vorbereitung";

    // --- Zutaten in Zubereitungsschritte einfügen ---
    instructions.forEach((instruction) => {
      const matches = [...instruction.text.matchAll(/\[([^|\]]+)\|?[^|\]]*\|?[^|\]]*\]/gi)];

      matches.forEach((match) => {
        // Zutat mit ":" am Ende, z.B.: "Für den Teig:"
        if (match[1]?.trim().match(/:$/)) {
          // In der Liste der Zutaten nach dieser Zutat suchen,
          // falls vorhanden, dann bis zur nächsten Zutat gehen, die mit ":" am Ende hat und alle Zutaten bis dahin der neuen Liste hinzufügen,
          // falls am Ende der Liste der Zutaten angekommen, dann alle Zutaten bis zum Ende der Liste der neuen Liste hinzufügen
          const index = ingredients.findIndex(
            (ingr) => ingr && ingr.name && ingr.name.toLowerCase() === match[1].trim().toLowerCase()
          );

          if (index !== -1) {
            const nextIngredient = ingredients.findIndex((u, i) => i > index && u.name.match(/:$/));
            const nextIndex = nextIngredient === -1 ? ingredients.length : nextIngredient;
            instruction.ingredients = instruction.ingredients.concat(
              ingredients.slice(index + 1, nextIndex)
            );

            // Zutat aus der Liste der Zutaten entfernen
            ingredients.splice(index, nextIndex - index);
          }

          // Zutat aus der Liste der Zutaten entfernen
          // ingredients.splice(index, 1);

          // Zutat aus dem Text entfernen
          instruction.text = instruction.text.replace(match[0], "");

          // Wenn sowas mit ":" am Ende gefunden,
          // dann direkt aufhören
          return;
        } else {
          instruction.text = instruction.text.replace(match[0], match[1]);
        }
      });

      return instruction;
    });

    // --- Nicht mit "[...]" markierte Zutaten finden und hinzufügen ---
    instructions.forEach((instruction) => {
      ingredients.forEach((ingredient, index) => {
        if (
          instruction.text
            .toLowerCase()
            .includes(ingredient.name.toLowerCase().split(/(,|\()/)[0]) &&
          // Und nocht nicht in der Liste der Zutaten vorhanden ist
          !instruction.ingredients.some((ingr) => ingr.name === ingredient.name.split(/(,|\()/)[0])
        ) {
          // Wenn Zutat hinzugfügt wird,
          // dann aus der Liste entfernen
          ingredients.splice(index, 1);
          instruction.ingredients.push(ingredient);
        }
      });
    });

    // --- Übrig gebliebene Zutaten hinzufügen ---
    ingredients.forEach((ingredient) => {
      // Wenn Zutat nicht in irgendeinem Zubereitungsschritt vorhanden ist,
      // dann zur ersten Zubereitung hinzufügen
      if (
        instructions.length > 0 &&
        !instructions.some((instruction) =>
          instruction.ingredients.some(
            (ingr) => new Ingredient(ingr).equalAll(ingredient)
            // Zutatenüberschriften, die im Text nicht vorkamen,
            // werden nicht hinzugefügt
          )
        ) &&
        !ingredient.name.match(/:$/)
      )
        instructions[0].ingredients.push(ingredient);
    });

    // --- Utensilien in Zubereitungsschritte einfügen ---
    instructions.forEach((instruction) => {
      const matches = [...instruction.text.matchAll(/(?:⟦￼|⟦) ?([^|⟧]+)\|?[^|⟧]*\|?[^|⟧]*⟧/gi)];
      matches.forEach((match) => {
        // Schauen ob Utensil schon in irgendeinem Zubereitungsschritt vorhanden ist
        const found = instructions.some((instruction) => {
          return instruction.utensils.some((u) => u.name.toLowerCase() === match[1].toLowerCase());
        });

        // Wenn Utensil nicht bereits existerit, dann hinzufügen
        // instruction.utensils.some((utensil) => utensil.name === match[1])
        if (!found) {
          instruction.utensils.push(new Utensil({ name: match[1] }));
        }

        instruction.text = instruction.text.replace(match[0], match[1]);
      });
    });

    // --- Nicht mit "⟦...⟧" markierte Utensilien finden und hinzufügen ---
    instructions.forEach((instruction) => {
      utensils.forEach((utensil, index) => {
        if (!utensil) return;

        const found = instructions.some((instruction) => {
          return instruction.utensils.some(
            (u) => u.name.toLowerCase() === utensil.name.toLowerCase()
          );
        });

        if (instruction.text.toLowerCase().includes(utensil.name.toLowerCase()) && !found) {
          // Wenn Utensil hinzugfügt wird,
          // dann aus der Liste entfernen
          utensils.splice(index, 1);
          instruction.utensils.push(utensil);
        }
      });
    });

    // Wenn eingelesene Utensilien nicht gefunden werden,
    // dann zur ersten Zubereitung hinzufügen
    utensils.forEach((utensil) => {
      if (!utensil) return;

      const found = instructions.some((instruction) => {
        return instruction.utensils.some(
          (u) => u.name.toLowerCase() === utensil.name.toLowerCase()
        );
      });

      if (!found && instructions.length > 0) {
        instructions[0].utensils.push(utensil);
      }
    });

    // --- Bonus: Utensils ohne "⟦...⟧" je Zubereitungsschritt finden und hinzufügen,
    // und zwar mit der Liste aller Utensilien aus dem Service ---
    instructions.forEach((instruction) => {
      this.utensilApiService.utensilObjectsSnapshot.forEach((utensil) => {
        if (
          (instruction.text.toLowerCase().includes(utensil.name.toLowerCase()) ||
            utensil.alternativeNames.some((name) =>
              instruction.text.toLowerCase().includes(name.toLowerCase())
            )) &&
          // Und noch in keinem Zubereitungsschritt vorhanden ist
          !instructions.some((instruction) =>
            instruction.utensils.some((u) => u.name === utensil.name)
          )
        ) {
          instruction.utensils.push(new Utensil({ name: utensil.name }));
        }
      });
    });

    const preparationHistory = list[16].split(delimiter_lvl2).map((item) => {
      const itemList = item.split(delimiter_lvl3);
      if (itemList.length === 5) {
        const amount = +itemList[0];
        const date = DateFns.getDateFromString(itemList[1], "yyyy-MM-dd", new Date()) ?? new Date();
        const preparationTimeType = getPreparationHistoryTimeTypeByIndex(+itemList[2]);
        // const type = +itemList[3] as PreparationHistoryType;
        const type = PreparationHistoryType.PREPARED; // Immer auf zubereitet setzen
        const note = itemList[4];

        return new PreparationHistoryEntry({
          amount,
          date,
          preparationTimeType,
          type,
          note,
          portionsAvailable: 0,
        });
      } else {
        console.error("error beim einlesen der LastPreparationDetails", itemList);
        return new PreparationHistoryEntry({});
      }
    });

    const preparationDetails = list[13].split(delimiter_lvl2).map((item) => {
      const itemList = item.split(delimiter_lvl3);
      if (itemList.length === 5) {
        const minTime_tmp = +itemList[0];
        const minTime = minTime_tmp === 0 ? null : minTime_tmp;

        const maxTime_tmp = +itemList[1];
        const maxTime = maxTime_tmp === 0 ? null : maxTime_tmp;

        const temperature_tmp = +itemList[2];
        const temperature = temperature_tmp === 0 ? null : temperature_tmp;

        const preparationType_tmp = +itemList[3];
        const note = itemList[4];

        var preparationType = PreparationType.NONE;
        if (preparationType_tmp === 7) {
          preparationType = PreparationType.PAN;
        } else if (preparationType_tmp === 8) {
          preparationType = PreparationType.REST;
        } else {
          preparationType = preparationType_tmp;
        }

        // Könnte man als Zuebreitungsschritt-Titel verwenden
        var name = "";
        if (preparationType >= 1 && preparationType <= 5) {
          name = "Ofen";
        } else if (preparationType >= 6 && preparationType <= 8) {
          name = "Topf";
        } else if (preparationType >= 9 && preparationType <= 10) {
          name = "Pfanne";
        } else if (preparationType >= 11 && preparationType <= 13) {
          name = "Ruhen lassen";
        }

        return new Instruction({
          minTime,
          maxTime,
          temperature,
          preparationType,
          note,
        });
      } else {
        console.error("error beim einlesen der LastPreparationDetails", itemList);
        return new Instruction({});
      }
    });

    instructions.forEach((instruction) => {
      const match = instruction.text.match(/\$Detail:(\d)\$ ?(vorheizen)?/i);
      if (match) {
        const index = +match[1] - 1;
        const justTemperature =
          match[2] === "vorheizen" && instructions.some((i) => i.text.match(/\$Detail:(\d)\$/));

        if (!preparationDetails[index]) return;

        if (!justTemperature) {
          instruction.minTime =
            (preparationDetails[index].minTime ?? 0) + (instruction.minTime ?? 0);
          instruction.maxTime = preparationDetails[index].maxTime;
          instruction.note = preparationDetails[index].note;
        }
        instruction.temperature = preparationDetails[index].temperature;
        instruction.preparationType = preparationDetails[index].preparationType;

        if (instruction.minTime === 0) instruction.minTime = null;

        // ! Text kann danach leer sein
        instruction.text = instruction.text.replaceAll(
          new RegExp("(bei|auf|für)? ?\\$Detail:" + match[1] + "\\$ ?", "gi"),
          ""
        );
      }
    });

    return new Recipe({
      id,
      name: title,
      note,
      amountText,
      amountNumber,
      portions,
      tags,
      category,
      difficulty,
      instructions,
      preparationHistory,
      favorite,
      images: [image],
      urls,
      editHistory: [new Date()],
    });
  }
}
