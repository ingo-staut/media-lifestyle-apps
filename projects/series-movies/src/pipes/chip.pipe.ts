import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DropdownData } from "shared/models/dropdown.type";
import { DateFns } from "shared/utils/date-fns";
import { firstCharToTitleCase, getPriceOfString } from "shared/utils/string";

@Pipe({
  name: "chip",
})
export class ChipPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(text: string): {
    text: string;
    icon?: string;
    image?: string;
    emoji?: string;
    dropdown?: DropdownData<string, string>[];
    selectedKey?: string;
  } {
    if (!text) return { text };

    const date = DateFns.getDateOfString(text, this.translateService);
    if (date)
      return {
        text: DateFns.formatDateShort(date, this.translateService.currentLang),
        icon: "calendar",
      };

    const duration = DateFns.getDurationRangeOfString(text);
    if (duration)
      return {
        text: DateFns.formatDurationRange(duration, this.translateService.currentLang),
        icon: "time",
      };

    const price = getPriceOfString(text);
    if (price)
      return {
        text: `${price} €`,
        icon: "money",
      };

    return { text: firstCharToTitleCase(text) };
  }
}
