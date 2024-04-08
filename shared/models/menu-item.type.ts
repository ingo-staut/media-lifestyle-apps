import { Action } from "./action.type";

export type MenuItem<ValueType> = {
  value: ValueType;
  id?: string;
  text: string;
  description?: string;
  icon?: string;
  icons?: string[];
  iconsTooltip?: string[];
  image?: string;
  favorite?: boolean;
  highlight?: boolean;
  groupKey?: string;
  groupName?: string;
  hide?: boolean;
  actions?: Action[];
  onlyText?: boolean;
};

export const sortByFavorite = <MenuItemValueType extends { favorite?: boolean }>(
  a: MenuItem<MenuItemValueType>,
  b: MenuItem<MenuItemValueType>
) => {
  if (a.favorite && !b.favorite) {
    return -1;
  }
  if (!a.favorite && b.favorite) {
    return 1;
  }
  return 0;
};
