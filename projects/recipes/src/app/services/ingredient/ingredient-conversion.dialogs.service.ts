import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { PricePipe } from "projects/recipes/src/pipes/price.pipe";
import {
  GroupInputs,
  NumberInput,
  TextInput,
  TristateButtonsInput,
} from "shared/models/dialog-input.type";
import { DialogData, DialogReturnData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { getNewUUID } from "shared/utils/uuid";
import { CONTENTS_LIST_BUTTON_TRISTATE } from "../../data/ingredient-contents.data";
import { ITEM_DATA } from "../../data/item.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Conversion } from "../../models/conversion.type";
import {
  IngredientConversionContentState,
  IngredientConversionContentType,
} from "../../models/enum/ingredient-conversion-content.enum";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientConversionContent } from "../../models/ingredient-conversion-content.type";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { IngredientApiService } from "./ingredient.api.service";

@Injectable({
  providedIn: "root",
})
export class IngredientConversionDialogsService {
  constructor(
    private dialogService: DialogService,
    private ingredientApiService: IngredientApiService,
    private translateService: TranslateService,
    private pricePipe: PricePipe
  ) {}

  private getAddIngredientConversionData(name: string, defautlItemType: ItemType) {
    const data: DialogData = {
      title: "CONVERSION.ADD",
      icons: ["ingredient-conversion-add"],
      textInputs: [
        {
          text: name,
          icon: "rename",
          placeholder: "TITLE",
          required: true,
          order: 1,
        },
        {
          text: "",
          icon: "emoji",
          placeholder: "EMOJI",
          order: 2,
        },
        {
          text: "",
          icon: "unit",
          placeholder: "UNIT",
          order: 3,
        },
      ],
      numberInputs: [
        {
          number: null,
          icon: "portion",
          placeholder: "AMOUNT",
          required: true,
          order: 2,
        },
        {
          number: null,
          icon: "money",
          placeholder: "COST.",
          suffixShort: "€",
          suffixLong: "€",
          order: 4,
        },
      ],
      itemsInputs: [
        {
          items: [],
          placeholder: "ALTERNATIVE_NAMES",
          addIconWhenBigButton: "rename",
          showDeleteButton: true,
          maxHeight: 160,
          order: 5,
        },
      ],
      toggleGroupInputs: [
        {
          data: ITEM_DATA,
          selectedKey: defautlItemType,
          showText: true,
          placeholder: "TYPE",
          order: 6,
        },
      ],
      tristateButtonsInputs: [
        {
          placeholder: "CONTENT.S",
          buttons: cloneDeep(CONTENTS_LIST_BUTTON_TRISTATE),
          order: 7,
          twoStates: true,
        },
      ],
      actionPrimary: ActionKey.ADD,
      actionCancel: true,
    };

    return data;
  }

