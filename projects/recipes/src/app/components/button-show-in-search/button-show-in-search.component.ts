import { Component, Input } from "@angular/core";
import { ShowInSearchKey } from "../../models/show-in-search.enum";
import { SearchFilterService } from "../../pages/search/search.filter.service";
import { RoutingService } from "../../services/routing.service";

@Component({
  selector: "app-button-show-in-search [key]",
  templateUrl: "./button-show-in-search.component.html",
  styleUrls: ["./button-show-in-search.component.scss"],
})
export class ButtonShowInSearchComponent {
  @Input() key: ShowInSearchKey;
  @Input() valueReplace?: string;
  @Input() marginRightPx: number;

  readonly searchUrl = "/search?";

  constructor(
    private routingService: RoutingService,
    private searchFilterService: SearchFilterService
  ) {}

  click() {
    this.searchFilterService.removeAllFilters();

    switch (this.key) {
      case "VEGAN_DESSERTS":
        this.routingService.navigateToUrl(
          this.searchUrl +
            "categories=11,12,13,14,18,19&contents=vegan&ingredient-quantity=1:min:hideNullValues&sort=rating"
        );
        break;
      case "VEGAN_MAIN_RECIPES":
        this.routingService.navigateToUrl(
          this.searchUrl +
            "categories=5,6,7,8,9,10,20&contents=vegan&ingredient-quantity=1:min:hideNullValues&sort=rating"
        );
        break;
      case "QUICK_DESSERTS":
        this.routingService.navigateToUrl(
          this.searchUrl +
            "categories=11,12,13,14,18,19&preparation-time=20:max:hideNullValues&sort=preparation-time"
        );
        break;
      case "QUICK_PRE_OR_MAIN":
        this.routingService.navigateToUrl(
          this.searchUrl +
            "categories=1,2,3,4,5,6,7,8,9,10,20&preparation-time=20:max:hideNullValues&sort=preparation-time"
        );
        break;
      case "CHEAP_DESSERTS":
        this.routingService.navigateToUrl(
          this.searchUrl + "categories=11,12,13,14,18,19&costs=5:max:hideNullValues&sort=costs"
        );
        break;
      case "CHEAP_PRE_OR_MAIN":
        this.routingService.navigateToUrl(
          this.searchUrl +
            "categories=1,2,3,4,5,6,7,8,9,10,20&costs=5:max:hideNullValues&sort=costs"
        );
        break;
      case "LAST_EDITED_VALUE":
        const params = `edited-dates=${
          this.valueReplace === "0"
            ? "today"
            : this.valueReplace === "1"
            ? "yesterday"
            : this.valueReplace
            ? "previous-days:" + this.valueReplace
            : "today"
        }`;
        this.routingService.navigateToUrl(this.searchUrl + params);
        break;

      default:
        break;
    }
  }
}
