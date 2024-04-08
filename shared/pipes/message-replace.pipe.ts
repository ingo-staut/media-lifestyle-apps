import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "messageReplaceIsString",
})
export class MessageReplaceIsStringPipe implements PipeTransform {
  transform(value: any): boolean {
    return typeof value === "string";
  }
}
