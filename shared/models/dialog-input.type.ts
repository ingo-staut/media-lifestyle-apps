import { Action } from "./action.type";
import { CheckButton } from "./checkbutton.type";
import { CompleterEntry } from "./completer-entry.type";
import { DropdownData } from "./dropdown.type";
import { ButtonTristate } from "./enum/button-tristate.enum";
import { FormfieldType } from "./enum/formfield.enum";
import { SliderIcons } from "./enum/slider-icons.enum";
import { SearchEngine } from "./search-engine.type";
import { Entry } from "./type-entry.type";
import { Group } from "./type-group.type";

type Input = {
  placeholder: string;
  disabled?: boolean;
  order?: number;
  hint?: string;
  hintReplace?: string;
  type?: FormfieldType;
};

export type TextInput = Input & {
  text: string;
  icon: string;
  required?: boolean;
  func?: (text?: string) => void;
  funcInputKey?: string;
  completerList?: string[] | CompleterEntry[] | null;
};

export type TextareaInput = Input & {
  text: string;
  required?: boolean;
};

export type NumberInput = Input & {
  number: number | null;
  icon: string;
  suffixLong?: string;
  suffixShort?: string;
  required?: boolean;
  showSlider?: boolean;
  hideSliderInitially?: boolean;
  sliderWithIcons?: SliderIcons;
  max?: number;
  min?: number;
  sliderMax?: number;
  sliderMin?: number;
  sliderSteps?: number;
  sliderNoNumberFormatting?: boolean;
  formatAsDuration?: boolean;
};

export type TristateInput = Input & {
  state: ButtonTristate;
  icons: [string, string, string];
  texts: [string, string, string];
};

export type ButtonInput = Input & {
  key?: string;
  state: boolean;
  icons: [string, string];
  texts: [string, string];
};

export type CheckBox = {
  checked: boolean;
  texts: [string, string] | [string];
};

export type DateInput = Input & {
  date: Date | null;
  min?: Date;
  max?: Date;
  required?: boolean;
};

export type TimeInput = Input & {
  time: string | null;
  required?: boolean;
  minutesSteps?: number;
};

export type DropdownInput = Input & {
  data: DropdownData<string, string>[];
  selectedKey: string;
};

export type ObjectListInput<ObjectListType> = Input & {
  data: ObjectListType[];
};

export type DropdownWithGroupsInput = Input & {
  required?: boolean;
  data: ReadonlyArray<Group<number>>;
  selectedKey: number;
  noneText: string;
  noneIcon: string;
  defaultText: string;
  iconPrefix?: string;
  findByType: (type: number) => Entry<number>;
};

export type TristateButtonsInput<CheckButtonType> = Input & {
  buttons: CheckButton<CheckButtonType>[];
  twoStates?: boolean;
};

export type ActionButton = {
  action: Action;
  searchEngine?: SearchEngine;
  closeAfterClick?: boolean;
  maxWidth?: string;
  func: (...any: any) => void;
};

export type ActionButtons = Input & {
  buttons: ActionButton[];
};

export type GroupInputs = Input & {
  inputs: ((TextInput | NumberInput | TristateButtonsInput<string>) & { key: string })[];
  hideInputsInGroupIfButtonNotChecked?: boolean;
  hideInputsInGroupIfButtonIsChecked?: boolean;
};

export type ToggleGroupInput = Input & {
  data: DropdownData<string, string>[];
  selectedKey: string;
  showText?: boolean;
  showTextOnlySelected?: boolean;
};

export enum ItemsType {
  STRING = "STRING",
  ITEM = "ITEM",
}

export type ItemsInput<ItemType, IngredientConversionType> = Input & {
  items: ItemType[];
  itemsType?: ItemsType;
  completerList?: string[] | CompleterEntry[] | null;
  ingredientsConversion?: IngredientConversionType[] | null;
  addIconWhenBigButton?: string;
  maxHeight?: number;
  firstCharToTitleCase?: boolean;
  showDeleteButton?: boolean;
  showAddFromClipboardButton?: boolean;
  showDeleteAllExceptFirst?: boolean;
  showDeleteAllExceptFirstTwo?: boolean;
  findIconFunction?: (text: string) => string;
  buttons?: ActionButton[];
};
