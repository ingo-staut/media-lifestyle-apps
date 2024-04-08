import { Pipe, PipeTransform } from "@angular/core";
import { Ingredient } from "../app/models/ingredient.class";

@Pipe({
  name: "hasAtLeastOneRecipe",
})
export class HasAtLeastOneRecipePipe implements PipeTransform {
  transform(ingredient: Ingredient): boolean {
    return new Ingredient(ingredient).hasAtLeastOneRecipe();
  }
}

@Pipe({
  name: "hasNotAtLeastOneRecipe",
})
export class HasNotAtLeastOneRecipePipe implements PipeTransform {
  transform(ingredient: Ingredient): boolean {
    return new Ingredient(ingredient).hasNotAtLeastOneRecipe();
  }
}

@Pipe({
  name: "hasNotOneRecipe",
})
export class HasNotOneRecipePipe implements PipeTransform {
  transform(ingredient: Ingredient): boolean {
    return new Ingredient(ingredient).hasNotOneRecipe();
  }
}

@Pipe({
  name: "hasAtLeastOneInstruction",
})
export class HasAtLeastOneInstructionPipe implements PipeTransform {
  transform(ingredient: Ingredient): boolean {
    return new Ingredient(ingredient).hasAtLeastOneInstruction();
  }
}

@Pipe({
  name: "hasNotAtLeastOneInstruction",
})
export class HasNotAtLeastOneInstructionPipe implements PipeTransform {
  transform(ingredient: Ingredient): boolean {
    return new Ingredient(ingredient).hasNotAtLeastOneInstruction();
  }
}

@Pipe({
  name: "hasNotOneInstruction",
})
export class HasNotOneInstructionPipe implements PipeTransform {
  transform(ingredient: Ingredient): boolean {
    return new Ingredient(ingredient).hasNotOneRecipe();
  }
}
