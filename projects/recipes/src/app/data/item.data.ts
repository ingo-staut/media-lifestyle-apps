import { DropdownData } from "shared/models/dropdown.type";
import { ItemType } from "../models/enum/item.enum";

export const ITEM_DATA: DropdownData<ItemType, string>[] = [
  {
    key: ItemType.FOOD,
    name: "FOOD",
    icon: "ingredient",
  },
  {
    key: ItemType.THING,
    name: "THING",
    icon: "thing",
  },
];
