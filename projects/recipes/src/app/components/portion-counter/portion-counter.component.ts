import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { MenuDialogData } from "../../bottom-sheets/menu-bottom-sheet/menu-bottom-sheet.component";
import { MenuBottomSheetService } from "../../bottom-sheets/menu-bottom-sheet/menu-bottom-sheet.service";

@Component({
  selector:
    "app-portion-counter[amount][amountFactor][amountTextFromRecipe][amountNumberFromRecipe][portions]",
  templateUrl: "./portion-counter.component.html",
  styleUrls: ["./portion-counter.component.scss"],
})
export class PortionCounterComponent {
  @Input() amount: number = 1;
  @Input() amountFactor: number = 1;
  @Input() amountTextFromRecipe: string = "";
  @Input() amountNumberFromRecipe: number = 1;
  @Input() portions: number = 1;

  @Output() amountFactorChange = new EventEmitter<number>();

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(
    private translateService: TranslateService,
    private menuBottomSheetService: MenuBottomSheetService,
    protected localeService: LocaleService
  ) {}

  onAmountDown() {
    if (this.amount <= 1) {
      this.amount = this.amount / 2;
    } else {
      this.amount--;
    }

    this.recalculateFraction();
  }

  onAmountUp() {
    if (this.amount <= 1) {
      this.amount = this.amount * 2;
    } else {
      this.amount++;
    }

    this.recalculateFraction();
  }

  onAmountValue(value: number) {
    this.amount = this.amountNumberFromRecipe * value;
    this.recalculateFraction();
  }

  onAmountReset() {
    this.amount = this.amountNumberFromRecipe;
    this.recalculateFraction();
  }

  recalculateFraction() {
    this.amountFactor = this.amount / this.amountNumberFromRecipe;

    this.amountFactorChange.emit(this.amountFactor);
  }

  onPortionMenu(text: string) {
    if (!this.isSmallScreen.matches) return;

    const data: MenuDialogData<string> = {
      actions: [
        {
          value: "",
          icon: "portion",
          text: text,
          groupKey: "portion",
        },
        {
          value: "half",
          icon: "portion",
          text: "½ " + this.translateService.instant("PORTION."),
          highlight: this.amountFactor === 0.5,
        },
        {
          value: "quarter",
          icon: "portion",
          text: "¼ " + this.translateService.instant("PORTION."),
          highlight: this.amountFactor === 0.25,
        },
        {
          value: "double",
          icon: "portion",
          text: "x2 " + this.translateService.instant("PORTION."),
          highlight: this.amountFactor === 2,
        },
        {
          value: "reset",
          icon: "reset",
          text: "RESET",
          groupKey: "reset",
          hide: this.amountFactor === 1,
        },
      ],
    };

    this.menuBottomSheetService.open<string>(data).subscribe((data) => {
      if (!data) return;

      switch (data.value) {
        case "half":
          this.onAmountValue(0.5);
          break;
        case "quarter":
          this.onAmountValue(0.25);
          break;
        case "double":
          this.onAmountValue(2);
          break;
        case "reset":
          this.onAmountReset();
          break;

        default:
          break;
      }
    });
  }
}
