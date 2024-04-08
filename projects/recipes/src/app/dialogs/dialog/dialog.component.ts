import { Component, HostListener, Inject, OnInit, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { cloneDeep } from "lodash";
import moment from "moment";
import { preventBrowserTabClosing } from "projects/recipes/src/utils/warning-dialog";
import { ButtonIconDirective } from "shared/directives/button-icon.directive";
import { CheckButton } from "shared/models/checkbutton.type";
import { DialogAction } from "shared/models/dialog-action.type";
import { ItemsType } from "shared/models/dialog-input.type";
import { DialogData, DialogReturnData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { cleanString } from "shared/utils/string";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";

@Component({
  selector: "app-dialog",
  templateUrl: "./dialog.component.html",
  styleUrls: ["./dialog.component.scss"],
})
export class DialogComponent implements OnInit {
  @ViewChildren("buttonInput") buttonInputs: HTMLButtonElement[] = [];

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  FormfieldType = FormfieldType;
  ButtonIconDirective = ButtonIconDirective;
  ItemsType = ItemsType;

  tristateButtonState: ButtonTristate;
  formGroup: FormGroup;

  showInputsInGroupIndex: boolean[] = [];
  actionPrimary?: DialogAction;

  get isAllowedSubmit() {
    return this.formGroup.valid;
  }

  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: FormBuilder,
    protected ingredientApiService: IngredientApiService
  ) {}

  ngOnInit(): void {
    this.actionPrimary = this.getActionPrimary();

    if (this.data.groupInputs)
      this.data.groupInputs.forEach((group) => {
        this.showInputsInGroupIndex.push(!group.hideInputsInGroupIfButtonNotChecked);
      });

    this.tristateButtonState = this.data.tristateInput?.state || ButtonTristate.NONE;

    this.formGroup = this.formBuilder.group({});

    if (this.data.textInputs) {
      this.data.textInputs.forEach((textInput) => {
        this.formGroup.addControl(
          "textInput" + textInput.placeholder,
          this.formBuilder.control(textInput.text)
        );
      });
    }
    if (this.data.textareaInputs) {
      this.data.textareaInputs.forEach((textareaInput) => {
        this.formGroup.addControl(
          "textareaInput" + textareaInput.placeholder,
          this.formBuilder.control(textareaInput.text)
        );
      });
    }
    if (this.data.dateInputs) {
      this.data.dateInputs.forEach((dateInput) => {
        this.formGroup.addControl(
          "dateInput" + dateInput.placeholder,
          this.formBuilder.control(dateInput.date ? moment(dateInput.date) : null)
        );
      });
    }
    if (this.data.numberInputs) {
      this.data.numberInputs.forEach((numberInput) => {
        this.formGroup.addControl(
          "numberInput" + numberInput.placeholder,
          this.formBuilder.control(numberInput.number)
        );
        this.formGroup.controls["numberInput" + numberInput.placeholder].valueChanges.subscribe(
          (value) => {
            this.disableAllButtonInputsIfNullValue(+value);
          }
        );
      });
    }
    if (this.data.timeInputs) {
      this.data.timeInputs.forEach((timeInput) => {
        this.formGroup.addControl(
          "timeInput" + timeInput.placeholder,
          this.formBuilder.control(timeInput.time)
        );
      });
    }
    if (this.data.groupInputs) {
      this.data.groupInputs.forEach((groupInput) => {
        groupInput.inputs.forEach((input) => {
          if ("text" in input) {
            this.formGroup.addControl(input.key, this.formBuilder.control(input.text));
          } else if ("number" in input) {
            this.formGroup.addControl(input.key, this.formBuilder.control(input.number));
          }
        });
      });
    }
    if (this.data.dropdownWithGroupsInputs) {
      this.data.dropdownWithGroupsInputs.forEach((dropdownWithGroupInput) => {
        this.formGroup.addControl(
          "dropdownWithGroup" + dropdownWithGroupInput.placeholder,
          this.formBuilder.control(dropdownWithGroupInput.selectedKey)
        );
      });
    }
  }

  getActionPrimary() {
    if (typeof this.data.actionPrimary === "string") {
      const action: DialogAction = {
        key: this.data.actionPrimary,
        text: "ACTION." + this.data.actionPrimary.toUpperCase(),
        icon: this.data.actionPrimary === ActionKey.ADD ? "add" : "check",
        color: "primary",
      };
      return action;
    } else if (typeof this.data.actionPrimary === "boolean") {
      return undefined;
    } else {
      return this.data.actionPrimary;
    }
  }

  disableAllButtonInputsIfNullValue(value: number) {
    if (this.data.disableButtonsAndSetTrueIfValueOfNumberInputIsZero) {
      if (value <= 1) {
        this.buttonInputs.forEach((buttonInput) => {
          buttonInput.disabled = true;
        });
      } else {
        this.buttonInputs.forEach((buttonInput) => {
          buttonInput.disabled = false;
        });
      }
    }
  }

  getAllData() {
    const data: DialogReturnData = {
      actionKey: "",
      textInputs: this.getTextInputValues(),
      textareaInputs: this.getTextareaInputValues(),
      numberInputs: this.getNumberInputValues(),
      tristateInput: this.tristateButtonState,
      buttonInputs: this.data.buttonInputs ?? [],
      dateInputs: this.getDateInputValues(),
      timeInputs: this.getTimeInputValues(),
      dropdownInputs: this.data.dropdownInputs?.map((data) => data.selectedKey) ?? [],
      dropdownWithGroupsInputs: this.getDropdownWithGroupsValues(),
      tristateButtonsInputs: cloneDeep(this.data.tristateButtonsInputs ?? []),
      groupInputs: cloneDeep(this.data.groupInputs ?? []),
      toggleGroupInputs: cloneDeep(
        this.data.toggleGroupInputs?.map((input) => input.selectedKey) ?? []
      ),
      itemsInputs: this.getItemsInputs(),
      checkBoxes: cloneDeep(this.data.checkBoxes ?? []),
      objectListInputs: [],
    };

    return data;
  }

  onActionPrimary(action: DialogAction | ActionKey | false) {
    const actionKey =
      typeof action === "string" ? action : typeof action === "boolean" ? "" : action.key;

    const actionAdd = actionKey === ActionKey.ADD;
    const actionApply = actionKey === ActionKey.APPLY;
    const actionAddOrApply = actionAdd || actionApply;

    const data: DialogReturnData = {
      ...this.getAllData(),
      actionKey,
      actionAdd,
      actionApply,
      actionAddOrApply,
    };

    this.dialogRef.close(data);
  }

  onActionDelete() {
    const data: DialogReturnData = {
      ...this.getAllData(),
      actionKey: ActionKey.DELETE,
      actionDelete: true,
    };

    this.dialogRef.close(data);
  }

  onActionClick(action: DialogAction) {
    const data: DialogReturnData = {
      ...this.getAllData(),
      actionKey: action.key ?? action.text,
      actionDelete: action.key === ActionKey.DELETE,
    };

    this.dialogRef.close(data);
  }

  onEnter() {
    if (!this.isAllowedSubmit) return;
    if (this.data.returnInInputSubmit !== undefined && !this.data.returnInInputSubmit) return;

    this.onActionPrimary(this.data.actionPrimary);
  }

  onCancel() {
    this.dialogRef.close();
  }

  getTextInputValues() {
    const textInputs: string[] = [];
    Object.keys(this.formGroup.controls).forEach((key) => {
      const abstractControl = this.formGroup.controls[key];
      if (abstractControl && key.startsWith("textInput")) {
        textInputs.push(cleanString(abstractControl.value));
      }
    });
    return textInputs;
  }

  getTextareaInputValues() {
    const textareaInputs: string[] = [];
    Object.keys(this.formGroup.controls).forEach((key) => {
      const abstractControl = this.formGroup.controls[key];
      if (abstractControl && key.startsWith("textareaInput")) {
        textareaInputs.push(cleanString(abstractControl.value));
      }
    });
    return textareaInputs;
  }

  getDropdownWithGroupsValues() {
    const dropdownValues: number[] = [];
    Object.keys(this.formGroup.controls).forEach((key) => {
      const abstractControl = this.formGroup.controls[key];
      if (abstractControl && key.startsWith("dropdownWithGroup")) {
        dropdownValues.push(abstractControl.value);
      }
    });
    return dropdownValues;
  }

  getNumberInputValues() {
    const numberInputs: number[] = [];
    Object.keys(this.formGroup.controls).forEach((key) => {
      const abstractControl = this.formGroup.controls[key];
      if (abstractControl && key.startsWith("numberInput")) {
        numberInputs.push(+abstractControl.value);
      }
    });
    return numberInputs;
  }

  getTimeInputValues() {
    const timeInputs: string[] = [];
    Object.keys(this.formGroup.controls).forEach((key) => {
      const abstractControl = this.formGroup.controls[key];
      if (abstractControl && key.startsWith("timeInput")) {
        timeInputs.push(cleanString(abstractControl.value));
      }
    });
    return timeInputs;
  }

  getDateInputValues() {
    const dateInputs: Date[] = [];
    Object.keys(this.formGroup.controls).forEach((key) => {
      const abstractControl = this.formGroup.controls[key];
      if (abstractControl && key.startsWith("dateInput")) {
        dateInputs.push(abstractControl.value?.toDate() ?? null);
      }
    });
    return dateInputs;
  }

  getItemsInputs() {
    return cloneDeep(
      this.data.itemsInputs?.map((item) =>
        item.items.map((i) => {
          if (item.itemsType === ItemsType.STRING) {
            return cleanString(i);
          } else {
            return i;
          }
        })
      ) ?? []
    );
  }

  onFormfieldActionClicked(key: string) {
    if (!key) return;

    const action = this.data.textInputs?.find((action) => action.placeholder === key);
    if (!action || !action.func) return;

    // z.B.: Bild suchen mit dem Titel
    if (action.funcInputKey && this.formGroup.controls["textInput" + action.funcInputKey]) {
      const text = this.formGroup.controls["textInput" + action.funcInputKey].getRawValue();
      action.func(text);
      return;
    }

    action.func();
  }

  onInputTextChange(value: string, index: number, i: number) {
    const input = this.data.groupInputs![index].inputs[i];
    if ("text" in input) input.text = cleanString(value);
    this.data.groupInputs![index].inputs[i] = input;
  }

  onInputNumberChange(value: number, index: number, i: number) {
    const input = this.data.groupInputs![index].inputs[i];
    if ("number" in input) input.number = value;
    this.data.groupInputs![index].inputs[i] = input;
  }

  onButtonInGroupChange(buttons: CheckButton<string>[], groupIndex: number) {
    if (!buttons.length) return;
    if (!this.data.groupInputs) return;

    const group = this.data.groupInputs[groupIndex];
    const lastInputInGroup = group.inputs[group.inputs.length - 1];

    if ("buttons" in lastInputInGroup && lastInputInGroup.buttons.length > 1) return;

    if (group.hideInputsInGroupIfButtonNotChecked) {
      if (buttons[0].state === ButtonTristate.TRUE) this.showInputsInGroupIndex[groupIndex] = true;
      if (buttons[0].state !== ButtonTristate.TRUE) this.showInputsInGroupIndex[groupIndex] = false;
    } else if (group.hideInputsInGroupIfButtonIsChecked) {
      if (buttons[0].state === ButtonTristate.TRUE) this.showInputsInGroupIndex[groupIndex] = false;
      if (buttons[0].state !== ButtonTristate.TRUE) this.showInputsInGroupIndex[groupIndex] = true;
    }
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeBrowserTabClose(event: any) {
    preventBrowserTabClosing(event, true);
  }
}
