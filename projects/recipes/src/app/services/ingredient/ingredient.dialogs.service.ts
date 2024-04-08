import { Injectable } from "@angular/core";
import { map, tap } from "rxjs";
import { ButtonIconDirective } from "shared/directives/button-icon.directive";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { DialogAction } from "shared/models/dialog-action.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { IngredientAvailableDialogsService } from "./ingredient-available.dialogs.service";
import { IngredientConversionDialogsService } from "./ingredient-conversion.dialogs.service";

@Injectable({
  providedIn: "root",
})
export class IngredientDialogsService {
  constructor(
    private dialogService: DialogService,
    private ingredientConversionDialogsService: IngredientConversionDialogsService,
    private IngredientAvailableDialogsService: IngredientAvailableDialogsService
  ) {}

  private getAdditionalValues(
    ingredient?: Ingredient,
    ingredientsConversion: IngredientConversion[] | null = [],
    ingredientsAvailable: Ingredient[] | null = []
  ) {
    let noConversionExists = false;
    let notAvailable = false;

    if (ingredient) {
      noConversionExists = !IngredientConversion.findIngredientConversion(
        ingredient.name,
        ingredientsConversion ?? []
      );
      notAvailable =
        new Ingredient(ingredient).isAvailable(
          ingredientsAvailable ?? [],
          ingredientsConversion ?? []
        ).ratio === 0;
    }

    return { noConversionExists, notAvailable };
  }

  openAddOrEditIngredientDialog(
    ingredient?: Ingredient,
    add: boolean = false,
    ingredientsConversion: IngredientConversion[] | null = [],
    ingredientsAvailable: Ingredient[] | null = [],
    optionals?: {
      titleAdd?: string;
      titleEdit?: string;
      additional?: boolean;
      completerListStores?: string[] | CompleterEntry[] | null;
    }
  ) {
    const { titleAdd = "", titleEdit = "", additional, completerListStores } = optionals ?? {};
    const actions: DialogAction[] = [];

    const { notAvailable, noConversionExists } = this.getAdditionalValues(
      ingredient,
      ingredientsConversion,
      ingredientsAvailable
    );

    if (!add) {
      actions.push({
        key: ActionKey.DELETE,
        icon: "delete",
        text: "ACTION.DELETE",
        color: "warn",
        buttonIconDirective:
          notAvailable || noConversionExists
            ? ButtonIconDirective.ALWAYS_ICON
            : ButtonIconDirective.NORMAL,
      });

      if (notAvailable) {
        actions.push({
          key: "add-available",
          icon: "available-add-to",
          text: "AVAILABLE.INGREDIENTS_ADD",
          buttonIconDirective: ButtonIconDirective.ALWAYS_ICON,
        });
      }

      if (noConversionExists) {
        actions.push({
          key: "add-conversion",
          icon: "ingredient-conversion-add",
          text: "CONVERSION.ADD",
          buttonIconDirective: ButtonIconDirective.ALWAYS_ICON,
        });
      }
    }

    const data: DialogData = {
      title: add ? titleAdd || "INGREDIENT.ADD" : titleEdit || "INGREDIENT.EDIT",
      icons: ["ingredient"],
      textInputs: [
        {
          text: ingredient?.name ?? "",
          icon: "rename",
          placeholder: "TITLE",
          order: 3,
          required: true,
        },
        {
          text: ingredient?.unit ?? "",
          icon: "unit",
          placeholder: "UNIT",
          order: 2,
        },
        {
          text: ingredient?.note ?? "",
          icon: "note",
          placeholder: "NOTE.",
          order: 4,
        },
        ...(additional
          ? [
              {
                text: ingredient?.store ?? "",
                icon: "store",
                placeholder: "STORE.",
                completerList: completerListStores,
                order: 5,
              },
            ]
          : []),
      ],
      numberInputs: [
        {
          number: ingredient?.amount || 0,
          icon: "portion",
          placeholder: "AMOUNT",
          showSlider: true,
          order: 1,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actions,
      actionCancel: true,
      actionCancelIconDirective: ButtonIconDirective.ALWAYS_ICON,
    };

    return this.dialogService.open(data).pipe(
      tap((result) => {
        if (!result) return;

        if (result.actionKey === "add-conversion") {
          this.ingredientConversionDialogsService.openAddIngredientConversionDialog(
            ingredient?.name
          );
        } else if (result.actionKey === "add-available") {
          this.IngredientAvailableDialogsService.openAddOrEditIngredientAvailableDialog({
            ingredient,
            add: true,
            ingredientsConversion: ingredientsConversion,
          });
        }
      })
    );
  }

  openAddOrEditIngredientDialogWithIngredientsList(
    ingredients: Ingredient[],
    parameters?: {
      ingredient?: Ingredient;
      index?: number;
      ingredientsConversion?: IngredientConversion[] | null;
      ingredientsAvailable?: Ingredient[] | null;
      additional?: boolean;
      completerListStores?: string[] | CompleterEntry[] | null;
    }
  ) {
    const {
      ingredient,
      index,
      ingredientsConversion,
      ingredientsAvailable,
      additional,
      completerListStores,
    } = parameters ?? {};
    const add = !ingredient;

    return this.openAddOrEditIngredientDialog(
      ingredient,
      add,
      ingredientsConversion,
      ingredientsAvailable,
      {
        additional,
        completerListStores,
      }
    ).pipe(
      map((result) => {
        if (result?.actionAddOrApply) {
          // Hinzufügen
          if (add) {
            const ingr = new Ingredient({
              amount: result.numberInputs[0],
              name: result.textInputs[0],
              unit: result.textInputs[1],
              note: result.textInputs[2],
              store: result.textInputs[3],
            });

            ingredients.unshift(ingr);
            return ingredients;
          }

          // Bearbeiten
          else if (index !== undefined) {
            const ingr = new Ingredient({
              ...ingredient,
              amount: result.numberInputs[0],
              name: result.textInputs[0],
              unit: result.textInputs[1],
              note: result.textInputs[2],
              store: result.textInputs[3],
            });

            ingredients[index] = ingr;
            return ingredients;
          }
        }

        // Löschen
        else if (result?.actionDelete && index !== undefined) {
          ingredients.splice(index, 1);
          return ingredients;
        }

        return ingredients;
      })
    );
  }
}
