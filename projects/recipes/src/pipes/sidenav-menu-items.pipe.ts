import { Pipe, PipeTransform } from "@angular/core";
import { DialogAction } from "shared/models/dialog-action.type";
import { PageIndex } from "../app/data/sidenav.menu.data";

@Pipe({
  name: "sidenavMenuItems",
})
export class SidenavMenuItemsPipe implements PipeTransform {
  transform(selectedIndex: number) {
    const moreMenuItem: DialogAction = {
      key: "more",
      icon: "more",
      text: "MORE",
      value: "gray-background",
    };

    switch (selectedIndex) {
      case PageIndex.RECIPES:
      case PageIndex.EXPLORE:
      case PageIndex.SEARCH:
        return [];
      case PageIndex.PURCHASES:
        return [
          {
            key: "create-purchase",
            icon: "shopping-cart",
            text: "PURCHASE.ADD",
          },
          {
            key: "create-store",
            text: "STORE.ADD",
            icon: "store",
          },
          moreMenuItem,
        ];
      case PageIndex.SHOPPING_LIST:
        return [
          {
            key: "create-ingredient-shopping-list",
            text: "INGREDIENT.ADD",
            icon: "shopping-list",
          },
          {
            key: "create-ingredient-available",
            text: "INGREDIENT.ADD",
            icon: "available",
          },
          {
            key: "create-conversion",
            text: "CONVERSION.ADD",
            icon: "ingredient-conversion",
          },
          moreMenuItem,
        ];

      default:
        return [moreMenuItem];
    }
  }
}
