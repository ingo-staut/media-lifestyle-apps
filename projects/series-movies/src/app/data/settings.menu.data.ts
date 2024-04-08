import { Menu } from "shared/models/menu.type";
import { SettingsMenu, SettingsMenuKey } from "../models/enum/settings-menu.enum";

export const SETTINGS_MENU: Menu<SettingsMenu, SettingsMenuKey>[] = [
  {
    key: SettingsMenuKey.KEYMAP,
    name: SettingsMenu.KEYMAP,
    icon: "keymap",
  },
  {
    key: SettingsMenuKey.LANGUAGE_AND_REGION,
    name: SettingsMenu.LANGUAGE_AND_REGION,
    icon: "language",
  },
  { name: SettingsMenu.SEPARATOR },
  {
    key: SettingsMenuKey.DB,
    name: SettingsMenu.DB,
    icon: "database",
  },
  {
    key: SettingsMenuKey.IMPORT,
    name: SettingsMenu.IMPORT,
    icon: "import",
  },
  {
    key: SettingsMenuKey.DOWNLOAD,
    name: SettingsMenu.DOWNLOAD,
    icon: "download",
  },
  { name: SettingsMenu.SEPARATOR },
  {
    key: SettingsMenuKey.REQUESTS,
    name: SettingsMenu.REQUESTS,
    icon: "api",
  },
  {
    key: SettingsMenuKey.TESTING,
    name: SettingsMenu.TESTING,
    icon: "testing",
  },
  {
    name: SettingsMenu.SEPARATOR,
  },
  {
    key: SettingsMenuKey.ABOUT,
    name: SettingsMenu.ABOUT,
    icon: "info",
  },
  {
    key: SettingsMenuKey.HELP,
    name: SettingsMenu.HELP,
    icon: "help",
  },
];