  openAddIngredientConversionDialog(name?: string, defautlItemType: ItemType = ItemType.FOOD) {
    const data = this.getAddIngredientConversionData(name ?? "", defautlItemType);

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      if (result.actionAdd) {
        const costs: number[] = [];
        if (result.numberInputs[1]) {
          costs.push(result.numberInputs[1]);
        }

        const contents = this.getReturnDataContents(result);

        const conversion = new IngredientConversion({
          id: getNewUUID(),
          name: result.textInputs[0],
          emoji: result.textInputs[1],
          type: result.toggleGroupInputs[0] as ItemType,
          contents,
          alternativeNames: result.itemsInputs[0],
          conversions: [
            {
              factor: 1,
              amount: result.numberInputs[0],
              costs,
              unit: result.textInputs[2],
            },
          ],
        });

        this.ingredientApiService.saveAndReloadIngredientConversion(conversion);
      }
    });
  }

  private getGroupInputs(ingredientConversion: IngredientConversion, indexAdd: number) {
    const groupInputs = ingredientConversion.conversions.map((conversion, index) => {
      const placeholder =
        (index + 1).toString() + ". " + this.translateService.instant("CONVERSION.SHORT");

      const amountInput: NumberInput & { key: string } = {
        key: getNewUUID(),
        type: FormfieldType.NUMBER,
        number: conversion.amount,
        icon: "portion",
        placeholder: "AMOUNT",
        required: true,
      };

      const unitInput: TextInput & { key: string } = {
        key: getNewUUID(),
        type: FormfieldType.TEXT,
        text: conversion.unit,
        icon: "unit",
        placeholder: "UNIT",
      };

      const factorInput: NumberInput & { key: string } = {
        key: getNewUUID(),
        type: FormfieldType.NUMBER,
        number: conversion.factor,
        icon: "factor",
        placeholder: "FACTOR",
        suffixShort: "x",
        suffixLong: "x",
        required: true,
      };

      const costInput: NumberInput & { key: string } = {
        key: getNewUUID(),
        type: FormfieldType.NUMBER,
        number: null,
        icon: "money",
        placeholder: "COST.",
        suffixShort: "€",
        suffixLong: "€",
        hint: conversion.costs.length ? "COST.NEW_ADDED_TO_THESE" : "COST.NO_COSTS_AVAILABLE",
        hintReplace: conversion.costs
          .map((cost) => this.pricePipe.transform(cost, this.translateService.currentLang))
          .join(", "),
      };

      const tristateButtonsInput: TristateButtonsInput<string> & { key: string } = {
        key: getNewUUID(),
        type: FormfieldType.TOGGLE,
        placeholder: "",
        twoStates: true,
        buttons: [
          {
            type: "delete",
            state: ButtonTristate.FALSE,
            colors: ["", "warn", ""],
            texts: [
              "",
              this.translateService.instant("DELETE.!"),
              this.translateService.instant("DELETE.?"),
            ],
            icons: ["", "delete", "delete"],
          },
        ],
      };

      const groupInputs: GroupInputs = {
        placeholder,
        order: index + indexAdd,
        hideInputsInGroupIfButtonIsChecked: true,
        inputs: [amountInput, unitInput, factorInput, costInput, tristateButtonsInput],
      };

      return groupInputs;
    });

    return groupInputs;
  }

  private getAddGroupInputs(groupInputs: GroupInputs[], indexAdd: number) {
    // Umrechnung zum hinzufügen
    const amountInput = {
      key: getNewUUID() + "amount",
      type: FormfieldType.NUMBER,
      number: null,
      icon: "portion",
      placeholder: "AMOUNT",
    };

    const unitInput = {
      key: getNewUUID() + "unit",
      type: FormfieldType.TEXT,
      text: "",
      icon: "unit",
      placeholder: "UNIT",
    };

    const factorInput = {
      key: getNewUUID() + "factor",
      type: FormfieldType.NUMBER,
      number: null,
      icon: "factor",
      placeholder: "FACTOR",
      suffixShort: "x",
      suffixLong: "x",
    };

    const costInput = {
      key: getNewUUID() + "cost",
      type: FormfieldType.NUMBER,
      number: null,
      icon: "money",
      placeholder: "COST.",
      suffixShort: "€",
      suffixLong: "€",
    };

    const tristateButtonsInput: TristateButtonsInput<string> & { key: string } = {
      key: getNewUUID(),
      type: FormfieldType.TOGGLE,
      placeholder: "",
      twoStates: true,
      buttons: [
        {
          type: "add",
          state: ButtonTristate.FALSE,
          texts: [
            "",
            this.translateService.instant("ACTION.REMOVE"),
            this.translateService.instant("ACTION.ADD"),
          ],
          colors: ["", "", ""],
          icons: ["", "remove-from", "added"],
        },
      ],
    };

    groupInputs.push({
      placeholder: "CONVERSION.ADD_SHORT",
      order: indexAdd + 1,
      hideInputsInGroupIfButtonNotChecked: true,
      inputs: [amountInput, unitInput, factorInput, costInput, tristateButtonsInput],
    });
  }

  private getData(ingredientConversion: IngredientConversion, groupInputs: GroupInputs[]) {
    const data: DialogData = {
      title: "CONVERSION.EDIT",
      text: "ID: " + ingredientConversion.id || "-",
      icons: ["ingredient-conversion"],
      textInputs: [
        {
          text: ingredientConversion.name,
          icon: "rename",
          placeholder: "TITLE",
          required: true,
          order: 1,
        },
        {
          text: ingredientConversion.emoji,
          icon: "emoji",
          placeholder: "EMOJI",
          order: 2,
        },
      ],
      toggleGroupInputs: [
        {
          data: ITEM_DATA,
          selectedKey: ingredientConversion.type,
          showText: true,
          placeholder: "TYPE",
          order: 3,
        },
      ],
      tristateButtonsInputs: [
        {
          placeholder: "CONTENT.S",
          buttons: cloneDeep(CONTENTS_LIST_BUTTON_TRISTATE).map((button) => {
            ingredientConversion.contents.forEach((content) => {
              if (
                content.type === button.type &&
                (content.state === IngredientConversionContentState.PARTIALLY ||
                  content.state === IngredientConversionContentState.WITH)
              ) {
                button.state = ButtonTristate.TRUE;
              }
            });

            return button;
          }),
          order: 4,
          twoStates: true,
        },
      ],
      itemsInputs: [
        {
          items: ingredientConversion.alternativeNames,
          placeholder: "ALTERNATIVE_NAMES",
          addIconWhenBigButton: "rename",
          showDeleteButton: true,
          maxHeight: 160,
          order: 5,
        },
      ],
      groupInputs,
      actionPrimary: ActionKey.APPLY,
      actionCancel: true,
    };

    return data;
  }

  private getReturnDataContents(result: DialogReturnData) {
    const contents: IngredientConversionContent[] = [];
    result.tristateButtonsInputs[0].buttons.map((content) => {
      if (content.state !== ButtonTristate.TRUE) return;

      const c: IngredientConversionContent = {
        type: content.type as IngredientConversionContentType,
        state: IngredientConversionContentState.WITH,
      };

      contents.push(c);
    });

    return contents;
  }

  private getReturnDataConversions(
    ingredientConversion: IngredientConversion,
    result: DialogReturnData
  ) {
    const conversionsFromInputs = result.groupInputs.map((groupInput, index, array) => {
      // Umrechnung mit alten Werten füllen
      let conversion: Conversion | null =
        index < ingredientConversion.conversions.length
          ? ingredientConversion.conversions[index]
          : // Default
            // null;
            {
              amount: 0,
              unit: "",
              factor: 1,
              costs: [],
            };

      let removeOrAddButtonIsChecked = false;
      if (groupInput.inputs.length > 4 && "buttons" in groupInput.inputs[4]) {
        removeOrAddButtonIsChecked = groupInput.inputs[4].buttons[0].state === ButtonTristate.TRUE;
      }

      if ("number" in groupInput.inputs[0]) {
        conversion.amount = Number(groupInput.inputs[0].number) ?? 0;
      }

      if ("text" in groupInput.inputs[1]) {
        conversion.unit = groupInput.inputs[1].text ?? "";
      }

      if ("number" in groupInput.inputs[2]) {
        conversion.factor = Number(groupInput.inputs[2].number) ?? 1;
      }

      if ("number" in groupInput.inputs[3]) {
        const costs: number[] =
          index < ingredientConversion.conversions.length
            ? ingredientConversion.conversions[index].costs
            : [];
        if (groupInput.inputs[3].number) {
          costs.push(Number(groupInput.inputs[3].number));
        }
        conversion.costs = costs;
      }

      const { amount, unit, factor } = conversion;

      if (
        // Entweder wurde der Löschen-Button für die Umrechnung gesetzt,
        (removeOrAddButtonIsChecked && index < array.length - 1) ||
        // oder der Hinzufügen-Button für die neue Umrechnung
        (!removeOrAddButtonIsChecked && index === array.length - 1) ||
        // Wenn die Werte beim Hinzufügen
        // (oder in den anderen Umrechnungen) nicht richtig gesetzt sind
        factor === 0 ||
        amount === 0
      ) {
        conversion = null;
      }

      return conversion;
    });

    return conversionsFromInputs.filter((i): i is Conversion => !!i);
  }

  private getNewIngredientConversion(
    ingredientConversion: IngredientConversion,
    contents: IngredientConversionContent[],
    conversions: Conversion[],
    result: DialogReturnData
  ) {
    const newIngredientConversion = new IngredientConversion({
      ...ingredientConversion,
      name: result.textInputs[0],
      emoji: result.textInputs[1],
      type: result.toggleGroupInputs[0] as ItemType,
      contents,
      conversions: conversions,
      alternativeNames: result.itemsInputs[0],
    });

    return newIngredientConversion;
  }

  openEditIngredientConversionDialog(ingredientConversion: IngredientConversion) {
    const index = 6;
    const groupInputs = this.getGroupInputs(ingredientConversion, index);
    this.getAddGroupInputs(groupInputs, index);

    const data = this.getData(ingredientConversion, groupInputs);

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      if (result.actionApply) {
        const contents = this.getReturnDataContents(result);
        const conversions = this.getReturnDataConversions(ingredientConversion, result);
        const newIngredientConversion = this.getNewIngredientConversion(
          ingredientConversion,
          contents,
          conversions,
          result
        );

        this.ingredientApiService.saveAndReloadIngredientConversion(newIngredientConversion);
      }
    });
  }
}
