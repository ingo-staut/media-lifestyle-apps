import { Component, Input } from "@angular/core";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Purchase } from "../../models/purchase.class";
import { Store } from "../../models/store.type";

@Component({
  selector: "app-purchase-statistics[purchases]",
  templateUrl: "./purchase-statistics.component.html",
  styleUrls: ["./purchase-statistics.component.scss"],
})
export class PurchaseStatisticsComponent {
  @Input() purchases?: Purchase[] | null;
  @Input() ingredientsConversion?: IngredientConversion[] | null;
  @Input() stores?: Store[] | null;
  @Input() itemType?: ItemType;

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  ItemType = ItemType;

  today = new Date();
  lastMonth = DateFns.addMonthsToDate(this.today, -1);

  currentMonthFirstDay = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  lastMonthFirstDay = new Date(this.lastMonth.getFullYear(), this.lastMonth.getMonth(), 1);
  lastMonthLastDay = DateFns.lastDayOfMonth(this.lastMonth);

  get lastMonthSameDayAsToday(): Date {
    const sameDayLastMonth = new Date(
      this.lastMonth.getFullYear(),
      this.lastMonth.getMonth(),
      this.today.getDate()
    );

    // Overflow
    if (sameDayLastMonth.getMonth() === this.today.getMonth()) {
      // Februar
      if (this.lastMonth.getMonth() === 2) {
        return new Date(this.lastMonth.getFullYear(), this.lastMonth.getMonth(), 28);
      }

      return new Date(
        this.lastMonth.getFullYear(),
        this.lastMonth.getMonth(),
        this.today.getDate() - 1
      );
    }

    return sameDayLastMonth;
  }

  constructor(protected localeService: LocaleService) {}
}
