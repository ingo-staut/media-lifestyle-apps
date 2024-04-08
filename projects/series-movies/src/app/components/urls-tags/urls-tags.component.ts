import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Platform } from "@angular/cdk/platform";
import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Subject, take } from "rxjs";
import { Language } from "shared/models/enum/language.enum";
import { MediaEnum } from "shared/models/enum/media.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { Url, UrlEnum } from "shared/models/url.class";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { ShareService } from "shared/services/share.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { cleanString } from "shared/utils/string";
import {
  URL_FAVICON,
  cleanUrl,
  formatUrl,
  isValidHttpUrl,
  replaceSeasonAndEpisode,
} from "shared/utils/url";
import { getIMDbIdFromUrl } from "shared/utils/url.imdb";
import { getUrlByWikipediaUrl } from "shared/utils/url.wikipedia";
import { transformWikiwandUrlToWikipediaUrl } from "shared/utils/url.wikiwand";
import { getYoutubeIdFromUrl } from "shared/utils/url.youtube";
import { MenuItem } from "../../../../../../shared/models/menu-item.type";
import { SearchEngine } from "../../../../../../shared/models/search-engine.type";
import { SearchEngineApiService } from "../../../../../../shared/services/search-engine/search-engine.api.service";
import { SearchEngineService } from "../../../../../../shared/services/search-engine/search-engine.service";
import { UrlService } from "../../../../../../shared/services/url.service";
import { QUICKADD_DESCRIPTION_REPLACE } from "../../data/quick-add-description-replace.data";
import { OpenUrlOnDeviceApiService } from "../../services/open-url.api.service";
import { MyApiFilmsIMDbApiService } from "../../services/request-apis/apis/myapifilms.imdb.api.service";
import { YoutubeApiService } from "../../services/request-apis/apis/youtube.api.service";
import { SearchEngineDialogsService } from "../../services/search-engine.dialogs.service";
import { UrlDialogsService } from "../../services/url.dialogs.service";
import { MenuBottomSheetService } from "../menu-bottom-sheet/menu-bottom-sheet.service";

@Component({
  selector: "app-urls-tags",
  templateUrl: "./urls-tags.component.html",
  styleUrls: ["./urls-tags.component.scss"],
})
export class UrlsTagsComponent {
  @Input() urls: Url[];
  @Input() withPadding: boolean = true;
  @Input() title: string = "";
  @Input() titleOriginal: string = "";
  @Input() season?: number;
  @Input() episode?: number;
  @Input() year?: number;
  @Input() text: string;
  @Input() showText: boolean = true;
  @Input() icon: string;
  @Input() searchEngineType: SearchEngineType = SearchEngineType.NONE;
  @Input() marginTop: number = 0;
  @Input() urlType: UrlEnum;
  @Input() mediaType: MediaEnum;

  @Output() urlsChange = new EventEmitter<Url[]>();

  @ViewChild("menu") menu: HTMLElement;

  URL_FAVICON = URL_FAVICON;
  UrlType = UrlType;

  isMobileDevice = this.platform.ANDROID || this.platform.IOS;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  QUICKADD_DESCRIPTION_REPLACE = QUICKADD_DESCRIPTION_REPLACE;
  blinkingIndex: number | null = null;

  // ! Hier nicht die Suchmaschinen filtern
  menuItems$ = this.searchEngineService.searchEnginesMenu$;
  menuItems: MenuItem<SearchEngine>[] | null;

  // ? Hier Suchmaschinen filtern
  filterFunction = (item: SearchEngine) =>
    item.type === this.searchEngineType && (item.mediaType === this.mediaType || !item.mediaType);

  quickAddUrls: SearchEngine[] = [];

  get disableQuickAdd() {
    return !this.titleOriginal && !this.title;
  }

