import { Clipboard } from "@angular/cdk/clipboard";
import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { MediaEnum } from "shared/models/enum/media.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { Url } from "shared/models/url.class";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { UrlService } from "shared/services/url.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { URL_FAVICON } from "shared/utils/url";
import { newsCategoryById } from "../../data/news-category.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { Media } from "../../models/media.class";
import { News } from "../../models/news.class";
import { ChannelApiService } from "../../services/channel.api.service";
import { MediaApiService } from "../../services/media.api.service";
import { NewsSettingsApiService } from "../../services/news-settings.api.service";

@Component({
  selector: "app-news-chip",
  templateUrl: "./news-chip.component.html",
  styleUrls: ["./news-chip.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsChipComponent {
  @Input() news: News;
  @Input() showCategory: boolean = false;

  URL_FAVICON = URL_FAVICON;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  MediaEnum = MediaEnum;
  onChipHovered: boolean = false;
  today = new Date();

  constructor(
    private urlService: UrlService,
    private newsSettingsApiService: NewsSettingsApiService,
    private mediaDialogService: MediaDialogService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private datePipe: DatePipe,
    private clipboard: Clipboard,
    private notificationService: NotificationService,
    protected localeService: LocaleService,
    protected mediaApiService: MediaApiService,
    protected channelApiService: ChannelApiService
  ) {}

  onOpenUrl(event: MouseEvent, url?: string) {
    this.urlService.openOrCopyUrl({ event, url });
  }

  onSourceNewsWebsite(event: MouseEvent, url: string) {
    this.urlService.openOrCopyUrl({ event, url });
  }

  onRead(event: MouseEvent) {
    event.stopPropagation();

    this.newsSettingsApiService.read([this.news.id]);
  }

  onHideTerm(event: MouseEvent) {
    event.stopPropagation();

    const data: DialogData = {
      title: "NEWS.HIDE",
      icons: ["hide"],
      textInputs: [
        {
          text: "",
          placeholder: "TERM.S",
          icon: "rename",
          hint: "SPLIT_MULTIPLE_WITH_SEMICOLON",
          required: true,
        },
      ],
      actionPrimary: ActionKey.ADD,
    };

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      if (result.actionAdd && result.textInputs[0].trim() !== "") {
        this.newsSettingsApiService.hideTerms(
          result.textInputs[0]
            .trim()
            .split(";")
            .map((t) => t.trim())
        );
      }
    });
  }

  onInformation(event: Event) {
    event.stopPropagation();

    console.log(this.news.sourceUrl);

    const html_lineBreak = "<br />";
    const before = "<span class='text-color-1'>";
    const after = "</span>";
    const text =
      before +
      "ID" +
      ": " +
      after +
      this.news.id +
      html_lineBreak +
      before +
      this.translateService.instant("URL.SOURCE") +
      ": " +
      after +
      "<a href='" +
      this.news.sourceUrl +
      "'>" +
      this.news.sourceUrl +
      "</a>" +
      html_lineBreak +
      before +
      this.translateService.instant("DATE.") +
      ": " +
      after +
      this.datePipe.transform(this.news.date, "shortDate", "", this.translateService.currentLang) +
      html_lineBreak +
      before +
      this.translateService.instant("CATEGORY.") +
      ": " +
      after +
      this.translateService.instant(newsCategoryById(this.news.category)?.name ?? "NEWS.S") +
      (this.news.categorySub ? " (" + this.news.categorySub + ")" : "");

    const data: DialogData = {
      title: "INFORMATION.S",
      text,
      textCssClassList: "text-ellipsis",
      icons: ["info"],
      actionPrimary: false,
      actionClose: true,
      actions: [
        {
          key: "copy-id",
          text: this.isSmallScreen.matches ? "ID" : "CLIPBOARD.COPY.ID",
          icon: "copy",
        },
        { key: "open-url", text: "URL.OPEN", icon: "open" },
      ],
    };

    this.dialogService.open(data).subscribe((result) => {
      if (!result) return;

      if (result.actionKey === "copy-id") {
        this.clipboard.copy(this.news.id);
        this.notificationService.show(NotificationTemplateType.SAVED_TO_CLIPBOARD);
      } else if (result.actionKey === "open-url") {
        this.urlService.openOrCopyUrl({ url: this.news.sourceUrl });
      }
    });
  }

  onMediaMenuItemClicked(value: string, media: Media, event?: MouseEvent) {
    event?.stopPropagation();

    switch (value) {
      case "open":
        this.mediaDialogService.openAndReloadData(media);
        break;
      case "quick-add":
        media.urlsInfo.push(
          new Url({ url: this.news.url, language: this.news.language, type: UrlType.NEWS })
        );
        this.mediaApiService.saveAndReloadMedia(media);
        this.newsSettingsApiService.read([this.news.id]);
        break;
      case "add-info-url":
        media.urlsInfo.push(
          new Url({ url: this.news.url, language: this.news.language, type: UrlType.NEWS })
        );
        this.mediaApiService.saveAndReloadMedia(media);
        break;
      case "hide-from-news":
        media.hideFromNews = true;
        this.mediaApiService.saveAndReloadMedia(media);
        break;

      default:
        break;
    }
  }

  onSuggestionMediaItemClicked(
    value: { id: string; url?: string },
    mediaSuggestion: { name: string; type: MediaEnum },
    event?: MouseEvent
  ) {
    event?.stopPropagation();

    switch (value.id) {
      case "add":
        this.onAddMedia(event, mediaSuggestion.name, mediaSuggestion.type);
        break;
      case "search":
        this.urlService.openOrCopyUrl({ url: value.url });
        break;

      default:
        break;
    }
  }

  openMenu(media: Media) {
    this.mediaDialogService.openAndReloadData(media);
  }

  onAddMedia(event: Event | undefined, name: string, type: MediaEnum) {
    event?.stopPropagation();

    this.mediaDialogService.openAndReloadData(new Media({ id: "", name, type }), {
      triggerQuickAdd: true,
    });
  }
}
