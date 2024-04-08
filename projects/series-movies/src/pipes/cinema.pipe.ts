import { Pipe, PipeTransform } from "@angular/core";
import { Media } from "../app/models/media.class";

@Pipe({
  name: "cinema",
})
export class CinemaPipe implements PipeTransform {
  transform(media: Media, dateStr: string, priceStr: string): string {
    if (!media.cinema) return "";

    const separator = " – ";
    const note = media.cinema.note ? separator + media.cinema.note : "";

    return media.cinema.building + separator + dateStr + separator + priceStr + note;
  }
}
