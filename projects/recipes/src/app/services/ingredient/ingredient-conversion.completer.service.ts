import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientApiService } from "./ingredient.api.service";

@Injectable({
  providedIn: "root",
})
export class IngredientConversionCompleterService {
  constructor(private ingredientApiService: IngredientApiService) {}

  completerListIngredientsConversionNames$ = this.ingredientApiService.ingredientsConversion$.pipe(
    map((ingredientsConversion) =>
      ingredientsConversion.map((conversion) => {
        const data: CompleterEntry = {
          text: conversion.name,
          icons: conversion.type === ItemType.FOOD ? ["ingredient"] : ["thing"],
          emoji: conversion.emoji,
        };
        return data;
      })
    )
  );
}
