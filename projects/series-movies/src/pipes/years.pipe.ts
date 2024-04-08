import { Pipe, PipeTransform } from "@angular/core";
import { Media } from "../app/models/media.class";

@Pipe({
  name: "years",
})
export class YearsPipe implements PipeTransform {
  transform(media: Media): string {
    if (!media.yearStart && !media.yearEnd) return "";
    if (media.isMovie && media.yearStart) return media.yearStart.toString();
    if (media.isMovie && !media.yearStart) return "";
    if (media.yearStart === media.yearEnd) return media.yearStart.toString();
    return `${media.yearStart}–${media.yearEnd || ""}`;
  }
}
