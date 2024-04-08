import { Pipe, PipeTransform } from "@angular/core";
import { Instruction } from "../app/models/instruction.class";

@Pipe({
  name: "instructionById",
})
export class InstructionByIdPipe implements PipeTransform {
  transform(id: string, instructions: Instruction[]): Instruction {
    return instructions[+id];
  }
}
