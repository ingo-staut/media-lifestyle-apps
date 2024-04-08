import { Component, Input } from "@angular/core";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";

@Component({
  selector: "app-tab-badge",
  templateUrl: "./tab-badge.component.html",
  styleUrls: ["./tab-badge.component.scss"],
})
export class TabBadgeComponent {
  @Input() text: string;
  @Input() icon: string;
  @Input() count: number;
  @Input() showBadge: boolean = true;

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
}
