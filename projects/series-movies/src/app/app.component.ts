import { Component, Inject } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { SwUpdate, VersionReadyEvent } from "@angular/service-worker";
import { TranslateService } from "@ngx-translate/core";
import { filter } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { Icon } from "shared/models/icon";
import { NotificationService } from "shared/services/notification.service";
import { SearchEngineApiService } from "shared/services/search-engine/search-engine.api.service";
import { VersionService } from "shared/services/version.service";
import { DB_ID, DatabaseService } from "../../../../shared/services/database.service";
import json from "../version.json";
import { NotificationComponent } from "./components/notification/notification.component";
import { MediaDialogService } from "./dialogs/media-dialog/media-dialog.service";
import { ChannelApiService } from "./services/channel.api.service";
import { MediaApiService } from "./services/media.api.service";
import { NewsSettingsApiService } from "./services/news-settings.api.service";
import { OpenUrlOnDeviceApiService } from "./services/open-url.api.service";
import { SettingsApiService } from "./services/settings.api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  iconsUrl = "../../../assets/icons/";
  iconCalendarUrl = this.iconsUrl + "calendar/";
  iconRatingsUrl = this.iconsUrl + "rating/";
  iconI18nUrl = this.iconsUrl + "i18n/";
  iconThemeUrl = this.iconsUrl + "theme/";
  iconGenreUrl = this.iconsUrl + "genres/";

  icons: Icon[] = [
    { name: "app-favicon" },
    { name: "app-icon" },
    { name: "app-recipes-favicon" },
    { name: "app-recipes-icon" },
    { name: "arrow-down" },
    { name: "arrow-up" },
    { name: "arrow-left" },
    { name: "arrow-right" },
    { name: "arrow-multiple-down" },
    { name: "arrow-multiple-up" },
    { name: "arrow-multiple-left" },
    { name: "arrow-multiple-right" },
    { name: "arrow-single-down" },
    { name: "arrow-single-up" },
    { name: "arrow-single-left" },
    { name: "arrow-single-right" },
    { name: "count-up" },
    { name: "count-down" },
    { name: "series" },
    { name: "movie" },
    { name: "status" },
    { name: "status-choose" },
    { name: "old-but-gold" },
    { name: "open" },
    { name: "more" },
    { name: "statistics" },
    { name: "media" },
    { name: "play" },
    { name: "play-thin-lines" },
    { name: "clipboard" },
    { name: "home" },
    { name: "menu" },
    { name: "settings" },
    { name: "history" },
    { name: "copyright" },
    { name: "screen" },
    { name: "keymap" },
    { name: "top" },
    { name: "globe" },
    { name: "globe-not" },
    { name: "country" },
    { name: "country-not" },
    { name: "language" },
    { name: "language-not" },
    { name: "database" },
    { name: "import" },
    { name: "download" },
    { name: "copy" },
    { name: "api" },
    { name: "testing" },
    { name: "help" },
    { name: "replace" },
    { name: "timer" },
    { name: "upload" },
    { name: "search-engine" },
    { name: "database" },
    { name: "search" },
    { name: "search-again" },
    { name: "search-show-in" },
    { name: "sort-search-result" },
    { name: "sort-direction-desc" },
    { name: "sort-direction-asc" },
    { name: "filter" },
    { name: "filter-not" },
    { name: "grid" },
    { name: "list" },
    { name: "playlist" },
    { name: "alphabet" },
    { name: "min" },
    { name: "max" },
    { name: "remove-from" },
    { name: "add" },
    { name: "added" },
    { name: "add-to" },
    { name: "add-to-text" },
    { name: "add-and-replace" },
    { name: "quick-add" },
    { name: "quick-add-not" },
    { name: "quick-add-reset" },
    { name: "stream" },
    { name: "stream-not" },
    { name: "television-stream" },
    { name: "continue-watching" },
    { name: "edit" },
    { name: "random" },
    { name: "explore" },
    { name: "explore-not" },
    { name: "check" },
    { name: "dvd" },
    { name: "dvd-not" },
    { name: "dvd-filled" },
    { name: "info" },
    { name: "info-not" },
    { name: "error" },
    { name: "favorite" },
    { name: "favorite-not" },
    { name: "favorite-filled" },
    { name: "pause" },
    { name: "pause-circle" },
    { name: "note" },
    { name: "note-not" },
    { name: "note-filled" },
    { name: "rename" },
    { name: "share" },
    { name: "clear" },
    { name: "reset" },
    { name: "delete" },
    { name: "delete-not" },
    { name: "move" },
    { name: "drag" },
    { name: "time" },
    { name: "time-not" },
    { name: "time-choose" },
    { name: "show" },
    { name: "hide" },
    { name: "load" },
    { name: "reload" },
    { name: "notification" },
    { name: "link" },
    { name: "unlink" },
    { name: "money" },
    { name: "cinema" },
    { name: "channel" },
    { name: "channel-not" },
    { name: "television-program" },
    { name: "television-cinema" },
    { name: "television" },
    { name: "television-not" },
    { name: "television-filled" },
    { name: "television-missed" },
    { name: "episode-in-television" },
    { name: "episodes-in-television" },
    { name: "episodes-in-television-filled" },
    { name: "episode-details" },
    { name: "episode-details-not" },
    { name: "episode-details-filled" },
    { name: "episode-next" },
    { name: "scroll-to" },
    { name: "live" },
    { name: "live-not" },
    { name: "once" },
    { name: "last-edited" },
    { name: "idea" },
    { name: "critic-review" },
    { name: "intro" },
    { name: "trailer" },
    { name: "video" },
    { name: "video-not" },
    { name: "tag" },
    { name: "tag-not" },
    { name: "tag-filled" },
    { name: "tagline" },
    { name: "tagline-not" },
    { name: "tagline-filled" },
    { name: "url" },
    { name: "url-not" },
    { name: "open-url-on-device" },
    { name: "image" },
    { name: "image-not" },
    { name: "image-filled" },
    { name: "consecutive-numbering" },
    { name: "numbering-per-season" },
    { name: "automatic" },
    { name: "automatic-not" },
    { name: "watched" },
    { name: "watch" },
    { name: "watch-not" },
    { name: "watch-half" },
    { name: "watch-filled" },
    { name: "series-end" },
    { name: "season" },
    { name: "season-not" },
    { name: "special" },
    { name: "special-not" },
    { name: "special-filled" },
    { name: "season-finale" },
    { name: "season-new" },
    { name: "season-wrap" },
    { name: "season-nowrap" },
    { name: "imdb" },
    { name: "imdb-not" },
    { name: "imdb-filled" },
    { name: "imdb-color" },
    { name: "metascore" },
    { name: "metascore-not" },
    { name: "metascore-filled" },
    { name: "metascore-color" },
    { name: "lgbtq" },
    { name: "news" },
    { name: "news-not" },
    { name: "details" },
    { name: "dwdl" },
    { name: "dlf-kultur" },
    { name: "moviepilot" },
    { name: "filmstarts" },
    { name: "kino-de" },
    { name: "serienjunkies" },
    { name: "collider" },
    { name: "kino-plus" },
    { name: "reddit" },
    { name: "fred-carpet" },
    { name: "filmpalaver" },
    { name: "csb" },
    { name: "taste-io" },
    { name: "google" },
    { name: "youtube" },
    { name: "tiktok" },
    { name: "person" },
    { name: "de", url: this.iconI18nUrl, prefix: "language-" },
    { name: "en", url: this.iconI18nUrl, prefix: "language-" },
    { name: "fr", url: this.iconI18nUrl, prefix: "language-" },
    { name: "es", url: this.iconI18nUrl, prefix: "language-" },
    { name: "us", url: this.iconI18nUrl, prefix: "language-" },
    { name: "ja", url: this.iconI18nUrl, prefix: "language-" },
    { name: "it", url: this.iconI18nUrl, prefix: "language-" },
    { name: "ko", url: this.iconI18nUrl, prefix: "language-" },
    { name: "sv", url: this.iconI18nUrl, prefix: "language-" },
    { name: "pride-flag", url: this.iconThemeUrl, prefix: "theme-" },
    { name: "christmas", url: this.iconThemeUrl, prefix: "theme-" },
    { name: "calendar", url: this.iconCalendarUrl },
    { name: "calendar-days", url: this.iconCalendarUrl },
    { name: "calendar-missed", url: this.iconCalendarUrl },
    { name: "calendar-today", url: this.iconCalendarUrl },
    { name: "calendar-tomorrow", url: this.iconCalendarUrl },
    { name: "calendar-yesterday", url: this.iconCalendarUrl },
    { name: "calendar-choose", url: this.iconCalendarUrl },
    { name: "calendar-range", url: this.iconCalendarUrl },
    { name: "calendar-not", url: this.iconCalendarUrl },
    { name: "calendar-checked", url: this.iconCalendarUrl },
    { name: "calendar-until", url: this.iconCalendarUrl },
    { name: "calendar-3-days", url: this.iconCalendarUrl },
    { name: "calendar-week", url: this.iconCalendarUrl },
    { name: "calendar-month", url: this.iconCalendarUrl },
    { name: "calendar-future", url: this.iconCalendarUrl },
    { name: "calendar-past", url: this.iconCalendarUrl },
    { name: "calendar-start", url: this.iconCalendarUrl },
    { name: "calendar-start-filled", url: this.iconCalendarUrl },
    { name: "calendar-end", url: this.iconCalendarUrl },
    { name: "calendar-end-filled", url: this.iconCalendarUrl },
    { name: "rating", url: this.iconRatingsUrl },
    { name: "rating-not", url: this.iconRatingsUrl },
    { name: "rating-half", url: this.iconRatingsUrl },
    { name: "rating-full", url: this.iconRatingsUrl },
    { name: "action", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "adventure", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "animation", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "anime", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "comedy", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "cooking-show", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "documentary", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "drama", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "fantasy", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "gaming", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "horror", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "lgbtq", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "news", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "podcast", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "politics", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "quiz", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "romance", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "scifi", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "sport", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "spy", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "talkshow", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "mystery", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "thriller", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "teenie", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "crime", url: this.iconGenreUrl, prefix: "genre-" },
    { name: "tv-show", url: this.iconGenreUrl, prefix: "genre-" },
  ];

  constructor(
    @Inject(DomSanitizer) private domSanitizer: DomSanitizer,
    @Inject(SwUpdate) private swUpdate: SwUpdate,
    private matIconRegistry: MatIconRegistry,
    private mediaApiService: MediaApiService,
    private channelApiService: ChannelApiService,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private versionService: VersionService,
    private searchEngineService: SearchEngineApiService,
    private settingsApiService: SettingsApiService,
    private databaseService: DatabaseService,
    private newsSettingsApiService: NewsSettingsApiService,
    private mediaDialogService: MediaDialogService,
    private openUrlOnDeviceApiService: OpenUrlOnDeviceApiService
  ) {
    this.mediaApiService.mediaDialogService = this.mediaDialogService;

    this.notificationService.component = NotificationComponent;
    this.databaseService.db_id = DB_ID.MEDIA;

    this.versionService.initialLoadAllData(json);
    this.settingsApiService.getSettings();

    this.translateService.setDefaultLang("de");
    this.translateService.use("de");

    this.settingsApiService.settings$.subscribe((settings) => {
      this.translateService.use(settings.language);
    });

    this.newsSettingsApiService.getNewsSettings();
    this.channelApiService.getChannels(!window.navigator.onLine);
    this.searchEngineService.getSearchEngines();
    this.mediaApiService.getMedia(!window.navigator.onLine);

    if (this.openUrlOnDeviceApiService.isOpenUrlOnDevice) {
      this.openUrlOnDeviceApiService.openUrlOnDevice$.subscribe();
      this.openUrlOnDeviceApiService.getOpenUrl();
    }

    this.icons.forEach((icon) => {
      // Icon Name: name + prefix (egal in welchem Ordner)
      // Für Dropdowns muss ein Prefix gesetzt werden, da sonst die Icons nicht gefunden werden
      this.matIconRegistry.addSvgIcon(
        (icon.prefix ?? "") + icon.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          (icon.url ?? this.iconsUrl) + icon.name + ".svg"
        )
      );
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === "VERSION_READY"))
        .subscribe(() => {
          this.notificationService.show(NotificationTemplateType.VERSION_READY)?.subscribe(() => {
            // Reload the page to update to the latest version.
            document.location.reload();
          });
        });
    }
  }
}
