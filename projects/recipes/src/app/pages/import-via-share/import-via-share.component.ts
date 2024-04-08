import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { getRecipe } from "projects/recipes/src/utils/recipe-import/recipe.import.json";
import { extractRecipeTitleOfText } from "projects/recipes/src/utils/string";
import { Subject, takeUntil } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { Url } from "shared/models/url.class";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { isValidHttpUrl } from "shared/utils/url";
import { RecipeDialogService } from "../../dialogs/recipe-dialog/recipe-dialog.service";
import { findCategoryInTitle } from "../../models/enum/category.enum";
import { Recipe } from "../../models/recipe.class";
import { RequestService } from "../../services/request.service";
import { UtensilObjectApiService } from "../../services/utensil-object/utensil-object.api.service";

@Component({
  selector: "app-import-via-share",
  templateUrl: "./import-via-share.component.html",
  styleUrls: ["./import-via-share.component.scss"],
})
export class ImportViaShareComponent implements OnInit, OnDestroy {
  private readonly destroySubject = new Subject<void>();

  result = "";
  title = "";
  text = "";
  url = "";

  constructor(
    @Inject(Router) private router: Router,
    @Inject(ActivatedRoute) private activeRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private recipeDialogService: RecipeDialogService,
    private requestService: RequestService,
    private utensilObjectApiService: UtensilObjectApiService,
    protected localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.activeRoute.queryParams.pipe(takeUntil(this.destroySubject)).subscribe(async (params) => {
      const url = this.getUrlFromParams(params);

      if (!url) {
        this.notificationService.show(NotificationTemplateType.NO_URL_FOUND);
        return;
      }

      this.result = url;

      const name = extractRecipeTitleOfText(this.title);
      const data = await this.requestService.requestUrl(url);

      const recipe = getRecipe(data, url, this.utensilObjectApiService.utensilObjectsSnapshot);

      if (!recipe) {
        this.notificationService.show(NotificationTemplateType.QUICKADD_NOTHING_FOUND);

        const urls: Url[] = [new Url({ url })];
        const { category, amountText } = findCategoryInTitle(this.title) ?? {};
        const recipe = new Recipe({ name, urls, category, amountText });

        this.recipeDialogService.openAndReloadDataAndAfterClose(recipe).subscribe(() => {
          this.onNavigateToStart();
        });

        return;
      }

      this.recipeDialogService.openAndReloadDataAndAfterClose(recipe).subscribe(() => {
        this.onNavigateToStart();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onNavigateToStart() {
    this.router.navigate(["/recipes"]);
  }

  getUrlFromParams(params: Params) {
    const title = params["title"] as string;
    const text = params["text"] as string;
    const url = params["url"] as string;

    this.title = title;
    this.text = text;
    this.url = url;

    if (url && isValidHttpUrl(url)) return url;
    if (text && isValidHttpUrl(url)) return text;
    if (title && isValidHttpUrl(url)) return title;
    if (url) return url;
    if (text) return text;
    if (title) return title;

    return null;
  }
}