  constructor(
    private platform: Platform,
    private notificationService: NotificationService,
    private searchEngineService: SearchEngineService,
    private searchEngineApiService: SearchEngineApiService,
    private searchEngineDialogsService: SearchEngineDialogsService,
    private urlDialogsService: UrlDialogsService,
    private menuBottomSheetService: MenuBottomSheetService,
    private urlService: UrlService,
    private myApiFilmsIMDbApiService: MyApiFilmsIMDbApiService,
    private youtubeApiService: YoutubeApiService,
    private shareService: ShareService,
    private openUrlOnDeviceApiService: OpenUrlOnDeviceApiService,
    protected localeService: LocaleService
  ) {}

  onEdit(url: Url) {
    this.urlDialogsService.openAddOrEditUrlDialog(false, url, this.urlType).subscribe((result) => {
      if (result === null) {
        this.remove(url);
      }

      if (!result) return;

      const index = this.urls.indexOf(url);
      if (index >= 0) {
        // Hier werden die URLs nicht automatisch angepasst wie beim Hinzufügen
        this.urls.splice(index, 1, result);
        this.blinkingIndex = index;
      }

      this.urlsChange.emit(this.urls);
    });
  }

  addWithDialog(value?: string): void {
    this.urlDialogsService
      .openAddOrEditUrlDialog(true, value ? new Url({ url: value }) : undefined, this.urlType)
      .subscribe((result) => {
        if (!result) return;

        result.url = replaceSeasonAndEpisode(
          cleanUrl(transformWikiwandUrlToWikipediaUrl(result.url))
        );

        this.addUrl(result);
      });
  }

  add(value: string, language?: Language) {
    value = replaceSeasonAndEpisode(
      cleanUrl(transformWikiwandUrlToWikipediaUrl(cleanString(value)))
    );

    if (!value) return;

    const wikipediaUrl = getUrlByWikipediaUrl(value, true);
    if (wikipediaUrl) {
      this.addUrl(wikipediaUrl);
      this.clearQuickAdd();
      return;
    }

    const url = new Url({
      url: value,
      type: this.urlType === UrlEnum.VIDEO ? UrlType.TRAILER : UrlType.NONE,
      language,
    });

    this.addUrl(url);
    this.clearQuickAdd();
  }

  private addUrl(url: Url) {
    this.urls.unshift(url);
    this.urlsChange.emit(this.urls);

    this.blinkingIndex = 0;
  }

  remove(url: Url): void {
    const index = this.urls.indexOf(url);

    if (index >= 0) {
      this.urls.splice(index, 1);
    }

    this.urlsChange.emit(this.urls);

    this.clearQuickAdd();
  }

