import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "mediaLastEdited",
})
export class MediaLastEditedPipe implements PipeTransform {
  transform(editHistory: Date[]): boolean {
    if (!editHistory.length) return false;
    return editHistory[0].getTime() > new Date().getTime() - 1000;
  }
}
