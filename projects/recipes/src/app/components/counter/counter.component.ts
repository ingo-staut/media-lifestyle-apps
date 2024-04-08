import { Component, Input } from "@angular/core";
import { LocaleService } from "shared/services/locale.service";

@Component({
  selector: "app-counter",
  templateUrl: "./counter.component.html",
  styleUrls: ["./counter.component.scss"],
})
export class CounterComponent {
  @Input() value: number;
  @Input() currency: boolean;
  @Input() fontSize: number;

  constructor(protected localeService: LocaleService) {}

  get number() {
    const numStr: string = this.value.toString();
    const [integerPart, decimalPart] = numStr.split(".");
    const digits = parseInt(integerPart);
    const decimal = parseInt(decimalPart?.length > 2 ? decimalPart.substring(0, 2) : decimalPart);

    return { digits, decimal };
  }
}
