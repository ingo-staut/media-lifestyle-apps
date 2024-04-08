import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: "app-check-icon",
  templateUrl: "./check-icon.component.html",
  styleUrls: ["./check-icon.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckIconComponent {
  @Input() show: boolean;
}