  onRemoveAll() {
    const urlsCopy = this.urls;
    this.urls = [];
    this.urlsChange.emit(this.urls);

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.urls = urlsCopy;
      this.urlsChange.emit(this.urls);
    });

    this.clearQuickAdd();
  }

  onOpen(url: Url, event?: MouseEvent): void {
    this.urlService.openOrCopyUrl({
      event,
      url,
      season: this.season,
      episode: this.episode,
      year: this.year,
    });
  }

  onSearchEngineClicked(searchEngine: SearchEngine, event?: MouseEvent): void {
    const url = this.urlService.openOrCopyUrl({
      searchEngine,
      title: this.title,
      season: this.season,
      episode: this.episode,
      year: this.year,
    });

    // Wenn Suchmaschine noch nicht in den QuickAddUrls ist
    // und ein QuickAdd angezeigt werden soll, hinzufügen
    if (searchEngine.showQuickAdd && !this.quickAddUrls.includes(searchEngine))
      this.quickAddUrls.push({ ...searchEngine, url: replaceSeasonAndEpisode(url) });
  }

  updateSearchEngineMenuItems(menuItems: MenuItem<SearchEngine>[]): void {
    this.searchEngineApiService.saveAndReloadSearchEngines(
      menuItems.map((menuItem) => menuItem.value)
    );
  }

  addSearchEngineMenuItem(
    menuItems: MenuItem<SearchEngine>[],
    menuItem?: MenuItem<SearchEngine>
  ): void {
    this.searchEngineDialogsService.openAddOrEditSearchEngine(menuItems, {
      menuItem,
      id: menuItem?.id,
      type: this.searchEngineType,
    });
  }

  onAddQuickAddUrl(item: SearchEngine): void {
    this.add(item.url, item.language);
    this.quickAddUrls = this.quickAddUrls.filter((quickAddUrl) => quickAddUrl.url !== item.url);
  }

  onRemoveQuickAddUrl(event: Event, item: SearchEngine): void {
    event.stopPropagation();
    event.preventDefault();

    this.quickAddUrls = this.quickAddUrls.filter((quickAddUrl) => quickAddUrl.url !== item.url);
  }

  onUrlClicked(item: { event?: MouseEvent; value: string }, url: Url) {
    this.blinkingIndex = null;

    switch (item.value) {
      case "open":
        this.onOpen(url, item.event);
        break;
      case "open-url-on-device":
        const formattedUrl = formatUrl({
          url,
          season: this.season,
          episode: this.episode,
          year: this.year,
        });
        this.openUrlOnDeviceApiService.openUrl(formattedUrl);
        break;
      case "edit":
        this.onEdit(url);
        break;
      case "quick-add":
        const imdbId = getIMDbIdFromUrl(url.url);
        if (imdbId) this.myApiFilmsIMDbApiService.requestAllDetailsById(imdbId, this.mediaType);

        const youtubeId = getYoutubeIdFromUrl(url.url);
        if (youtubeId) this.youtubeApiService.requestById(youtubeId, this.mediaType);
        break;
      case "delete":
        this.remove(url);
        break;
      default:
        break;
    }
  }

  onAddMenuItemClicked(item: string) {
    switch (item) {
      case "add":
        this.addWithDialog();
        break;

      case "quick-add":
        this.quickAddMenuBottomSheet();
        break;

      case "clipboard":
        this.onAddUrlFromClipboard();
        break;

      default:
        break;
    }
  }

  async onAddUrlFromClipboard() {
    const text = await navigator.clipboard.readText();
    if (isValidHttpUrl(text)) {
      this.add(text);
    } else {
      this.addWithDialog(text);
    }
  }

  private quickAddMenuBottomSheet() {
    this.menuItems$.pipe(take(1)).subscribe((menuItems) => {
      const menuItemsChanged = new Subject<MenuItem<SearchEngine>[]>();
      const addMenuItem = new Subject<MenuItem<SearchEngine>[]>();
      const editMenuItem = new Subject<{
        menuItems: MenuItem<SearchEngine & { favorite?: boolean }>[];
        item: MenuItem<SearchEngine & { favorite?: boolean }>;
      }>();
      this.menuBottomSheetService
        .open<SearchEngine>(
          {
            actions: menuItems,
            descriptionsReplace: QUICKADD_DESCRIPTION_REPLACE,
            showFilterInput: true,
            menuItemsChanged,
            addMenuItem,
            editMenuItem,
            showAddButton: true,
            showDescriptions: false,
            showShowDescriptionsButton: true,
            filterFunction: this.filterFunction,
          },
          "without-padding"
        )
        .subscribe((value) => {
          if (value && value.value) {
            this.onSearchEngineClicked(value.value);
          }
        });

      menuItemsChanged.asObservable().subscribe((value) => {
        this.menuItems = value;
        this.updateSearchEngineMenuItems(this.menuItems);
      });

      addMenuItem.asObservable().subscribe((value) => {
        this.addSearchEngineMenuItem(value);
      });

      editMenuItem.asObservable().subscribe((value) => {
        this.addSearchEngineMenuItem(value.menuItems, value.item);
      });
    });
  }

  drop(event: CdkDragDrop<Url[], Url[], Url[]>) {
    this.blinkingIndex = null;

    if (event.previousContainer === event.container) {
      moveItemInArray(this.urls, event.previousIndex, event.currentIndex);
      this.urlsChange.emit(this.urls);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.urlsChange.emit(this.urls);
    }
  }

  shareUrl(url: string) {
    this.shareService.shareUrlWithoutCatch(url);
  }

  func = (url: string) => {
    return () => {
      this.shareUrl(url);
    };
  };

  funcOpenUrl = (url: string) => {
    return () => {
      this.openUrlOnDeviceApiService.openUrl(url);
    };
  };

  clearQuickAdd() {
    this.quickAddUrls = [];
  }
}
