import { Language } from "../../../../../shared/models/enum/language.enum";
import { SettingsEntry } from "./settings-entry.type";
import { SettingsPage } from "./settings-page.type";

export class Settings {
  id: string;
  language: Language;
  allAccordionInitiallyPanelExpanded: SettingsPage<boolean>;
  plannedRecipesTabGroupInitialSelectedIndex: SettingsEntry<number>;
  editIngredientInListWithDialog: SettingsEntry<boolean>;
  editIngredientInTagsWithDialog: SettingsEntry<boolean>;
  editUtensilInTagsWithDialog: SettingsEntry<boolean>;

  constructor(data: Settings) {
    this.id = data.id;
    this.language = data.language;
    this.allAccordionInitiallyPanelExpanded = data.allAccordionInitiallyPanelExpanded;
    this.plannedRecipesTabGroupInitialSelectedIndex =
      data.plannedRecipesTabGroupInitialSelectedIndex;
    this.editIngredientInListWithDialog = data.editIngredientInListWithDialog;
    this.editIngredientInTagsWithDialog = data.editIngredientInTagsWithDialog;
    this.editUtensilInTagsWithDialog = data.editUtensilInTagsWithDialog;
  }
}
