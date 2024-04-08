import { Pipe, PipeTransform } from "@angular/core";
import { UtensilObject, findObjectById } from "../app/models/utensil-object.class";
import { Utensil } from "../app/models/utensil.class";

@Pipe({
  name: "utensilIcon",
})
export class UtensilIconPipe implements PipeTransform {
  transform(utensil: Utensil, utensilObjects: UtensilObject[] | null): string {
    if (!utensilObjects) return "";
    const object = findObjectById(utensil.name, utensilObjects);
    return object ? "utensil-" + object.icon : "";
  }
}
