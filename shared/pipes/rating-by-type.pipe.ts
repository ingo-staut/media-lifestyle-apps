import { Pipe, PipeTransform } from "@angular/core";
import { Entry } from "shared/models/type-entry.type";
import { RatingType, findRatingByType } from "../models/enum/rating.enum";

@Pipe({
  name: "ratingByType",
})
export class RatingByTypePipe implements PipeTransform {
  transform(type: RatingType): Entry<RatingType> {
    return findRatingByType(type);
  }
}
