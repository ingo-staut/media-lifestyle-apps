import { CurrencyPipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import { DateFns } from "shared/utils/date-fns";

@Pipe({
  name: "price",
})
export class PricePipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: number, locale: string): string | null {
    return this.currencyPipe.transform(
      value,
      "EUR",
      undefined,
      "1.2-2",
      DateFns.getCompleteLocale(locale)
    );
  }
}
