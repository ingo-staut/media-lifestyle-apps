import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { LEVELS } from "../data/level.data";
import { PREPARATIONS } from "../data/preparation.data";
import { DialogService } from "../dialogs/dialog/dialog.service";
import { LevelType } from "../models/enum/level.enum";
import { PreparationType, findPreparationByType } from "../models/enum/preparation.enum";
import { Instruction } from "../models/instruction.class";

export const maxTemperature = 250;
export const stepsTemperature = 10;
export const sliderMaxMinutes = 60;
export const stepsMinutes = 5;

@Injectable({
  providedIn: "root",
})
export class InstructionDialogsService {
  private isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialogService: DialogService) {}

  openAddOrEditInstruction(instruction?: Instruction, index?: number) {
    const add = !instruction;

    const data: DialogData = {
      title: add ? "INSTRUCTION.ADD" : "INSTRUCTION.EDIT",
      icons: ["preparation"],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
      textInputs: [
        {
          text: add ? "" : instruction.name,
          icon: "rename",
          placeholder: "TITLE",
          required: true,
        },
        {
          text: add ? "" : instruction.note ?? "",
          icon: "note",
          placeholder: "NOTE.",
        },
      ],
      numberInputs: [
        {
          number: add ? null : instruction.minTime || null,
          icon: "time",
          placeholder: "TIME.MIN",
          suffixLong: "TIME.MINUTES",
          suffixShort: "TIME.MINUTES_SHORT",
          sliderMax: sliderMaxMinutes,
          sliderSteps: stepsMinutes,
          showSlider: true,
          hideSliderInitially: !this.isSmallScreen.matches,
          formatAsDuration: true,
        },
        {
          number: add ? null : instruction.maxTime || null,
          icon: "time",
          placeholder: "TIME.MAX",
          suffixLong: "TIME.MINUTES",
          suffixShort: "TIME.MINUTES_SHORT",
          sliderMax: sliderMaxMinutes,
          sliderSteps: stepsMinutes,
          showSlider: true,
          hideSliderInitially: !this.isSmallScreen.matches,
          formatAsDuration: true,
        },
        {
          number: add ? null : instruction.temperature || null,
          icon: "temperature",
          placeholder: "TEMPERATURE",
          suffixLong: "°C",
          suffixShort: "°C",
          max: maxTemperature,
          sliderSteps: stepsTemperature,
          showSlider: true,
          hideSliderInitially: !this.isSmallScreen.matches,
        },
      ],
      dropdownInputs: [
        {
          data: LEVELS,
          selectedKey: instruction?.level || LevelType.LEVEL_NONE,
          placeholder: "LEVEL",
        },
      ],
      dropdownWithGroupsInputs: [
        {
          data: PREPARATIONS,
          selectedKey: instruction?.preparationType || 0,
          placeholder: "PREPARATION.TYPE",
          noneText: "PREPARATION.NO",
          noneIcon: "preparationType-none",
          defaultText: "PREPARATION.CHOOSE",
          iconPrefix: "preparationType",
          findByType: findPreparationByType,
        },
      ],
      textareaInputs: [
        {
          text: instruction?.text || "",
          placeholder: "DESCRIPTION.",
          order: 1,
        },
      ],
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return instruction;

        const newInstruction: Instruction = add
          ? new Instruction({
              name: result.textInputs[0],
              note: result.textInputs[1],
              minTime: result.numberInputs[0] || null,
              maxTime: result.numberInputs[1] || null,
              temperature: result.numberInputs[2] || null,
              level: result.dropdownInputs[0] as LevelType,
              preparationType: result.dropdownWithGroupsInputs[0],
              text: result.textareaInputs[0],
            })
          : new Instruction({
              ...instruction,
              name: result.textInputs[0],
              note: result.textInputs[1],
              minTime: result.numberInputs[0] || null,
              maxTime: result.numberInputs[1] || null,
              temperature: result.numberInputs[2] || null,
              level: result.dropdownInputs[0] as LevelType,
              preparationType: result.dropdownWithGroupsInputs[0],
              text: result.textareaInputs[0],
            });

        if (result.actionAdd) {
          return newInstruction;
        } else if (result.actionApply && index !== undefined) {
          return newInstruction;
        } else if (result.actionDelete && index !== undefined) {
          return null;
        }

        return instruction;
      })
    );
  }

  openAddOrEditInstructionDetails(instruction: Instruction, add: boolean) {
    const data: DialogData = {
      title: add ? "INSTRUCTION.ADD" : "INSTRUCTION.EDIT",
      icons: ["preparation"],
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
      numberInputs: [
        {
          number: add ? null : instruction.minTime || null,
          icon: "time",
          placeholder: "TIME.MIN",
          suffixLong: "TIME.MINUTES",
          suffixShort: "TIME.MINUTES_SHORT",
          sliderMax: sliderMaxMinutes,
          sliderSteps: stepsMinutes,
          showSlider: true,
          hideSliderInitially: !this.isSmallScreen.matches,
          formatAsDuration: true,
        },
        {
          number: add ? null : instruction.maxTime || null,
          icon: "time",
          placeholder: "TIME.MAX",
          suffixLong: "TIME.MINUTES",
          suffixShort: "TIME.MINUTES_SHORT",
          sliderMax: sliderMaxMinutes,
          sliderSteps: stepsMinutes,
          showSlider: true,
          hideSliderInitially: !this.isSmallScreen.matches,
          formatAsDuration: true,
        },
        {
          number: add ? null : instruction.temperature || null,
          icon: "temperature",
          placeholder: "TEMPERATURE",
          suffixLong: "°C",
          suffixShort: "°C",
          max: maxTemperature,
          sliderSteps: stepsTemperature,
          showSlider: true,
          hideSliderInitially: !this.isSmallScreen.matches,
        },
      ],
      dropdownInputs: [
        {
          data: LEVELS,
          selectedKey: instruction?.level || LevelType.LEVEL_NONE,
          placeholder: "LEVEL",
        },
      ],
      dropdownWithGroupsInputs: [
        {
          data: PREPARATIONS,
          selectedKey: instruction?.preparationType || 0,
          placeholder: "PREPARATION.TYPE",
          noneText: "PREPARATION.NO",
          noneIcon: "preparationType-none",
          defaultText: "PREPARATION.CHOOSE",
          iconPrefix: "preparationType",
          findByType: findPreparationByType,
        },
      ],
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (!result) return instruction;

        const newInstruction: Instruction = new Instruction({
          ...instruction,
          minTime: result.numberInputs[0] || null,
          maxTime: result.numberInputs[1] || null,
          temperature: result.numberInputs[2] || null,
          level: result.dropdownInputs[0] as LevelType,
          preparationType: result.dropdownWithGroupsInputs[0],
        });

        if (result.actionAddOrApply) {
          return newInstruction;
        } else if (result.actionDelete) {
          return new Instruction({
            ...instruction,
            minTime: null,
            maxTime: null,
            temperature: null,
            level: LevelType.LEVEL_NONE,
            preparationType: PreparationType.NONE,
          });
        }

        return instruction;
      })
    );
  }
}
