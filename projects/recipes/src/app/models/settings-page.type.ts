import { SettingsEntry } from "./settings-entry.type";

export type SettingsPage<Type> = {
  recipes: SettingsEntry<Type>;
  shopping: SettingsEntry<Type>;
  shoppingList: SettingsEntry<Type>;
  statistics: SettingsEntry<Type>;
};
