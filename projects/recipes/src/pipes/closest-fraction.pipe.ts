import { Pipe, PipeTransform } from "@angular/core";
import { getDigitAsString } from "shared/utils/string";
import { getClosestFraction } from "../app/models/ingredient.class";

@Pipe({
  name: "closestFraction",
})
export class ClosestFractionPipe implements PipeTransform {
  transform(floatingNumber: number): [number, number] {
    return getClosestFraction(floatingNumber);
  }
}

@Pipe({
  name: "fractionAsString",
})
export class FractionAsStringPipe implements PipeTransform {
  transform(floatingNumber: [number, number], locale: string): string {
    return getDigitAsString(floatingNumber[0] / floatingNumber[1], locale);
  }
}

@Pipe({
  name: "decimalWithFraction",
})
export class DecimalWithFractionPipe implements PipeTransform {
  transform(number: number, locale: string): string {
    return getDigitAsString(number, locale);
  }
}
