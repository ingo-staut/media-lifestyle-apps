import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class PageTitleStrategyService extends TitleStrategy {
  constructor(private translateService: TranslateService, private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title) {
      this.title.setTitle(this.translateService.instant(title));

      this.translateService.onLangChange.subscribe(() => {
        this.title.setTitle(this.translateService.instant(title));
      });
    } else {
      this.title.setTitle(this.translateService.instant("DEFAULT_TITLE"));
    }
  }
}
