import { Pipe, PipeTransform } from "@angular/core";
import { RATING_DATA } from "shared/data/rating.data";
import { RatingIndex } from "shared/models/enum/rating.enum";

@Pipe({
  name: "ratingSection",
})
export class RatingSectionPipe implements PipeTransform {
  transform(rating: number, index: RatingIndex): string {
    const { threshold_good, threshold_bad, icon_good, icon_medium, icon_bad, icon_default } =
      RATING_DATA.get(index)!;

    if (rating && rating > threshold_good) return icon_good;
    if (rating && rating <= threshold_good && rating > threshold_bad) return icon_medium;
    if (rating && rating <= threshold_bad) return icon_bad;
    return icon_default;
  }
}
