import {
  ActionButtons,
  ButtonInput,
  CheckBox,
  DateInput,
  DropdownInput,
  DropdownWithGroupsInput,
  GroupInputs,
  ItemsInput,
  NumberInput,
  ObjectListInput,
  TextInput,
  TextareaInput,
  TimeInput,
  ToggleGroupInput,
  TristateButtonsInput,
  TristateInput,
} from "../../shared/models/dialog-input.type";
import { ButtonIconDirective } from "../directives/button-icon.directive";
import { DialogAction } from "./dialog-action.type";
import { ActionKey } from "./enum/action-key.enum";
import { ButtonTristate } from "./enum/button-tristate.enum";

export type DialogData<ItemType = string, IngredientConversionType = any, ObjectListType = any> = {
  // Titel
  title: string;
  titleReplace?: any;

  // Beschreibungstext
  text?: string;
  textReplace?: any;
  textCssClassList?: string;

  icons: string[];

  // Felder
  textInputs?: TextInput[];
  textareaInputs?: TextareaInput[];
  numberInputs?: NumberInput[];
  tristateInput?: TristateInput;
  buttonInputs?: ButtonInput[];
  dateInputs?: DateInput[];
  timeInputs?: TimeInput[];
  dropdownInputs?: DropdownInput[];
  dropdownWithGroupsInputs?: DropdownWithGroupsInput[];
  tristateButtonsInputs?: TristateButtonsInput<string>[];
  groupInputs?: GroupInputs[];
  toggleGroupInputs?: ToggleGroupInput[];
  itemsInputs?: ItemsInput<ItemType, IngredientConversionType>[];
  objectLists?: ObjectListInput<ObjectListType>[];
  actionButtons?: ActionButtons[];

  checkBoxes?: CheckBox[];

  // Dialog-Aktionen (unten)
  actionPrimary: DialogAction | ActionKey | false;
  actions?: DialogAction[];
  actionCancel?: boolean;
  actionCancelIconDirective?: ButtonIconDirective;
  actionDelete?: boolean;
  actionDeleteIconDirective?: ButtonIconDirective;
  actionClose?: boolean;

  // Zusätzliche Funktionen
  returnInInputSubmit?: boolean;
  disableButtonsAndSetTrueIfValueOfNumberInputIsZero?: boolean;
};

export type DialogReturnData<ItemType = string, ObjectListType = any> = {
  actionKey: string;
  actionAdd?: boolean;
  actionApply?: boolean;
  actionAddOrApply?: boolean;
  actionDelete?: boolean;
  textInputs: string[];
  textareaInputs: string[];
  numberInputs: number[];
  tristateInput: ButtonTristate;
  buttonInputs: ButtonInput[];
  dateInputs: (Date | null)[];
  timeInputs: (string | null)[];
  dropdownInputs: string[];
  dropdownWithGroupsInputs: number[];
  tristateButtonsInputs: TristateButtonsInput<string>[];
  groupInputs: GroupInputs[];
  toggleGroupInputs: string[];
  itemsInputs: ItemType[][];
  checkBoxes: CheckBox[];
  objectListInputs: ObjectListType[];
};
