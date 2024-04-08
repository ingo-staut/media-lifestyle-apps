import { Platform } from "@angular/cdk/platform";
import { Location } from "@angular/common";
import { Component, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSidenav } from "@angular/material/sidenav";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import JSZip from "jszip";
import { environment } from "projects/series-movies/src/environments/environment";
import { Subject, combineLatest, take, takeUntil } from "rxjs";
import { LANGUAGES_SYSTEM } from "shared/data/language.data";
import { DropdownData } from "shared/models/dropdown.type";
import { Language } from "shared/models/enum/language.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { ShareService } from "shared/services/share.service";
import { VersionService } from "shared/services/version.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { MediaEnum } from "../../../../../../shared/models/enum/media.enum";
import { SearchEngineApiService } from "../../../../../../shared/services/search-engine/search-engine.api.service";
import { SETTINGS_MENU } from "../../data/settings.menu.data";
import { SettingsMenu, SettingsMenuKey } from "../../models/enum/settings-menu.enum";
import { Settings } from "../../models/settings.class";
import { ChannelApiService } from "../../services/channel.api.service";
import { MediaApiService } from "../../services/media.api.service";
import { NewsSettingsApiService } from "../../services/news-settings.api.service";
import { OpenUrlOnDeviceApiService } from "../../services/open-url.api.service";
import {
  OMDBApiSearchKey,
  OmdbApiService,
} from "../../services/request-apis/apis/omdb.api.service";
import { INITIAL_SETTINGS, SettingsApiService } from "../../services/settings.api.service";
import { SettingsDialogData } from "./settings-dialog.service";

@Component({
  selector: "app-settings-dialog",
  templateUrl: "./settings-dialog.component.html",
  styleUrls: ["./settings-dialog.component.scss"],
})
export class SettingsDialogComponent implements OnInit, OnDestroy {
  @ViewChild("sidenav") sidenav!: MatSidenav;

  environment = environment;

  private readonly destroySubject = new Subject<void>();

  formGroup: ReturnType<typeof this.initializeFormGroup>;

  JSON = JSON;
  LANGUAGES_SYSTEM = LANGUAGES_SYSTEM;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  SettingsMenu = SettingsMenu;
  SettingsMenuKey = SettingsMenuKey;
  OMDBApiTypes = '"' + Object.values(MediaEnum).join('", "') + '"';
  OMDBApiSearchKeys = '"' + Object.values(OMDBApiSearchKey).join('", "') + '"';

  isMobileDevice = this.platform.ANDROID || this.platform.IOS;
  settings: Settings = INITIAL_SETTINGS;
  menu = SETTINGS_MENU;
  selectedSubmenu = SettingsMenuKey.LANGUAGE_AND_REGION;
  dragPosition = { x: 0, y: 0 };
  showDialogWindowResetButton = false;
  lockDragging = this.isMobileScreen.matches;
  showAllVersionsEntry = false;

  // DB Change
  performDBChange_series_input = "";
  performDBChange_series_output: any;
  performDBChange_movie_input = "";
  performDBChange_movie_output: any;

  requestYoutubeID = "VqqwOOOLyC8";
  responseYoutubeAPI: any;

  requestUrl = "";
  responseUrlData: any;

  requestUrlWithHeadersValues = "Jonathan Nolan";
  requestUrlWithHeadersUrl = "https://online-movie-database.p.rapidapi.com/auto-complete?q=";
  requestUrlWithHeadersHost = "online-movie-database.p.rapidapi.com";
  responseUrlWithHeadersData: any;

  rapidApiRequestUrlWithHeadersBody = '{"search_query":"person of interest trailer"}';
  rapidApiRequestUrlWithHeadersUrl = "https://youtube-search-api.p.rapidapi.com/search";
  rapidApiRequestUrlWithHeadersHost = "youtube-search-api.p.rapidapi.com";
  rapidApiResponseUrlWithHeadersData: any;

  requestApiServiceUrlTitle = "Person of Interest";
  requestApiServiceUrlYear = "";
  requestApiServiceUrlType: string = MediaEnum.SERIES;
  requestApiServiceUrlSearchKey = "t";
  responseJsonApiServiceUrl$ = this.omdbApiService.generalDataJson$;
  responseInterpretedApiServiceUrl$ = this.omdbApiService.generalData$;

  requestXMLUrlData = "https://www.dwdl.de/rss/allethemen.xml";
  responseXMLAsJSONUrlData: any;

  testUrl = "https://www.imdb.com/title/tt0068646/";

