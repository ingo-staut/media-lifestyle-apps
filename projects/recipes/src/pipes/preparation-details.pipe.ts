import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DateFns } from "shared/utils/date-fns";
import { LEVELS } from "../app/data/level.data";
import { LevelType } from "../app/models/enum/level.enum";
import { PreparationType, findPreparationByType } from "../app/models/enum/preparation.enum";
import { Instruction } from "../app/models/instruction.class";

@Pipe({
  name: "preparationDetails",
})
export class PreparationDetailsPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    value: Instruction,
    locale: string,
    defaultText?: string,
    withoutType?: boolean,
    short?: boolean
  ): string {
    const { minTime, maxTime, temperature, preparationType, level } = value;
    const texts = [];

    // Zeit
    texts.push(DateFns.formatDurationRange({ min: minTime ?? 0, max: maxTime ?? 0 }, locale));

    // Temperatur
    if (temperature && !short) texts.push(temperature + "°C");

    // Typ
    const type = findPreparationByType(preparationType!);
    if (!withoutType && !short && type.type !== PreparationType.NONE)
      texts.push(this.translateService.instant(type.name));

    // Stufe
    const level_found = LEVELS.find((l) => (l.key as unknown as LevelType) === level);
    if (level_found && !short) {
      texts.push(
        level !== LevelType.LEVEL_NONE
          ? this.translateService.instant("LEVEL") + " " + level_found.name
          : ""
      );
    }

    const text = texts
      .filter((t) => t)
      .join(", ")
      .trim();

    return text === "" ? (defaultText ? this.translateService.instant(defaultText) : "") : text;
  }
}

@Pipe({
  name: "preparationIcon",
})
export class PreparationIcon implements PipeTransform {
  transform(value: Instruction): string {
    if (!value.preparationType) return "time";
    const type = findPreparationByType(value.preparationType);
    if (type.type! > 0) return type.icon;
    return "time";
  }
}
