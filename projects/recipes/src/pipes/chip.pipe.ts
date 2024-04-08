import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DropdownData } from "shared/models/dropdown.type";
import { DateFns } from "shared/utils/date-fns";
import { firstCharToTitleCase, getPriceOfString } from "shared/utils/string";
import { ITEM_DATA } from "../app/data/item.data";
import { ItemType } from "../app/models/enum/item.enum";
import { PreparationHistoryType } from "../app/models/enum/preparation-history.enum";
import { IngredientConversion } from "../app/models/ingredient-conversion.class";
import { Instruction } from "../app/models/instruction.class";
import { Item } from "../app/models/item.class";
import { PreparationHistoryEntry } from "../app/models/preparation-history.class";
import { Purchase } from "../app/models/purchase.class";
import { Store } from "../app/models/store.type";

@Pipe({
  name: "chip",
})
export class ChipPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    text: string,
    stores: Store[] | null,
    ingredientsConversion: IngredientConversion[] | null
  ): {
    text: string;
    icon?: string;
    image?: string;
    emoji?: string;
    dropdown?: DropdownData<ItemType, string>[];
    selectedKey?: string;
  } {
    if (!text) return { text };
    if (!stores) return { text };
    if (!ingredientsConversion) return { text };

    const date = DateFns.getDateOfString(text, this.translateService);
    if (date)
      return {
        text: DateFns.formatDateShort(date, this.translateService.currentLang),
        icon: "calendar",
      };

    const duration = DateFns.getDurationRangeOfString(text);
    if (duration)
      return {
        text: DateFns.formatDurationRange(duration, this.translateService.currentLang),
        icon: "time",
      };

    const temperature = Instruction.findTemperature(text);
    if (temperature)
      return {
        text: `${temperature} °C`,
        icon: "temperature",
      };

    const price = getPriceOfString(text);
    if (price)
      return {
        text: `${price} €`,
        icon: "money",
      };

    const store = stores.find((store) => store.name.toLowerCase() === text.toLowerCase());
    if (store) return { text: store.name, image: store.icon };

    const preparationHistoryEntryType = PreparationHistoryEntry.getPreparationOfString(text);
    if (preparationHistoryEntryType)
      return {
        text: this.translateService.instant("HISTORY." + preparationHistoryEntryType),
        icon:
          "preparationHistory-" +
          (preparationHistoryEntryType === PreparationHistoryType.PLANNED ? "planned" : "prepared"),
      };

    const portionAmount = PreparationHistoryEntry.getPortionAmountOfString(text);
    if (portionAmount)
      return {
        text:
          portionAmount.toString() +
          " " +
          this.translateService.instant("PORTION." + (portionAmount <= 1 ? "" : "S")),
        icon: "portion-eat",
      };

    const item = Item.findItem(text, ingredientsConversion);
    if (item) {
      const conversion = IngredientConversion.findIngredientConversion(
        item.name,
        ingredientsConversion
      );
      const emoji = conversion && conversion.emoji;
      return {
        text: new Item(item).getItemString(),
        icon: emoji ? undefined : "ingredient",
        emoji: emoji,
      };
    }

    const itemType = Purchase.findPurchaseType(text);
    if (itemType) {
      return {
        text: "",
        icon: "",
        dropdown: ITEM_DATA,
        selectedKey: itemType,
      };
    }

    return { text: firstCharToTitleCase(text) };
  }
}
