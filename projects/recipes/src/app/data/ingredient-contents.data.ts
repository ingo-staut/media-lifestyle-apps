import { CheckButton } from "shared/models/checkbutton.type";
import { DropdownData } from "shared/models/dropdown.type";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { Group } from "shared/models/type-group.type";
import { QuickAddDropdownFilterFromSearch } from "../../../../../shared/models/search-filter.type";
import { getQuickAddDropdownOnlyEntriesFilterFromSearch } from "../../../../../shared/models/type.function";
import { IngredientConversionContentType } from "../models/enum/ingredient-conversion-content.enum";

export const CONTENTS = new Map<
  IngredientConversionContentType,
  { type: IngredientConversionContentType; icon: string; name: string; not?: boolean }
>([
  [
    IngredientConversionContentType.NO,
    { type: IngredientConversionContentType.NO, icon: "contents-no", name: "CONTENT.NO" },
  ],
  [
    IngredientConversionContentType.VEGAN,
    { type: IngredientConversionContentType.VEGAN, icon: "contents-vegan", name: "CONTENT.VEGAN" },
  ],
  [
    IngredientConversionContentType.VEGETARIAN,
    {
      type: IngredientConversionContentType.VEGETARIAN,
      icon: "contents-vegetarian",
      name: "CONTENT.VEGETARIAN",
    },
  ],
  [
    IngredientConversionContentType.ALCOHOL,
    {
      type: IngredientConversionContentType.ALCOHOL,
      icon: "contents-alcohol",
      name: "CONTENT.ALCOHOL",
    },
  ],
  [
    IngredientConversionContentType.SUGAR,
    { type: IngredientConversionContentType.SUGAR, icon: "contents-sugar", name: "CONTENT.SUGAR" },
  ],
  [
    IngredientConversionContentType.LACTOSE,
    {
      type: IngredientConversionContentType.LACTOSE,
      icon: "contents-lactose",
      name: "CONTENT.LACTOSE",
    },
  ],
  [
    IngredientConversionContentType.FRUCTOSE,
    {
      type: IngredientConversionContentType.FRUCTOSE,
      icon: "contents-fructose",
      name: "CONTENT.FRUCTOSE",
    },
  ],
  [
    IngredientConversionContentType.GLUTEN,
    {
      type: IngredientConversionContentType.GLUTEN,
      icon: "contents-gluten",
      name: "CONTENT.GLUTEN",
    },
  ],
  [
    IngredientConversionContentType.EGG,
    { type: IngredientConversionContentType.EGG, icon: "contents-egg", name: "CONTENT.EGG" },
  ],
  [
    IngredientConversionContentType.MEAT,
    { type: IngredientConversionContentType.MEAT, icon: "contents-meat", name: "CONTENT.MEAT" },
  ],
  [
    IngredientConversionContentType.FISH,
    { type: IngredientConversionContentType.FISH, icon: "contents-fish", name: "CONTENT.FISH" },
  ],
]);

export const CONTENTS_LIST: ReadonlyArray<Group<IngredientConversionContentType>> = [
  {
    name: "CONTENT.S",
    icon: "contents",
    entries: [
      {
        type: IngredientConversionContentType.VEGAN,
        icon: "contents-vegan",
        name: "CONTENT.VEGAN",
      },
      {
        type: IngredientConversionContentType.VEGETARIAN,
        icon: "contents-vegetarian",
        name: "CONTENT.VEGETARIAN",
      },
      {
        type: IngredientConversionContentType.ALCOHOL,
        icon: "contents-alcohol",
        name: "CONTENT.ALCOHOL",
      },
      {
        type: IngredientConversionContentType.ALCOHOL_NOT,
        icon: "contents-alcohol-not",
        name: "CONTENT.ALCOHOL_NOT",
        negation: true,
      },
      {
        type: IngredientConversionContentType.SUGAR,
        icon: "contents-sugar",
        name: "CONTENT.SUGAR",
      },
      {
        type: IngredientConversionContentType.SUGAR_NOT,
        icon: "contents-sugar-not",
        name: "CONTENT.SUGAR_NOT",
        negation: true,
      },
      {
        type: IngredientConversionContentType.LACTOSE_NOT,
        icon: "contents-lactose-not",
        name: "CONTENT.LACTOSE_NOT",
        additionalSearchTerms: ["Keine Milch", "No milk", "Pas de lait", "Sin leche"],
        negation: true,
      },
      {
        type: IngredientConversionContentType.FRUCTOSE_NOT,
        icon: "contents-fructose-not",
        name: "CONTENT.FRUCTOSE_NOT",
        additionalSearchTerms: ["Keine Früchte", "Keine Frucht", "No fruit", "No fruits"],
        negation: true,
      },
      {
        type: IngredientConversionContentType.GLUTEN_NOT,
        icon: "contents-gluten-not",
        name: "CONTENT.GLUTEN_NOT",
        negation: true,
      },
    ],
  },
];

