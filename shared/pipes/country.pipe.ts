import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { findLanguageIconByText, findLanguageTextByText } from "shared/data/language.data";
import { joinTextWithComma } from "shared/utils/string";

@Pipe({
  name: "allCountries",
})
export class AllCountriesPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    countries: string[],
    locale: string
  ): { icons: string[]; tooltip: string; moreCount: number } {
    const icons = countries.map((lang) => findLanguageIconByText(lang)).filter((icon) => !!icon);
    const tooltip =
      countries.length === 0
        ? "COUNTRY.NOT"
        : joinTextWithComma(
            countries.map((lang) =>
              this.translateService.instant(findLanguageTextByText(lang, true))
            ),
            this.translateService.instant("AND")
          );
    const moreCount = countries.length - icons.length;
    return { icons, tooltip, moreCount };
  }
}
