import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Platform } from "@angular/cdk/platform";
import { Location } from "@angular/common";
import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import isEqual from "lodash.isequal";
import {
  QuickAddButton,
  RequestApiService,
  Strategy,
} from "projects/series-movies/src/app/services/request-apis/request.api.service";
import { isMediaEqualToEntry } from "projects/series-movies/src/pipes/value.pipe";
import {
  quickAddAppendAll,
  quickAddOrReplaceAll,
  quickReplaceAll,
} from "projects/series-movies/src/utils/quickaddbuttons";
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  map,
  merge,
  startWith,
  take,
  takeUntil,
} from "rxjs";
import { DialogData } from "shared/models/dialog.type";
import { MediaEnum } from "shared/models/enum/media.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { RatingIndex } from "shared/models/enum/rating.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { Url, UrlEnum } from "shared/models/url.class";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { SearchEngineApiService } from "shared/services/search-engine/search-engine.api.service";
import { ShareService } from "shared/services/share.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_NORMAL_SCREEN_MAX,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { UNEQUAL, forSearch, toTitleCase } from "shared/utils/string";
import { isValue } from "shared/utils/type";
import { sortUrlListByType } from "shared/utils/url";
import { getIMDbIdFromUrl } from "shared/utils/url.imdb";
import { getYoutubeIdFromUrl } from "shared/utils/url.youtube";
import {
  EpisodeDetailsMenuBottomSheetComponent,
  EpisodeDetailsMenuBottomSheetReturnData,
  ReturnValueAddEpisodeDetail,
  ReturnValueDeleteEpisodeDetailById,
  ReturnValueEditEpisodeDetailById,
} from "../../bottom-sheets/episode-detail-menu-bottom-sheet/episode-detail-menu-bottom-sheet.component";
import { EPISODE_DETAIL_TYPES } from "../../data/episode-detail.data";
import { DATA_MEDIA_TYPE_WITHOUT_NONE } from "../../data/media-type.data";
import { EpisodeDetailType } from "../../models/enum/episode-detail.enum";
import { EpisodeDetail } from "../../models/episode-detail.class";
import { Episode } from "../../models/episode.class";
import { MEDIA_ATTRIBUTE_NAMES, Media } from "../../models/media.class";
import { Season } from "../../models/season.type";
import { Television } from "../../models/television.class";
import { ChannelApiService } from "../../services/channel.api.service";
import { MediaDialogAvailableUntilService } from "../../services/dialogs/media.dialog.available-until.service";
import { MediaDialogCinemaService } from "../../services/dialogs/media.dialog.cinema.service";
import { MediaDialogCurrentEpisodeService } from "../../services/dialogs/media.dialog.current-episode.service";
import { MediaDialogDiscoverySourcesService } from "../../services/dialogs/media.dialog.discovery-sources.service";
import { MediaDialogEpisodeDetailsService } from "../../services/dialogs/media.dialog.episode-detail.service";
import { MediaDialogImagesService } from "../../services/dialogs/media.dialog.images.service";
import { MediaDialogLanguageService } from "../../services/dialogs/media.dialog.language.service";
import { MediaDialogNoteService } from "../../services/dialogs/media.dialog.note.service";
import { MediaDialogRatingService } from "../../services/dialogs/media.dialog.rating.service";
import { MediaDialogRewatchService } from "../../services/dialogs/media.dialog.rewatch.service";
import { MediaDialogRuntimeService } from "../../services/dialogs/media.dialog.runtime.service";
import { MediaDialogSeasonService } from "../../services/dialogs/media.dialog.season.service";
import { MediaDialogTitlesService } from "../../services/dialogs/media.dialog.titles.service";
import { MediaDialogYearsService } from "../../services/dialogs/media.dialog.years.service";
import { MediaApiService } from "../../services/media.api.service";
import { MediaCompleterService } from "../../services/media.completer.service";
import { QuickAddService } from "../../services/quick-add.service";
import { EpisodateSeasonsApiService } from "../../services/request-apis/apis/episodate-seasons.api.service";
import { KinoCheckApiService } from "../../services/request-apis/apis/kino-check.api.service";
import { MovieDatabaseSeasonsApiService } from "../../services/request-apis/apis/movie-database.seasons.api.service";
import { MyApiFilmsIMDbApiService } from "../../services/request-apis/apis/myapifilms.imdb.api.service";
import { MyApiFilmsTMDbApiService } from "../../services/request-apis/apis/myapifilms.tmdb.api.service";
import { OmdbApiService } from "../../services/request-apis/apis/omdb.api.service";
import { YoutubeApiService } from "../../services/request-apis/apis/youtube.api.service";
import { RoutingService } from "../../services/routing.service";
import { DialogService } from "../dialog/dialog.service";
import { TelevisionDialogService } from "../television-dialog/television-dialog.service";
import { MediaDialogService, OptionalsType } from "./media-dialog.service";