  downloadWithZipFolder = true;
  downloadWithCurrentDate = true;

  shareUrl = "https://keep.google.com/u/0/#home";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SettingsDialogData,
    @Inject(Router) private router: Router,
    private dialogRef: MatDialogRef<SettingsDialogComponent>,
    private platform: Platform,
    private location: Location,
    protected localeService: LocaleService,
    protected settingsApiService: SettingsApiService,
    protected translateService: TranslateService,
    protected versionService: VersionService,
    private notificationService: NotificationService,
    private searchEngineApiService: SearchEngineApiService,
    private mediaApiService: MediaApiService,
    private channelApiService: ChannelApiService,
    private newsSettingsApiService: NewsSettingsApiService,
    private omdbApiService: OmdbApiService,
    private shareService: ShareService,
    private openUrlOnDeviceApiService: OpenUrlOnDeviceApiService
  ) {}

  ngOnInit(): void {
    this.selectedSubmenu = this.data.selectedSubmenu ?? this.selectedSubmenu;
    this.setUrl();
    this.formGroup = this.initializeFormGroup();

    this.settingsApiService.settings$.pipe(takeUntil(this.destroySubject)).subscribe((settings) => {
      this.settings = settings;
      this.formGroup.patchValue(settings);
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
    this.omdbApiService.clear();
  }

  initializeFormGroup() {
    return new FormGroup({
      language: new FormControl(this.settings.language),
    });
  }

  languageChange(data: DropdownData<Language, string>) {
    this.formGroup.controls.language.patchValue(data.key);
    // this.translateService.use(data.key);
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Neue Daten, die gespeichert werden sollen
   * @returns Daten, die der Dialog zurückgibt
   */
  newData() {
    const settings = new Settings({
      ...this.settings,
      ...(this.formGroup.getRawValue() as Settings),
    });

    return settings;
  }

  setUrl(): void {
    var queryParams: { [k: string]: any } = {};
    queryParams["settings"] = "true";
    if (this.selectedSubmenu) queryParams["submenu"] = this.selectedSubmenu;

    const url = this.router
      .createUrlTree([], {
        queryParams,
        queryParamsHandling: "merge",
      })
      .toString();
    this.location.replaceState(url);
  }

  /**
   * Verschieben des Dialogfensters gestartet
   */
  onDragStarted() {
    this.showDialogWindowResetButton = true;
    const elements = document.getElementsByClassName("cdk-overlay-backdrop");
    for (var i = 0; i < elements.length; i++) {
      (elements.item(i) as HTMLElement).style.display = "none";
    }
  }

  /**
   * Dialogfenster zurücksetzen
   */
  onDialogWindowReset() {
    this.showDialogWindowResetButton = false;
    (document.getElementsByClassName("cdk-overlay-backdrop")[0] as HTMLElement).style.display =
      "block";
    this.dragPosition = { x: 0, y: 0 };
  }

  closeSidebar() {
    this.sidenav.close();
  }

  async onPastFromClipboardToSeries() {
    const text = await navigator.clipboard.readText();
    this.settingsApiService.performDBChangeImportSeriesAndSave(text);
  }

  async onPastFromClipboardToMovie() {
    const text = await navigator.clipboard.readText();
    this.settingsApiService.performDBChangeImportMovieAndSave(text);
  }

  toggle() {
    this.sidenav.toggle();
  }

  setActive(key: SettingsMenuKey) {
    if (this.isSmallScreen.matches) this.sidenav?.close();
    this.selectedSubmenu = key;
    this.setUrl();
  }

  showTestNotification() {
    this.notificationService.show(NotificationTemplateType.TEST_CLOSEABLE);
  }

  showTestNotificationWithDuration() {
    this.notificationService.show(NotificationTemplateType.TEST_DURATION);
  }

  requestSearchTitle() {
    this.omdbApiService.request(
      this.requestApiServiceUrlTitle,
      this.requestApiServiceUrlType
        ? (this.requestApiServiceUrlType as MediaEnum)
        : MediaEnum.SERIES,
      {
        year: this.requestApiServiceUrlYear ? +this.requestApiServiceUrlYear : undefined,

        searchKey: this.requestApiServiceUrlSearchKey
          ? (this.requestApiServiceUrlSearchKey as OMDBApiSearchKey)
          : undefined,
      }
    );
  }

  requestYoutubeAPI(requestYoutubeID: string) {
    fetch("" + requestYoutubeID, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        console.log(response.headers);
        return response.json();
      })
      .then((data) => {
        // Handle the data
        console.log(data);
        this.responseYoutubeAPI = data;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  requestURLWithSpecial(url: string) {
    fetch("" + encodeURIComponent(url), {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        console.log(response.headers);
        return response.json();
      })
      .then((data) => {
        // Handle the data
        console.log(data);
        this.responseUrlData = data;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  requestRapidAPI(text: string, url: string, host: string) {
    const apiUrl = "";

    // const options = {
    //   method: "GET",
    //   headers: {
    //     "X-RapidAPI-Key": "c9abee0953msh05e3f40429b2745p1bc3afjsn81aacc83da0a",
    //     "X-RapidAPI-Host": host,
    //   },
    // };

    // Set your API endpoint and parameters
    const apiParams = new URLSearchParams({
      url: url + encodeURIComponent(text),
      host: encodeURIComponent(host),
    });

    console.log(apiParams);
    console.log("url", url + encodeURIComponent(text));
    console.log("host", encodeURIComponent(host));

    fetch(`${apiUrl}?${apiParams}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the data
        console.log(data);
        this.responseUrlWithHeadersData = data;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  requestRapidAPIWithBody(body: string, url: string, host: string) {
    const apiUrl = "";

    // Set your API endpoint and parameters
    const apiParams = new URLSearchParams({
      url: url,
      host: encodeURIComponent(host),
      body: encodeURIComponent(body),
    });

    fetch(`${apiUrl}?${apiParams}`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the data
        console.log(data);
        this.rapidApiResponseUrlWithHeadersData = data;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  requestXMLData(url: string) {
    fetch("" + encodeURIComponent(url), {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        const text = response.json();
        console.log(text);
        return text;
      })
      .then((data) => {
        // Handle the data
        console.log(data);
        this.responseXMLAsJSONUrlData = data;
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  }

  downloadJSON(data: any, fileName: string) {
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async downloadFilesAsZip(jsonDataArray: { fileName: string; data: any }[]) {
    const zip = new JSZip();

    jsonDataArray.forEach((jsonData) => {
      zip.file(jsonData.fileName + ".json", JSON.stringify(jsonData.data));
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);

    if (this.downloadWithCurrentDate)
      link.download = `backup-media-${DateFns.formatDateByFormatString(
        new Date(),
        "yyyy-MM-dd"
      )}.zip`;
    else link.download = `backup-media.zip`;

    link.click();
  }

  downloadAllJSON() {
    if (this.downloadWithZipFolder) {
      const fileNames = [
        "media",
        "searchEngines",
        "settings",
        "channels",
        "news-read",
        "news-terms-hide",
      ];
      combineLatest([
        this.mediaApiService.media$,
        this.searchEngineApiService.searchEngines$,
        this.settingsApiService.settings$,
        this.channelApiService.channels$,
        this.newsSettingsApiService.readNews$,
        this.newsSettingsApiService.termsHideNews$,
      ])
        .pipe(take(1))
        .subscribe((data) => {
          this.downloadFilesAsZip(
            data.map((file, index) => {
              return { fileName: fileNames[index], data: file };
            })
          );
        });
    } else {
      this.downloadMediaJSON();
      this.downloadSearchEnginesJSON();
      this.downloadSettingsJSON();
      this.downloadChannelsJSON();
      this.downloadReadNewsJSON();
      this.downloadTermsHideNewsJSON();
    }
  }

  downloadMediaJSON() {
    this.mediaApiService.media$.pipe(take(1)).subscribe((data) => {
      this.downloadJSON(data, "media");
    });
  }

  downloadSearchEnginesJSON() {
    this.downloadJSON(this.searchEngineApiService.searchEnginesSnapshot, "searchEngines");
  }

  downloadSettingsJSON() {
    this.downloadJSON(this.settingsApiService.settingsSnapshot, "settings");
  }

  downloadChannelsJSON() {
    this.downloadJSON(this.channelApiService.channelsSnapshot, "stores");
  }

  downloadReadNewsJSON() {
    this.newsSettingsApiService.readNews$.pipe(take(1)).subscribe((data) => {
      this.downloadJSON(data, "news-read");
    });
  }

  downloadTermsHideNewsJSON() {
    this.newsSettingsApiService.termsHideNews$.pipe(take(1)).subscribe((data) => {
      this.downloadJSON(data, "news-terms-hide");
    });
  }

  shareViaLinkToWindows(url: string) {
    this.shareService.shareUrlWithoutCatch(url);
  }

  testOpenUrl() {
    this.openUrlOnDeviceApiService.openUrl(this.testUrl);
  }
}
