import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "required",
})
export class FormfieldRequiredPipe implements PipeTransform {
  transform(value: string, required: boolean): string {
    return `${value}${required ? "*" : ""}`;
  }
}
