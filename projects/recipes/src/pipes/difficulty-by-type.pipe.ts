import { Pipe, PipeTransform } from "@angular/core";
import { Entry } from "shared/models/type-entry.type";
import { DifficultyType, findDifficultyByType } from "../app/models/enum/difficulty.enum";

@Pipe({
  name: "difficultyByType",
})
export class DifficultyByTypePipe implements PipeTransform {
  transform(type: DifficultyType): Entry<DifficultyType> {
    return findDifficultyByType(type);
  }
}
