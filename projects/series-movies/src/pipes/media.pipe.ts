import { Pipe, PipeTransform } from "@angular/core";
import { Media } from "../app/models/media.class";

@Pipe({
  name: "mediaById",
})
export class MediaByIdPipe implements PipeTransform {
  transform(id: string, media: Media[] | null): Media | undefined {
    if (!media) return undefined;

    return media.find((m) => m.id === id);
  }
}
