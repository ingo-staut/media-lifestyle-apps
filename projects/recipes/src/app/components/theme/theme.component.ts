import { Component, OnInit } from "@angular/core";
import { Theme, getCurrentTheme } from "../../../../../../shared/models/theme.type";

@Component({
  selector: "app-theme",
  templateUrl: "./theme.component.html",
  styleUrls: ["./theme.component.scss"],
})
export class ThemeComponent implements OnInit {
  theme?: Theme;

  ngOnInit(): void {
    // Theme finden am heutigen Tag
    this.theme = getCurrentTheme(new Date());
  }
}
