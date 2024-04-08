import { Injectable } from "@angular/core";
import {
  PREFIX_RECIPES_PLANNED_INDEX,
  PURCHASES_QUICK_ROW_LAYOUT,
  PURCHASES_TYPE,
  SEARCH_FILTER_EXPANDED,
  SETTINGS_SHOW_RAW_DATA,
  SETTINGS_TAB_INDEX,
  SHOPPINGLIST_RECIPES_DROPDOWN,
  SHOPPINGLIST_RECIPES_MODE_DROPDOWN,
  SHOPPINGLIST_TAB_INDEX,
} from "../data/local-storage.data";
import { ItemType } from "../models/enum/item.enum";
import { QuickRowLayoutType } from "../models/enum/quick-row-layout.enum";
import { ChooseRecipeViewMode, WithInList } from "../pages/shopping-list/shopping-list.component";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService {
  constructor() {}

  private get<ValueType>(store: string, defaultValue: ValueType): ValueType {
    return (localStorage.getItem(store) ?? defaultValue) as ValueType;
  }

  private set(key: string, value: any) {
    localStorage.setItem(key, value?.toString());
  }

  private getBoolean(store: string): boolean {
    return localStorage.getItem(store) === "true";
  }

  setShoppingListTabIndex(index: number) {
    this.set(SHOPPINGLIST_TAB_INDEX, index);
  }

  getShoppingListTabIndex(): number {
    return Number(this.get<number>(SHOPPINGLIST_TAB_INDEX, 0));
  }

  setSettingsTabIndex(index: number) {
    this.set(SETTINGS_TAB_INDEX, index);
  }

  getSettingsTabIndex(): number {
    return Number(this.get<number>(SETTINGS_TAB_INDEX, 0));
  }

  setSettingsShowRawData(show: boolean) {
    this.set(SETTINGS_SHOW_RAW_DATA, show);
  }

  getSettingsShowRawData(): boolean {
    return this.getBoolean(SETTINGS_SHOW_RAW_DATA);
  }

  setShoppingListRecipesModeDropdown(mode: ChooseRecipeViewMode) {
    this.set(SHOPPINGLIST_RECIPES_MODE_DROPDOWN, mode);
  }

  getShoppingListRecipesModeDropdown(): ChooseRecipeViewMode {
    return this.get<ChooseRecipeViewMode>(
      SHOPPINGLIST_RECIPES_MODE_DROPDOWN,
      ChooseRecipeViewMode.RECIPES
    );
  }

  setShoppingListRecipesInListDropdown(mode: WithInList) {
    this.set(SHOPPINGLIST_RECIPES_DROPDOWN, mode);
  }

  getShoppingListRecipesInListDropdown(): WithInList {
    return this.get<WithInList>(SHOPPINGLIST_RECIPES_DROPDOWN, WithInList.WITH);
  }

  setSearchFilterExpanded(expanded: boolean) {
    this.set(SEARCH_FILTER_EXPANDED, expanded);
  }

  getSearchFilterExpanded() {
    return this.getBoolean(SEARCH_FILTER_EXPANDED);
  }

  setPurchasesFilterType(type: ItemType | null) {
    if (!type) return;
    this.set(PURCHASES_TYPE, type);
  }

  getPurchasesFilterType() {
    return this.get<ItemType>(PURCHASES_TYPE, ItemType.FOOD);
  }

  setPurchasesQuickRowLayout(type: QuickRowLayoutType) {
    this.set(PURCHASES_QUICK_ROW_LAYOUT, type);
  }

  getPurchasesQuickRowLayout() {
    return this.get<QuickRowLayoutType>(PURCHASES_QUICK_ROW_LAYOUT, QuickRowLayoutType.WITH_ROW);
  }

  setRecipesPlannedIndex(index: number) {
    this.set(PREFIX_RECIPES_PLANNED_INDEX, index);
  }

  getRecipesPlannedIndex() {
    return Number(this.get<number>(PREFIX_RECIPES_PLANNED_INDEX, 0));
  }
}
