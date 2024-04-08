import { Injectable } from "@angular/core";
import { cloneDeep } from "lodash";
import { take, tap } from "rxjs";
import { ButtonIconDirective } from "shared/directives/button-icon.directive";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { CheckBox, ItemsType } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { ITEM_DATA } from "../../data/item.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { PurchaseToAdditionalIngredientsDialogService } from "../../dialogs/purchase-to-additional-ingredients-dialog/purchase-to-additional-ingredients-dialog.service";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Ingredient } from "../../models/ingredient.class";
import { Item } from "../../models/item.class";
import { Purchase } from "../../models/purchase.class";
import { IngredientApiService } from "../ingredient/ingredient.api.service";
import { PurchaseApiService } from "./purchase.api.service";

@Injectable({
  providedIn: "root",
})
export class PurchaseDialogsService {
  constructor(
    private dialogService: DialogService,
    private purchaseApiService: PurchaseApiService,
    private purchaseToAdditionalIngredientsDialogService: PurchaseToAdditionalIngredientsDialogService,
    private ingredientApiService: IngredientApiService
  ) {}

  openAddOrEditPurchaseDialog(parameters?: {
    add?: boolean;
    addFromShoppingList?: { checkBoxText?: string };
    purchase?: Purchase;
    ingredientsConversion?: IngredientConversion[] | null;
    completerListStores?: string[] | CompleterEntry[] | null;
    completerList?: string[] | CompleterEntry[] | null;
    defaultType?: ItemType;
  }) {
    const {
      purchase,
      completerListStores,
      completerList,
      defaultType,
      add: addWithData,
      addFromShoppingList,
      ingredientsConversion,
    } = parameters ?? {};
    const add = addWithData ?? !purchase;

    const checkBoxes: CheckBox[] = [];

    if (addFromShoppingList) {
      checkBoxes.push({
        checked: true,
        texts: ["CHECK.DELETE_ALL_INGREDIENTS"],
      });

      if (addFromShoppingList.checkBoxText) {
        checkBoxes.push({
          checked: true,
          texts: [addFromShoppingList.checkBoxText],
        });
      }
    }

    const data: DialogData<Item, IngredientConversion> = {
      title: add ? "PURCHASE.ADD" : "PURCHASE.EDIT",
      icons: ["shopping-cart"],
      dateInputs: [
        {
          date: add ? new Date() : purchase?.date ?? new Date(),
          placeholder: "DATE.",
          required: true,
          order: 2,
        },
      ],
      numberInputs: [
        {
          number: purchase?.price || null,
          placeholder: "COST.",
          icon: "money",
          suffixShort: "€",
          suffixLong: "€",
          required: true,
          order: 3,
        },
      ],
      textInputs: [
        {
          text: purchase?.store ?? "",
          placeholder: "STORE.",
          icon: "store",
          completerList: completerListStores,
          required: true,
          order: 1,
        },
        {
          text: purchase?.note ?? "",
          placeholder: "NOTE.",
          icon: "note",
          order: 4,
        },
      ],
      toggleGroupInputs: [
        {
          data: ITEM_DATA,
          selectedKey: purchase?.type ?? defaultType ?? ItemType.FOOD,
          showText: true,
          placeholder: "TYPE",
          order: 5,
        },
      ],
      itemsInputs: [
        {
          items: purchase?.items ?? [],
          itemsType: ItemsType.ITEM,
          completerList: completerList,
          ingredientsConversion: ingredientsConversion,
          showDeleteButton: true,
          placeholder: "PURCHASE.ITEMS_SHORT",
          order: 6,
        },
      ],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionCancel: true,
      actionDelete: !add,
      actions: add
        ? []
        : [
            {
              key: "add-to-available",
              text: "AVAILABLE.INGREDIENTS_ADD",
              icon: "available-move-to",
              buttonIconDirective: ButtonIconDirective.NORMAL,
            },
          ],
      checkBoxes,
    };

    return this.dialogService.open(data).pipe(
      tap((result) => {
        if (!result) return;

        if (result.actionKey === "add-to-available" && !add && purchase) {
          this.onOpenAddToAdditionals(purchase);
        } else if (result.actionAddOrApply) {
          const newPurchase = new Purchase({
            ...purchase,
            date: result.dateInputs[0]!,
            price: result.numberInputs[0],
            note: result.textInputs[1],
            items: result.itemsInputs[0].map((item) => new Item(item as any)),
            type: result.toggleGroupInputs[0] as ItemType,
            store: result.textInputs[0],
          });
          this.purchaseApiService.saveAndReloadPurchase(newPurchase);
        } else if (result.actionDelete && purchase) {
          this.purchaseApiService.deletePurchaseById(purchase);
        }
      })
    );
  }

  private onOpenAddToAdditionals(purchase: Purchase) {
    this.purchaseToAdditionalIngredientsDialogService.open(purchase.items).subscribe((result) => {
      if (!result) return;

      this.ingredientApiService.ingredientsAvailable$
        .pipe(take(1))
        .subscribe((ingredientsAvailable) => {
          const newList = cloneDeep(ingredientsAvailable);

          result.forEach((ingredient) => {
            if (!ingredient) return;
            Ingredient.replaceIngredientInListByNameAndUnit(ingredient, newList);
          });

          this.ingredientApiService.saveAndReloadIngredientsAvailable(newList, true);
        });
    });
  }
}
