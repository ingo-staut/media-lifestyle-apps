import { Pipe, PipeTransform } from "@angular/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { Instruction } from "../app/models/instruction.class";
import { UtensilObject, findObjectById } from "../app/models/utensil-object.class";
import { Utensil } from "../app/models/utensil.class";

@Pipe({
  name: "utensil",
})
export class UtensilPipe implements PipeTransform {
  transform(utensil: Utensil, utensilObjects: UtensilObject[] | null) {
    if (!utensilObjects) return null;

    return findObjectById(utensil.name, utensilObjects);
  }
}

@Pipe({
  name: "utensilText",
})
export class UtensilTextPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    utensil: Utensil,
    utensilObjects: UtensilObject[] | null,
    langChangeEvent?: LangChangeEvent | null
  ): string {
    if (!utensilObjects) return "";

    const object = findObjectById(utensil.name, utensilObjects);
    return new Utensil(utensil).getUtensilString(object, this.translateService);
  }
}

@Pipe({
  name: "utensilsFromInstructions",
})
export class UtensilsFromInstructionsPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    instructions: (Instruction | null)[],
    utensilObjects: UtensilObject[] | null,
    langChangeEvent?: LangChangeEvent | null
  ) {
    if (!utensilObjects) return [];

    return cloneDeep(instructions)
      .map(
        (instruction, index) =>
          instruction?.utensils.map((utensil) => {
            const utensilObject = new Utensil(utensil);

            const object = findObjectById(utensil.name, utensilObjects ?? []);
            const str = new Utensil(utensil).getUtensilString(object, this.translateService);

            utensilObject.fromWithInstruction = [{ id: index.toString(), notes: [str] }];
            return utensilObject;
          }) ?? []
      )
      .flat();
  }
}
