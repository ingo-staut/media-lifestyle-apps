import { Injectable } from "@angular/core";
import { tap } from "rxjs";
import { ButtonIconDirective } from "shared/directives/button-icon.directive";
import { DialogAction } from "shared/models/dialog-action.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { IngredientConversionDialogsService } from "./ingredient-conversion.dialogs.service";
import { IngredientApiService } from "./ingredient.api.service";

@Injectable({
  providedIn: "root",
})
export class IngredientAvailableDialogsService {
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(
    private dialogService: DialogService,
    private ingredientApiService: IngredientApiService,
    private ingredientConversionDialogsService: IngredientConversionDialogsService,
    private notificationService: NotificationService
  ) {}

  private getConversionExists(
    ingredient?: Ingredient,
    ingredientsConversion: IngredientConversion[] | null = []
  ) {
    if (!ingredient) return false;

    return IngredientConversion.findIngredientConversion(
      ingredient.name,
      ingredientsConversion ?? []
    );
  }

  /**
   * Verfügbare Zutat erstellen oder bearbeiten
   * @param parameters Fall keine gesetzt, automatisch Hinzufügen
   */
  openAddOrEditIngredientAvailableDialog(parameters?: {
    ingredient?: Ingredient;
    add?: boolean;
    ingredientsConversion?: IngredientConversion[] | null;
    // ingredientsAvailable?: boolean;
  }) {
    const { ingredient, add, ingredientsConversion } = parameters ?? {
      add: true,
      ingredientsConversion: null,
    };
    const oldIngredient = ingredient;

    const conversionExists = this.getConversionExists(ingredient, ingredientsConversion);
    const actions: DialogAction[] = [];

    if (!conversionExists) {
      actions.push({
        key: "add-conversion",
        icon: "ingredient-conversion-add",
        text: "CONVERSION.ADD",
        buttonIconDirective: ButtonIconDirective.ALWAYS_ICON,
      });
    }

    const data: DialogData = {
      title: add ? "AVAILABLE.INGREDIENTS_ADD" : "AVAILABLE.INGREDIENT_EDIT",
      icons: add ? ["available-add-to"] : ["available"],
      textInputs: [
        {
          text: ingredient?.name ?? "",
          icon: "rename",
          placeholder: "TITLE",
          required: true,
          order: 3,
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
      dateInputs: [
        {
          date: ingredient?.useUntil ?? null,
          placeholder: "DATE.USE_UNTIL.",
          order: 5,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actions,
      actionCancel: true,
      actionCancelIconDirective: ButtonIconDirective.ALWAYS_ICON,
    };

    this.dialogService
      .open(data)
      .pipe(
        tap((result) => {
          if (result?.actionKey === "add-conversion") {
            this.ingredientConversionDialogsService.openAddIngredientConversionDialog(
              ingredient?.name
            );
          }
        })
      )
      .subscribe((result) => {
        if (!result) return;

        // Bearbeiten oder Hinzufügen
        if (result.actionAddOrApply) {
          const ingredient = new Ingredient({
            amount: result.numberInputs[0],
            name: result.textInputs[0],
            unit: result.textInputs[1],
            note: result.textInputs[2],
            useUntil: result.dateInputs[0],
          });

          // Hinzufügen
          if (add) {
            this.addIngredient(ingredient, ingredientsConversion);
          }

          // Bearbeiten
          else if (oldIngredient) {
            this.ingredientApiService.editOrDeleteIngredientAndUpdateIngredientAvailable(
              oldIngredient,
              false,
              ingredient
            );
          }
        }

        // Löschen
        else if (result.actionDelete && oldIngredient) {
          this.ingredientApiService.editOrDeleteIngredientAndUpdateIngredientAvailable(
            oldIngredient,
            true,
            ingredient
          );
        }
      });
  }

  private addIngredient(
    ingredient: Ingredient,
    ingredientsConversion?: IngredientConversion[] | null
  ) {
    const ingredientsAvailable = this.ingredientApiService.ingredientsAvailableSnapshot;

    const foundExactSameIngredient = Ingredient.findIngredientInListByIngredient(
      ingredient,
      ingredientsAvailable
    );

    // Nur auch nach ähnlichen Zutaten suchen,
    // falls es keine genau gleiche gibt
    const foundSimilarIngredient = !foundExactSameIngredient
      ? Ingredient.findIngredientInListByName(ingredient.name, ingredientsAvailable)
      : undefined;

    // Ersetzen und keine Aktion in Meldung anzeigen
    if (foundExactSameIngredient) {
      // Ersetzen
      this.ingredientApiService.editOrDeleteIngredientAndUpdateIngredientAvailable(
        foundExactSameIngredient,
        false,
        ingredient
      );

      // Keine Aktion mehr nötig
      this.notificationService.show(
        NotificationTemplateType.INGREDIENT_IS_ALREADY_AVAILABLE_EXACT_WAS_REPLACED,
        {
          snackbarPosition: this.isSmallScreen.matches ? "top" : undefined,
          messageReplace: {
            name: ingredient.name,
            available: new Ingredient(foundExactSameIngredient).getIngredientString(
              "de",
              ingredientsConversion,
              {
                onlyAmountAndUnitAndNote:
                  foundExactSameIngredient.name === ingredient.name &&
                  !!foundExactSameIngredient.amount,
              }
            ),
          },
        }
      );
    }

    // Erst hinzufügen, wenn Aktion geklickt wird
    else if (foundSimilarIngredient) {
      this.notificationService
        .show(NotificationTemplateType.INGREDIENT_IS_ALREADY_AVAILABLE_ADD_ANYWAYS, {
          snackbarPosition: this.isSmallScreen.matches ? "top" : undefined,
          messageReplace: {
            name: ingredient.name,
            available: new Ingredient(foundSimilarIngredient).getIngredientString(
              "de",
              ingredientsConversion,
              {
                onlyAmountAndUnitAndNote:
                  foundSimilarIngredient.name === ingredient.name &&
                  !!foundSimilarIngredient.amount,
              }
            ),
          },
        })
        ?.subscribe(() => {
          // Hinzufügen
          this.ingredientApiService.addIngredientAndUpdateIngredientAvailable(ingredient);
        });
    }

    // Hinzufügen
    else {
      this.ingredientApiService.addIngredientAndUpdateIngredientAvailable(ingredient);
    }
  }
}