@Component({
  selector: "app-media-dialog",
  templateUrl: "./media-dialog.component.html",
  styleUrls: ["./media-dialog.component.scss"],
})
export class MediaDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isNormalScreen = MEDIA_QUERY_NORMAL_SCREEN_MAX;
  DATA_MEDIA_TYPE_WITHOUT_NONE = DATA_MEDIA_TYPE_WITHOUT_NONE;
  isMobileDevice = this.platform.ANDROID || this.platform.IOS;
  EPISODE_DETAIL_TYPES = EPISODE_DETAIL_TYPES;
  EpisodeDetailType = EpisodeDetailType;
  SearchEngineType = SearchEngineType;
  RatingIndex = RatingIndex;
  UrlEnum = UrlEnum;

  private readonly destroySubject = new Subject<void>();

  media: Media;

  isBottomSheetOpen = false;

  dragPosition = { x: 0, y: 0 };
  showDialogWindowResetButton = false;
  lockDragging = this.isNormalScreen.matches;

  media_tmp: Media = new Media(cloneDeep({ ...this.data.media }));

  savingAllowed = false;
  saveButtonTooltip = "";
  src: any;
  youtubeId = "";
  displayNone = false;
  displayScrollToButton = false;
  lastSeasonIndexEpisodeWasAdded = 0;
  episode = 1;
  time = new Date();
  minutes = 45;
  episodeTimeMode = false;

  completerListMedia$ = this.mediaCompleterService.completerListMedia$;
  linkedMedia: Media[] = [];

  changeSubject = new Subject<void>();
  change$ = this.changeSubject.asObservable();

  intersectionObserver = new IntersectionObserver((entries) => {
    // If intersectionRatio is 0, the target is out of view
    // and we do not need to do anything.
    const outOfView = entries[0].intersectionRatio <= 0;
    this.displayScrollToButton = outOfView;
  });

  mediaSubject = new BehaviorSubject<Media>(this.data.media);

  quickAddDataSubject = new Subject<QuickAddButton[]>();
  quickAddData$ = merge(
    combineLatest([
      this.myApiFilmsIMDbApiService.detailedData$,
      this.myApiFilmsTMDbApiService.detailedData$,
      this.omdbApiService.generalData$,
      this.kinoCheckApiService.detailedData$,
      this.movieDatabaseSeasonsApiService.seasons$,
      this.youtubeApiService.data$,
      this.quickAddService.quickAddData$,
      this.episodateSeasonsApiService.seasons$,
    ]).pipe(map(([...arrays]) => arrays.flatMap((quickAddButtons) => quickAddButtons))),
    this.quickAddDataSubject.asObservable()
  ).pipe(map((array) => this.quickAddButtonsMerge(array)));

  quickAddErrors$ = combineLatest([this.quickAddData$, this.mediaSubject.asObservable()]).pipe(
    map(([data, media]) => this.quickAddErrors(data, media))
  );

  constructor(
    private dialogRef: MatDialogRef<MediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { media: Media } & OptionalsType,
    private translateService: TranslateService,
    private mediaApiService: MediaApiService,
    private mediaCompleterService: MediaCompleterService,
    private mediaDialogRuntimeService: MediaDialogRuntimeService,
    private mediaDialogRewatchService: MediaDialogRewatchService,
    private mediaDialogAvailableUntilService: MediaDialogAvailableUntilService,
    private mediaDialogYearsService: MediaDialogYearsService,
    private mediaDialogTitlesService: MediaDialogTitlesService,
    private mediaDialogNoteService: MediaDialogNoteService,
    private mediaDialogSeasonService: MediaDialogSeasonService,
    private mediaDialogCurrentEpisodeService: MediaDialogCurrentEpisodeService,
    private mediaDialogImagesService: MediaDialogImagesService,
    private mediaDialogLanguageService: MediaDialogLanguageService,
    private mediaDialogDiscoverySourcesService: MediaDialogDiscoverySourcesService,
    private mediaDialogCinemaService: MediaDialogCinemaService,
    private mediaDialogRatingService: MediaDialogRatingService,
    private dialogService: DialogService,
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private televisionDialogService: TelevisionDialogService,
    private _bottomSheet: MatBottomSheet,
    private requestApiService: RequestApiService,
    private omdbApiService: OmdbApiService,
    private movieDatabaseSeasonsApiService: MovieDatabaseSeasonsApiService,
    private myApiFilmsTMDbApiService: MyApiFilmsTMDbApiService,
    private myApiFilmsIMDbApiService: MyApiFilmsIMDbApiService,
    private kinoCheckApiService: KinoCheckApiService,
    private youtubeApiService: YoutubeApiService,
    private episodateSeasonsApiService: EpisodateSeasonsApiService,
    private routingService: RoutingService,
    private location: Location,
    private shareService: ShareService,
    private mediaDialogService: MediaDialogService,
    private quickAddService: QuickAddService,
    private searchEngineApiService: SearchEngineApiService,
    protected mediaDialogEpisodeDetailService: MediaDialogEpisodeDetailsService,
    protected channelApiService: ChannelApiService,
    protected localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.media = cloneDeep(this.data.media);

    if (this.data.add) this.quickAddDataOnAddMedia();
    if (this.data.triggerQuickAdd) this.quickAddDataOnTrigger();
    if (this.data.add || this.data.triggerQuickAdd) this.onMediaTitleChanged(this.media);

    this.episode = this.media.seasons.length
      ? Math.max(this.media.currentSeasonEpisodes - this.media.currentEpisode.episode, 1)
      : 1;
    this.calculateMinutes();

    this.setVideoUrl();

    this.setUrl(this.data.media.id);

    // Breite und Höhe von Mediae-Dialog ändern: MEDIA_DIALOG_SIZE
    this.isNormalScreen.onchange = (e) => {
      this.dialogRef.updateSize(e.matches ? "100dvw" : "80vw", e.matches ? "100dvh" : "80vh");
      this.lockDragging = e.matches;
      if (e.matches) {
        this.onDialogWindowReset();
      }
    };

    // Verlinkte Media laden
    combineLatest([this.mediaApiService.media$, this.change$.pipe(startWith(true))])
      .pipe(
        map(([mediaList]) =>
          mediaList.filter((media) => this.media.linkedIds.some((m) => m.id === media.id))
        ),
        takeUntil(this.destroySubject)
      )
      .subscribe((linkedMedia) => {
        this.linkedMedia = linkedMedia;
      });
  }

  ngAfterViewInit(): void {
    // Aktuelle Episode erscheint rechts oben
    // const element = document.getElementsByClassName("current")[0] as any;
    // element?.scrollIntoViewIfNeeded({ behavior: "smooth", block: "nearest", inline: "center" });

    if (this.data.openEditTitle) this.openTitlesDialog();

    setTimeout(() => {
      this.startObserverForScrollingButton();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();

    this.requestApiService.clearAll();
    this.quickAddService.clear();

    this.notificationService.ref?.dismiss();
  }

  quickAddButtonsMerge(array: QuickAddButton[]) {
    const merged: QuickAddButton[] = [];

    array.forEach((quickAddButton) => {
      const foundAll = merged.filter((q) => q.key === quickAddButton.key);

      // Eintrag existiert bereits und kann erweitert werden
      if (foundAll.length) {
        // Nur den größten Wert nehmen
        if (
          quickAddButton.key === "runtime" ||
          quickAddButton.key === "ratingImdb" ||
          quickAddButton.key === "ratingMetascore"
        ) {
          const allOthersAreSmaller = array.every((btn) => btn.value <= quickAddButton.value);
          const alreadyAddedIsSameValue = foundAll.some(
            (btn) => btn.value === quickAddButton.value
          );

          if (allOthersAreSmaller && !alreadyAddedIsSameValue) merged.push(quickAddButton);
        }

        // Keine Einträge mit gleichen Werten
        else if (!foundAll.some((btn) => isEqual(btn.value, quickAddButton.value))) {
          merged.push(quickAddButton);
        }
      } else {
        merged.push(quickAddButton);
      }
    });

    return merged;
  }

  quickAddErrors(data: QuickAddButton[], media: Media) {
    return data.filter(
      (entry) =>
        !isMediaEqualToEntry(media, entry) &&
        entry.strategy !== Strategy.APPEND &&
        isValue(media[entry.key])
    );
  }

  setUrl(id: string): void {
    const url = this.routingService.getMediaRoute(id, "merge");
    this.location.replaceState(url);
  }

  quickAddDataOnAddMedia() {
    this.quickAddDataByYoutubeUrl();
    this.quickAddDataByInfoUrl();
  }

  quickAddDataOnTrigger() {
    this.requestApiService.requestAll(this.media.nameOriginal || this.media.name, this.media.type);
  }

  quickAddDataByYoutubeUrl() {
    if (this.media.urlsVideo.length) {
      const youtubeId = getYoutubeIdFromUrl(this.media.urlsVideo[0].url);
      if (youtubeId) {
        this.youtubeApiService.requestById(youtubeId, this.media.type).then((result) => {
          // Für Details
          const name = result?.find((q) => q.key === "name")?.value as string;
          const nameOriginal = result?.find((q) => q.key === "nameOriginal")?.value as string;
          if (name || nameOriginal) {
            this.requestApiService.requestAll(nameOriginal || name, this.media.type);
          }
        });
      }
    }
  }

  quickAddDataByInfoUrl() {
    if (this.media.urlsInfo.length) {
      const idImdb = getIMDbIdFromUrl(this.media.urlsInfo[0].url);
      if (!idImdb) return;

      this.myApiFilmsIMDbApiService.requestAllDetailsById(idImdb, this.media.type);
    }
  }

  startObserverForScrollingButton() {
    const element = document.getElementsByClassName("current")[0] as HTMLElement;
    if (element) this.intersectionObserver.observe(element);
  }

  scrollToCurrentEpisode() {
    setTimeout(() => {
      const element = document.getElementsByClassName("current")[0] as HTMLElement;
      element?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

      setTimeout(() => {
        this.startObserverForScrollingButton();
      }, 500);
    }, 0);
  }

  applyChanges() {
    // WORKAROUND entfernen
    this.media = new Media(this.media);
    this.mediaSubject.next(this.media);

    this.setVideoUrl();

    setTimeout(() => {
      this.startObserverForScrollingButton();
    }, 500);
  }

  setVideoUrl() {
    const urls = [...this.media.urlsVideo].sort(sortUrlListByType);

    let found = false;
    for (const url of urls) {
      const id = getYoutubeIdFromUrl(url.url);
      if (id) {
        if (id === this.youtubeId) {
          return;
        }

        this.youtubeId = id;
        found = true;
        break;
      }
    }

    if (this.youtubeId) {
      this.src = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${this.youtubeId}?color=white&hl=de&playlist=${this.youtubeId}&loop=1&autoplay=1&controls=0&mute=1`
      );
    }

    if (!found) {
      this.src = null;
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
   * Auf Favorit geklickt
   */
  onFavorite() {
    this.media.favorite = !this.media.favorite;
    this.checkSavingAllowed();
  }

  onQuickAdd() {
    this.requestApiService.requestAll(this.media.nameOriginal || this.media.name, this.media.type);
  }

  onQuickAddCancel() {
    this.requestApiService.clearAll();
    this.quickAddService.clear();
  }

  onQuickAddSearch() {
    this.requestApiService.clearAll();
    this.myApiFilmsIMDbApiService.requestSearchResultsWithNotificationAndDialog(
      this.media.nameOriginal || this.media.name,
      this.media.type
    );
  }

  onQuickAddAppendAll() {
    this.quickAddData$.pipe(take(1)).subscribe((data) => {
      this.media = quickAddAppendAll(this.media, data);

      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  onQuickAddOrReplaceAll() {
    this.quickAddData$.pipe(take(1)).subscribe((data) => {
      this.media = quickAddOrReplaceAll(this.media, data);

      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  onQuickReplaceAll() {
    this.quickAddData$.pipe(take(1)).subscribe((data) => {
      this.media = quickReplaceAll(this.media, data);

      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  /**
   * Teilen geklickt
   */
  onShare() {
    this.shareService.share(
      this.shareContent(),
      "Media: " + this.media.name,
      this.media.name + ":"
    );
  }

  /**
   * Teileninhalt zurückgeben
   */
  shareContent() {
    // Aktuelle URL mit allen Parametern und Unterseiten
    return window.location.href;
  }

  /**
   * Schließen des Dialogs
   */
  onClose() {
    this.dialogRef.close();
  }

  onRemove() {
    this.dialogService
      .open({
        title: this.media.type + ".DELETE_ACTION.TITLE",
        text: this.media.type + ".DELETE_ACTION.TEXT",
        icons: ["delete"],
        textReplace: { name: this.media.name },
        actionPrimary: false,
        actionDelete: true,
        actionCancel: true,
      })
      .subscribe((result) => {
        if (result) {
          this.onClose();
          this.mediaApiService.deleteMediaById(this.media_tmp);
        }
      });
  }

  /**
   * Zurücksetzen der Mediadetails
   */
  onReset() {
    if (this.media.id) {
      this.mediaApiService
        .getMediaById(this.media.id)
        .pipe(take(1))
        .subscribe((media) => {
          this.media = media;
          this.applyChanges();
          this.media_tmp = cloneDeep(media);

          this.changeSubject.next();

          this.checkSavingAllowed();
        });
    }
  }

  /**
   * Überprüfen ob gespeichert werden darf
   */
  checkSavingAllowed() {
    const isEqual = this.media_tmp.isEqualTo(this.currentData());
    const add = this.media.id === "";

    this.savingAllowed =
      (add || !isEqual.equal) &&
      !!this.media.name &&
      (!!this.media.seasons.length || this.media.isMovie);

    this.saveButtonTooltip = "ACTION.SAVE";

    // Nur wenn es nicht gleich ist
    // und ein Media bearbeitet wird, anzeigen
    if (!isEqual.equal && !add) {
      this.saveButtonTooltip =
        this.translateService.instant("CHANGED_DATA") +
        ": " +
        isEqual.messages.map((m) => this.translateService.instant(m)).join(", ");
    }
  }

  /**
   * Aktuelle Daten im Formular, aber auch extra Daten
   * (Enthält nicht den neuen Zeitstemel in der Bearbeitungshistorie)
   * @returns Daten, die aktuell gesetzt sind
   */
  currentData() {
    return new Media({
      ...this.media,
    });
  }

  /**
   * Neue Daten, die gespeichert werden sollen
   * @returns Daten, die der Dialog zurückgibt
   */
  newData() {
    return new Media({
      ...this.currentData(),
      // Weitere Daten anpassen
      // ...
    });
  }

  onSave() {
    this.media.recalculateEvents();
  }

  unmute() {
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.youtubeId}?color=white&hl=de&playlist=${this.youtubeId}&loop=1&autoplay=1&controls=1`
    );
    this.displayNone = true;
  }

  previousEpisode() {
    this.media.decrementCurrentEpisode();
    this.applyChanges();
    this.checkSavingAllowed();
  }

  nextEpisode() {
    this.media.incrementCurrentEpisode();
    this.applyChanges();
    this.checkSavingAllowed();
  }

  onEpisodeClick(season: number, episode: number) {
    if (this.media.automatic) return;

    this.media.currentEpisode = new Episode({ season, episode });
    this.applyChanges();
    this.checkSavingAllowed();
  }

  onDVDAvailable() {
    this.media.dvd = !this.media.dvd;

    this.applyChanges();
    this.checkSavingAllowed();
  }

  onEditCinema() {
    this.mediaDialogCinemaService.open(this.media).subscribe((media) => {
      if (!media) return;

      this.media = media;

      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  /**
   * Verlinktes Media entfernen
   */
  onRemoveLinkedMediaById(id: string) {
    this.linkedMedia = this.linkedMedia.filter((m) => m.id !== id);
    this.checkSavingAllowed();
  }

  /**
   * Media verlinken
   */
  onLinkMediaById(id: string) {
    // Falls Media bereits verlinkt ist, nicht verlinken
    if (this.media.linkedIds.some((linkedId) => linkedId.id === id)) {
      this.notificationService.show(NotificationTemplateType.MEDIA_ALREADY_LINKED);
      return;
    }
    this.media.linkedIds.push({ id, note: "" });
    this.checkSavingAllowed();
  }

  /**
   * Alle verlinkten Media entfernen
   */
  onRemoveAllLinkedMedia() {
    const copy = [...this.media.linkedIds];
    const copyMedia = [...this.linkedMedia];

    this.media.linkedIds = [];
    this.linkedMedia = [];

    this.checkSavingAllowed();

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.media.linkedIds = copy;
      this.linkedMedia = copyMedia;
      this.checkSavingAllowed();
    });
  }

  /**
   * Media verlinken
   */
  onAddLinkedMediaByName(name: string) {
    name = name.trim();
    if (name) {
      this.mediaApiService.media$
        .pipe(
          take(1),
          map((mediaList) => {
            return mediaList.find(
              (media) => media.name.toLowerCase().trim() === name.toLowerCase().trim()
            );
          })
        )
        .subscribe((media) => {
          if (media) {
            const linkedIds = [...this.media.linkedIds];

            // Ist das Media bereits verlinkt?
            if (linkedIds.some((linkedId) => linkedId.id === media.id)) {
              this.notificationService.show(NotificationTemplateType.MEDIA_ALREADY_LINKED);
              return;
            }

            linkedIds.push({ id: media.id, note: "" });
            this.linkedMedia.push(media);
            this.media.linkedIds = linkedIds;

            this.applyChanges();
            this.checkSavingAllowed();
          } else {
            this.notificationService.show(NotificationTemplateType.MEDIA_NOT_FOUND);
          }
        });
    }
  }

  openRuntimeDialog() {
    this.mediaDialogRuntimeService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media.runtime = result;
      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  openRewatchDialog() {
    if (this.media.isMovie && !this.media.isWatchedOnce) {
      this.media.rewatch = 1;

      const oldFavorite = this.media.favorite;
      this.media.favorite = false;

      this.applyChanges();
      this.checkSavingAllowed();

      this.openRatingDialog(RatingIndex.OWN);
      return;
    }

    this.mediaDialogRewatchService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media.rewatch = result;
      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  openNoteDialog() {
    this.mediaDialogNoteService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media.note = result;
      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  openTitlesDialog() {
    this.mediaDialogTitlesService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media.name = result.name;
      this.media.nameOriginal = result.nameOriginal;

      this.onMediaTitleChanged(this.media);

      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  onMediaTitleChanged(media: Media) {
    this.onTitlesChanged(media.name, media.nameOriginal, media.id);
  }

  onTitlesChanged(name: string, nameOriginal: string, id: string) {
    this.mediaApiService.media$.pipe(take(1)).subscribe((mediaList) => {
      const title = forSearch(name).trim();
      const titleOriginal = forSearch(nameOriginal).trim();
      const duplicateMedia = mediaList.find(
        (media) =>
          media.id !== id &&
          (forSearch(media.name).trim() === title ||
            (forSearch(media.name).trim() === titleOriginal && titleOriginal.length) ||
            (media.nameOriginal.length && forSearch(media.nameOriginal).trim() === title) ||
            (media.nameOriginal.length &&
              forSearch(media.nameOriginal).trim() === titleOriginal &&
              titleOriginal.length))
      );

      if (duplicateMedia) {
        this.notificationService
          .show(NotificationTemplateType.MEDIA_ALREADY_EXISTS_VALUE, {
            messageReplace: duplicateMedia.name,
          })
          ?.subscribe(() => {
            // Aktion geklickt
            this.mediaDialogService.openAndReloadData(duplicateMedia);
          });
      }
    });
  }

  openYearsDialog() {
    this.mediaDialogYearsService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media.yearStart = result.yearStart;
      this.media.yearEnd = result.yearEnd;
      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  openAvailableUntilDialog() {
    this.mediaDialogAvailableUntilService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media.availableUntil = result;
      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  openRatingDialog(ratingIndex: RatingIndex) {
    this.mediaDialogRatingService
      .open(
        this.media,
        ratingIndex,
        this.searchEngineApiService.searchEnginesSnapshot,
        this.media.urlsInfo
      )
      .subscribe((result) => {
        if (result === undefined) return;

        if (ratingIndex === RatingIndex.OWN) this.media.rating = result;
        if (ratingIndex === RatingIndex.WATCHABILITY)
          this.media.ratingWatchability = result || null;
        if (ratingIndex === RatingIndex.IMDB) this.media.ratingImdb = result || null;
        if (ratingIndex === RatingIndex.METASCORE) this.media.ratingMetascore = result || null;

        this.applyChanges();
        this.checkSavingAllowed();
      });
  }

  openCurrentEpisodeDialog() {
    this.mediaDialogCurrentEpisodeService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media.setCurrentEpisode(result.season, result.episode);

      if (this.media.automatic) {
        this.media.seasons[this.media.currentEpisode.season - 1].episodes =
          this.media.currentEpisode.episode;
        this.media.seasons.splice(this.media.currentEpisode.season);
      }

      this.applyChanges();
      this.checkSavingAllowed();
      this.scrollToCurrentEpisode();
    });
  }

  onUrlsWatchChanged(urls: Url[]) {
    this.media.urlsWatch = urls;
    this.applyChanges();
    this.checkSavingAllowed();
  }

  onUrlsVideoChanged(urls: Url[]) {
    this.media.urlsVideo = urls;
    this.applyChanges();
    this.checkSavingAllowed();
  }

  onUrlsInfoChanged(urls: Url[]) {
    this.media.urlsInfo = urls;
    this.applyChanges();
    this.checkSavingAllowed();
  }

  onAddEpisodeToSeason(seasonIndex: number) {
    this.media.seasons[seasonIndex].episodes = this.media.seasons[seasonIndex].episodes + 1;
    this.lastSeasonIndexEpisodeWasAdded = seasonIndex;

    this.applyChanges();
    this.checkSavingAllowed();

    // Zur letzten Episode bei der hinzugefügt wurde
    setTimeout(() => {
      const element = document.getElementsByClassName("episode add")[
        this.lastSeasonIndexEpisodeWasAdded
      ] as any;
      element.scrollIntoViewIfNeeded({ behavior: "smooth", block: "nearest", inline: "end" });
    }, 0);
  }

  onAddSeasonToSeasons() {
    this.mediaDialogSeasonService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media = result.media;
      this.applyChanges();
      this.checkSavingAllowed();
    });
  }

  onAutomaticClicked() {
    this.media.automatic = !this.media.automatic;

    if (this.media.automatic) {
      this.media.setCurrentEpisode(this.media.seasons.length, this.media.lastSeasonEpisodes);
    }

    this.applyChanges();
    this.checkSavingAllowed();
  }

  onConsecutiveEpisodeNumberingClicked() {
    this.media.consecutiveEpisodeNumbering = !this.media.consecutiveEpisodeNumbering;

    this.applyChanges();
    this.checkSavingAllowed();
  }

  onWrapSeasonEpisodes() {
    this.media.wrapSeasonEpisodes = !this.media.wrapSeasonEpisodes;

    this.applyChanges();
    this.checkSavingAllowed();
  }

  onShowYearPerSeason() {
    this.media.showYearPerSeason = !this.media.showYearPerSeason;

    this.applyChanges();
    this.checkSavingAllowed();
  }

  openTelevisionDialog(add: boolean) {
    const episode = this.media.currentEpisodeIsLastInSeason
      ? 1
      : this.media.currentEpisode.episode + 1;

    const season =
      this.media.currentEpisodeIsLastInSeason &&
      this.media.seasons.length > this.media.currentEpisode.season
        ? this.media.currentEpisode.season + 1
        : this.media.currentEpisode.season;

    this.televisionDialogService
      .open({
        add,
        television:
          cloneDeep(this.media.television) ??
          new Television({
            channelId: "none",
            episode: new Episode({ season, episode }),
            onlyChannel: !this.media.seasons.length,
            // WORKAROUND: Startdatum muss gesetzt sein,
            // sonst ist die Uhrzeit falsch und der Dialog hat Fehler
            date: new Date(),
          }),
        media: this.media,
      })
      .subscribe((result) => {
        if (!result) return;

        if (result.actionDelete) {
          this.media.television = null;
          this.applyChanges();
          this.checkSavingAllowed();
        } else if (result.actionAddOrApply) {
          this.media.television = result.television ?? null;
          this.media.recalculateEvents();
          this.applyChanges();
          this.checkSavingAllowed();
        }
      });
  }

  onEditImages() {
    this.mediaDialogImagesService
      .open(
        this.media,
        this.searchEngineApiService.searchEnginesSnapshot,
        this.media.nameOriginal || this.media.name
      )
      .subscribe((result) => {
        if (result === undefined) return;

        this.media.images = result;
        this.applyChanges();
        this.checkSavingAllowed();
      });
  }

  onEditLanguages() {
    this.mediaDialogLanguageService.open(this.media).subscribe((result) => {
      if (result !== undefined) {
        this.media.languages = result;
        this.applyChanges();
        this.checkSavingAllowed();
      }
    });
  }

  onEditSources() {
    this.mediaDialogDiscoverySourcesService.open(this.media).subscribe((result) => {
      if (result !== undefined) {
        this.media.sources = result;
        this.applyChanges();
        this.checkSavingAllowed();
      }
    });
  }

  onEditCountries() {
    this.mediaDialogLanguageService.openEditCountries(this.media).subscribe((result) => {
      if (result !== undefined) {
        this.media.countries = result;
        this.applyChanges();
        this.checkSavingAllowed();
      }
    });
  }

  onGenreChange(genreIds: number[]) {
    this.media.genreIds = genreIds;
    this.applyChanges();
    this.checkSavingAllowed();
  }

  onOpenMenu(episodeDetails: EpisodeDetail[] | null, season: number, episode: number) {
    if (!this.isSmallScreen.matches) return;

    history.pushState(null, document.title, location.href);
    window.addEventListener("popstate", () => {
      if (this.isBottomSheetOpen) this._bottomSheet.dismiss();
    });

    this.isBottomSheetOpen = true;
    const data = {
      media: this.media,
      episodeDetails,
      season,
      episode,
    };

    return this._bottomSheet
      .open<EpisodeDetailsMenuBottomSheetComponent, any, EpisodeDetailsMenuBottomSheetReturnData>(
        EpisodeDetailsMenuBottomSheetComponent,
        {
          data,
          autoFocus: "first-tabbable",
          panelClass: "bottom-sheet-normal",
        }
      )
      .afterDismissed()
      .pipe(take(1))
      .subscribe((result) => {
        if (!result) return;

        // Spezialepisode bearbeiten
        if ("edit" in result) {
          this.mediaDialogEpisodeDetailService
            .openEditEpisodeDetail(this.media, { episodeDetailId: result.episodeDetailId })
            .subscribe((result) => {
              if (!result) return;
              this.media = result;

              this.applyChanges();
              this.checkSavingAllowed();
            });
        }

        //Detail mit Index löschen
        else if ("episodeDetailId" in result) {
          this.onDeleteEpisodeDetailById(result);
        }

        // Staffel bearbeiten
        else if ("season" in result) {
          this.onEditSeason(result.season);
        }

        // Änderungen übernehmen
        else if ("media" in result) {
          this.media = result.media;

          this.applyChanges();
          this.checkSavingAllowed();
        }
      });
  }

  openEditEpisodeDetail(data: ReturnValueEditEpisodeDetailById) {
    this.mediaDialogEpisodeDetailService
      .openEditEpisodeDetail(this.media, data)
      .subscribe((result) => {
        if (!result) return;
        this.media = result;

        this.applyChanges();
        this.checkSavingAllowed();
      });
  }

  openAddEpisodeDetail(data: ReturnValueAddEpisodeDetail) {
    this.mediaDialogEpisodeDetailService
      .openEditEpisodeDetail(this.media, data)
      .subscribe((result) => {
        if (!result) return;
        this.media = result;

        this.applyChanges();
        this.checkSavingAllowed();
      });
  }

  onEditSeason(season: number) {
    const oldMedia = cloneDeep(this.media);

    this.mediaDialogSeasonService.open(this.media, season).subscribe((result) => {
      if (result === undefined) return;

      if (result.delete) {
        // Staffel hat Notizen
        const episodeDetails = this.media.episodeDetails.filter(
          (episode) => episode.season === season
        );

        this.media.episodeDetails = this.media.episodeDetails
          .filter((episode) => episode.season !== season)
          .map((episodeDetail) => {
            episodeDetail.season = this.moveSeasonIfDeleted(
              episodeDetail.season,
              episodeDetail.episode,
              season - 1
            );

            return episodeDetail;
          });

        this.media = result.media;
        this.applyChanges();
        this.checkSavingAllowed();

        if (episodeDetails.length) {
          this.notificationService
            .show(NotificationTemplateType.SEASON_CONTAINS_EPISODES_WITH_DETAILS, {
              messageReplace: episodeDetails.length.toString(),
            })
            ?.subscribe((_) => {
              this.media = oldMedia;
              this.applyChanges();
              this.checkSavingAllowed();
            });
        }
      } else {
        this.media = result.media;
        this.applyChanges();
        this.checkSavingAllowed();
      }
    });
  }

  onDeleteEpisodeDetailById(data: ReturnValueDeleteEpisodeDetailById) {
    this.media.removeEpisodeDetailById(data.episodeDetailId);

    this.applyChanges();
    this.checkSavingAllowed();
  }

  onMediaChange(media: Media, key?: keyof Media) {
    this.media = media;

    if (key === "name" || key === "nameOriginal") this.onMediaTitleChanged(this.media);

    this.applyChanges();
    this.checkSavingAllowed();
  }

  onTagsChange(tags: string[]) {
    this.media.tags = tags;
    this.applyChanges();
    this.checkSavingAllowed();
  }

  onQuickErrorButtonClick(errors: QuickAddButton[]) {
    const before = "<span class='error-highlight'>";
    const after = "</span>";

    const data: DialogData = {
      title: "ERRORS",
      icons: ["error"],
      text: errors
        .map(
          (error) =>
            `${before}${this.translateService.instant(
              MEDIA_ATTRIBUTE_NAMES.get(error.key) ?? toTitleCase(error.key)
            )}: ${after}${this.media[error.key]?.toString() ?? "-"} ${UNEQUAL} ${error.text}`
        )
        .join("<br>"),
      actionPrimary: false,
      actionClose: true,
    };
    this.dialogService.open(data);
  }

  onEpisodeDown() {
    this.episode = Math.max(--this.episode, 0);
    this.calculateMinutes();
  }

  onEpisodeUp() {
    this.episode = this.episode + 1;
    this.calculateMinutes();
  }

  calculateMinutes() {
    this.minutes = this.episode * this.media.runtime;
    this.time = DateFns.roundDateTimeToMinutes(DateFns.addMinutesToCurrentDate(this.minutes), 5);
  }

  onEpisodeTimeModeChange() {
    this.episodeTimeMode = !this.episodeTimeMode;

    if (this.episodeTimeMode) {
      const minutesDiff = DateFns.getDurationBetweenDatesInMinutes(
        DateFns.setTimeStringToDate(new Date(), "23:00"),
        new Date()
      );
      const episodeCount = Math.floor(minutesDiff / this.media.runtime);
      this.episode = episodeCount;
      this.calculateMinutes();
    } else {
      this.episode = 1;
      this.calculateMinutes();
    }
  }

  /**
   * - []       Außerhalb des Verschiebungsbereich
   * - [] --+   [PreviousIndex] Aktuell verschieben
   * - []   |   Im Bereich, der neu berechnet werden muss
   * - [] <-+   [CurrentIndex] Im Bereich, der neu berechnet werden muss
   * - []       Außerhalb des Verschiebungsbereich
   */
  moveSeason(season: number, episode: number, previousIndex: number, currentIndex: number) {
    // Aktuelle Staffel, die verschoben wurde
    if (season - 1 === previousIndex) {
      season = currentIndex + 1;
    } else if (
      // Verschiebung von hinten nach vorne
      currentIndex < previousIndex &&
      // Nicht Elemente vor oder nach dem Bereich in dem verschoben wird
      season - 1 >= currentIndex &&
      season - 1 < previousIndex
    ) {
      season = season + 1;
    } else if (
      // Verschiebung von vorne nach hinten
      currentIndex > previousIndex &&
      // Nicht Elemente vor oder nach dem Bereich in dem verschoben wird
      season - 1 <= currentIndex &&
      season - 1 > previousIndex
    ) {
      season = season - 1;
    }

    return { episode, season };
  }

  moveSeasonIfDeleted(season: number, episode: number, index: number) {
    if (season - 1 > index) {
      season = season - 1;
    }

    return season;
  }

  drop(event: CdkDragDrop<Season[], Season[], Season[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.media.seasons, event.previousIndex, event.currentIndex);

      this.media.episodeDetails = this.media.episodeDetails.map((episodeDetail) => {
        const { season, episode } = this.moveSeason(
          episodeDetail.season,
          episodeDetail.episode,
          event.previousIndex,
          event.currentIndex
        );

        episodeDetail.season = season;
        episodeDetail.episode = episode;

        return episodeDetail;
      });

      if (this.media.automatic) {
        this.media.currentEpisode.episode =
          this.media.seasons[this.media.seasons.length - 1].episodes;
        this.media.currentEpisode.season = this.media.seasons.length;

        if (this.media.television) {
          if (this.media.television.episode.episode + 1 > this.media.currentEpisode.episode) {
            this.media.television.episode.episode = this.media.currentEpisode.episode + 1;

            this.media.recalculateEvents();
          }
        }
      } else {
        this.media.currentEpisode = new Episode(
          this.moveSeason(
            this.media.currentEpisode.season,
            this.media.currentEpisode.episode,
            event.previousIndex,
            event.currentIndex
          )
        );

        if (this.media.television) {
          this.media.television.episode = new Episode(
            this.moveSeason(
              this.media.currentEpisode.season,
              this.media.currentEpisode.episode,
              event.previousIndex,
              event.currentIndex
            )
          );
          this.media.recalculateEvents();
        }
      }

      this.applyChanges();
      this.checkSavingAllowed();
    }
  }

  onMediaTypeChanged(type: MediaEnum) {
    this.media.type = type;

    if (this.media.television) {
      this.media.television.episode.season = 1;
    }

    this.applyChanges();
    this.checkSavingAllowed();
  }

  onHideFromNews() {
    this.media.hideFromNews = !this.media.hideFromNews;

    this.applyChanges();
    this.checkSavingAllowed();
  }

  showEpisodesDetails() {
    const html_lineBreak = "<br />";

    const episodesText =
      this.media.totalEpisodeCountWithoutSpecialSeasons.toString() +
      " " +
      this.translateService.instant("EPISODE.S.");
    const episodeDetailsText =
      (
        this.media.totalEpisodeCount - this.media.totalEpisodeCountWithoutSpecialSeasons
      ).toString() +
      " " +
      this.translateService.instant("EPISODE.S.SPECIAL");
    const seasonsText =
      this.media.seasonsWithoutSpecialSeasons.length.toString() +
      " " +
      this.translateService.instant("SEASON.S");
    const specialSeasonsText =
      (this.media.seasons.length - this.media.seasonsWithoutSpecialSeasons.length).toString() +
      " " +
      this.translateService.instant("SEASON.SPECIALS");

    const text = [episodesText, episodeDetailsText, seasonsText, specialSeasonsText].join(
      html_lineBreak
    );

    const data: DialogData = {
      title: "SEASONS_AND_EPISODES",
      text,
      icons: ["season"],
      actionPrimary: false,
      actionClose: true,
    };

    this.dialogService.open(data).subscribe();
  }
}
