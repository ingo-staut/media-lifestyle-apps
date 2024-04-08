import { Injectable } from "@angular/core";
import { getNewUUID } from "shared/utils/uuid";
import { delimiter_lvl2, delimiter_lvl3, delimiter_lvl4 } from "../../data/settings-delimiter.data";
import { isArrayEqual } from "../../models/array.function";
import { Conversion } from "../../models/conversion.type";
import {
  IngredientConversionContentState,
  IngredientConversionContentType,
  IngredientConversionContentTypeList,
} from "../../models/enum/ingredient-conversion-content.enum";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientConversionContent } from "../../models/ingredient-conversion-content.type";
import { IngredientConversion } from "../../models/ingredient-conversion.class";

@Injectable({
  providedIn: "root",
})
export class IngredientConversionImportService {
  constructor() {}

  readInIngredientConversion(text: string, previouslyAdded?: IngredientConversion[]) {
    const list = text.split(delimiter_lvl2);

    if (list.length > 7) {
      const itemType: ItemType = +list[0] === 1 ? ItemType.FOOD : ItemType.THING;
      const name: string = list[1];
      const amount: number = +list[2];
      const unit: string = list[3];
      const costs: number[] = list[4].split(delimiter_lvl3).map((item) => +item);
      const alternativeNames: string[] = list[5].split(delimiter_lvl3).filter((item) => item);
      const storeNumbers = list[6]
        .split(delimiter_lvl4)
        .map((item) => {
          const list = item.split(delimiter_lvl3);
          if (list.length !== 2) return;
          return { number: +list[0], store: list[1] };
        })
        .filter((item): item is { number: number; store: string } => !!item);
      const contents = list[7]
        .split(delimiter_lvl3)
        .map((item) => {
          const list = item.split(delimiter_lvl4);
          if (list.length !== 2) return;
          const state = this.getContentStateById(+list[1]);
          const id = this.getContentTypeById(+list[0]);
          const data: IngredientConversionContent = { type: id, state };
          return data;
        })
        .filter((item): item is IngredientConversionContent => !!item)
        // Alle nicht vorhandenen ContentTypes werden ausgefiltert
        .filter(
          (item) =>
            item.state !== IngredientConversionContentState.NO &&
            item.state !== IngredientConversionContentState.WITHOUT
        );

      const newConversion: Conversion = {
        amount,
        unit,
        costs,
        factor: 1, // Nur beim ersten Mal Einlesen der Conversion
      };

      // Gleiche Umrechnungszutat finden
      let addedToPreviously = false;
      previouslyAdded?.map((ingredientConversion) => {
        if (ingredientConversion.name.toLowerCase() === name.toLowerCase()) {
          addedToPreviously = true;
          let conversionWithSameUnitFound = false;
          ingredientConversion.conversions.forEach((conversion) => {
            // Gleiche Einheit, z.B.: 100g und 200g
            if (conversion.unit.toLowerCase() === unit.toLowerCase()) {
              conversionWithSameUnitFound = true;

              newConversion.factor = conversion.amount / amount; // Verhältnis zum Haupteintrag, bzw. ersten Eintrag

              const sameAlternativeNames = isArrayEqual(
                ingredientConversion.alternativeNames,
                alternativeNames
              );
              if (!sameAlternativeNames)
                console.warn(
                  "not same alternative names",
                  { ingredientConversion },
                  alternativeNames
                );

              const sameStores = isArrayEqual(ingredientConversion.storeNumbers, storeNumbers);
              if (!sameStores)
                console.warn("not same store names", { ingredientConversion }, storeNumbers);

              ingredientConversion.conversions.push(newConversion);
            }
          });

          if (!conversionWithSameUnitFound) {
            ingredientConversion.conversions.push(newConversion);
            console.warn({ ingredientConversion });
          }
        }
      });

      if (!addedToPreviously) {
        return new IngredientConversion({
          id: getNewUUID(),
          type: itemType,
          name,
          alternativeNames,
          storeNumbers,
          contents,
          conversions: [newConversion],
        });
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private getContentStateById(id: number) {
    switch (id) {
      case 0:
        return IngredientConversionContentState.WITHOUT;
      case 1:
        return IngredientConversionContentState.PARTIALLY;
      case 2:
        return IngredientConversionContentState.WITH;
      case -1:
        return IngredientConversionContentState.NO;
      default:
        return IngredientConversionContentState.NO;
    }
  }

  private getContentTypeById(id: number) {
    if (id >= IngredientConversionContentTypeList.length) return IngredientConversionContentType.NO;
    return IngredientConversionContentTypeList[id];
  }
}
