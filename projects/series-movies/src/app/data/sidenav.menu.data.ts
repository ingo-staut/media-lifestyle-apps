import { SidenavMenuItem } from "shared/models/sidenav-menu.type";

export const SIDENAV_MENU: SidenavMenuItem[] = [
  {
    name: "MENU.START",
    url: "start",
    icon: "home",
  },
  {
    name: "WATCH",
    url: "watching",
    icon: "watch",
  },
  {
    name: "EXPLORE.",
    url: "explore",
    icon: "explore",
  },
  {
    name: "Nachrichten",
    url: "news",
    icon: "news",
    notSubnav: true,
  },
  {
    name: "MENU.STATISTICS",
    url: "statistics",
    icon: "statistics",
    notSubnav: true,
    notTopnav: true,
    notSidenav: true,
  },
  {
    name: "MENU.SEARCH",
    url: "search",
    icon: "search",
    notTopnav: true,
  },
];
