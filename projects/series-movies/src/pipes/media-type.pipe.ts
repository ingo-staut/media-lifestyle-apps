import { Pipe, PipeTransform } from "@angular/core";
import { MediaEnum } from "../../../../shared/models/enum/media.enum";
import { getMediaTypeDetailsByTypeWithDefaultValue } from "../app/data/media-type.data";
import { MediaType } from "../app/models/media.type";

@Pipe({
  name: "mediaType",
})
export class MediaTypePipe implements PipeTransform {
  transform(type: MediaEnum): MediaType {
    return getMediaTypeDetailsByTypeWithDefaultValue(type);
  }
}
