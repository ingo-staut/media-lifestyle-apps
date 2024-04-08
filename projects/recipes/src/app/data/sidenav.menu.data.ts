import { SidenavMenuItem } from "shared/models/sidenav-menu.type";

export enum PageIndex {
  RECIPES = 0,
  EXPLORE = 1,
  PURCHASES = 2,
  SHOPPING_LIST = 3,
  STATISTICS = 4,
  SEARCH = 5,
}

export const SIDENAV_MENU: SidenavMenuItem[] = [
  {
    name: "MENU.RECIPES",
    icon: "recipe",
    url: "recipes",
  },
  {
    name: "MENU.EXPLORE",
    icon: "explore",
    url: "explore",
  },
  {
    name: "MENU.PURCHASES",
    icon: "shopping-cart",
    url: "purchases",
    notSubnav: true,
  },
  {
    name: "MENU.SHOPPING_LIST",
    icon: "shopping-list",
    url: "shopping-list",
  },
  {
    name: "MENU.STATISTICS",
    icon: "statistics",
    url: "statistics",
    notSubnav: true,
    notTopnav: true,
    notSidenav: true,
  },
  {
    name: "MENU.SEARCH",
    icon: "search",
    url: "search",
    notTopnav: true,
  },
];