export const CONTENTS_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH: ReadonlyArray<
  QuickAddDropdownFilterFromSearch<string>
> = getQuickAddDropdownOnlyEntriesFilterFromSearch(CONTENTS_LIST, "contents");

export const CONTENTS_LIST_BUTTON_TRISTATE: CheckButton<IngredientConversionContentType>[] =
  Array.from(CONTENTS.entries())
    .map((content) => {
      const value = content[1];
      if (
        value.type === IngredientConversionContentType.NO ||
        value.type === IngredientConversionContentType.VEGAN ||
        value.type === IngredientConversionContentType.VEGETARIAN
      )
        return;

      const checkButton: CheckButton<IngredientConversionContentType> = {
        type: value.type,
        state: ButtonTristate.FALSE,
        texts: ["", "", ""],
        tooltips: [value.name, value.name, value.name + "_NOT"],
        icons: [value.icon, value.icon, value.icon + "-not"],
      };

      return checkButton;
    })
    // .filter((value) => !!value);
    .filter((value): value is CheckButton<IngredientConversionContentType> => !!value);

export const INGREDIENT_CONTENTS_DROPDOWN_DATA: DropdownData<string, undefined>[] = [
  {
    key: "all",
    name: "CONTENT.S",
    icon: "contents",
  },
  {
    key: IngredientConversionContentType.NO,
    name: "CONTENT.NO",
    icon: "ingredient-conversion",
    color: "warn",
  },
  {
    key: IngredientConversionContentType.VEGAN_NOT,
    name: "CONTENT.VEGAN_NOT",
    icon: "contents-vegan-not",
  },
  {
    key: IngredientConversionContentType.VEGETARIAN_NOT,
    name: "CONTENT.VEGETARIAN_NOT",
    icon: "contents-vegetarian-not",
  },
  {
    key: IngredientConversionContentType.SUGAR,
    name: "CONTENT.SUGAR",
    icon: "contents-sugar",
  },
  {
    key: IngredientConversionContentType.ALCOHOL,
    icon: "contents-alcohol",
    name: "CONTENT.ALCOHOL",
  },
  // ! Eventuell mal später
  // {
  //   key: IngredientConversionContentType.LACTOSE,
  //   icon: "contents-lactose",
  //   name: "CONTENT.LACTOSE",
  // },
  // {
  //   key: IngredientConversionContentType.FRUCTOSE,
  //   icon: "contents-fructose",
  //   name: "CONTENT.FRUCTOSE",
  // },
  // {
  //   key: IngredientConversionContentType.GLUTEN,
  //   icon: "contents-gluten",
  //   name: "CONTENT.GLUTEN",
  // },
  // {
  //   key: IngredientConversionContentType.EGG,
  //   icon: "contents-egg",
  //   name: "CONTENT.EGG",
  // },
  // { key: IngredientConversionContentType.MEAT, icon: "contents-meat", name: "CONTENT.MEAT" },
  // { key: IngredientConversionContentType.FISH, icon: "contents-fish", name: "CONTENT.FISH" },
];
