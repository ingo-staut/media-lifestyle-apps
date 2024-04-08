import { Pipe, PipeTransform } from "@angular/core";
import { Instruction } from "../app/models/instruction.class";
import { Recipe } from "../app/models/recipe.class";

@Pipe({
  name: "fromWith",
})
export class FromWithPipe implements PipeTransform {
  transform(id: string, isRecipe: boolean, recipes: Recipe[], instructions: Instruction[]): string {
    if (isRecipe) return recipes.find((recipe) => recipe.id === id)?.name ?? "";
    return instructions[+id].name;
  }
}
