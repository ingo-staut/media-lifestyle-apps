import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { URLS_MENU_GROUP_NAMES } from "projects/series-movies/src/pipes/media-urls.pipe";
import { Action } from "shared/models/action.type";
import { RatingIndex } from "shared/models/enum/rating.enum";
import { MenuItem } from "shared/models/menu-item.type";
import { SearchEngine } from "shared/models/search-engine.type";
import { LocaleService } from "shared/services/locale.service";
import { SearchEngineApiService } from "shared/services/search-engine/search-engine.api.service";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { URL_FAVICON } from "shared/utils/url";
import { UrlService } from "../../../../../../shared/services/url.service";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { EpisodeDetailNoteTypes, EpisodeDetailType } from "../../models/enum/episode-detail.enum";
import { EpisodeInTelevision } from "../../models/episode-in-television.type";
import { Episode } from "../../models/episode.class";
import { Media } from "../../models/media.class";
import { Television } from "../../models/television.class";
import { ChannelApiService } from "../../services/channel.api.service";
import { MediaDialogEpisodeDetailsService } from "../../services/dialogs/media.dialog.episode-detail.service";
import { MediaDialogNoteService } from "../../services/dialogs/media.dialog.note.service";
import { MediaDialogRatingService } from "../../services/dialogs/media.dialog.rating.service";
import { MediaApiService } from "../../services/media.api.service";
import { MediaEpisodeService } from "../../services/media.episode.service";
import { OpenUrlOnDeviceApiService } from "../../services/open-url.api.service";

@Component({
  selector: "app-media-chip",
  templateUrl: "./media-chip.component.html",
  styleUrls: ["./media-chip.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaChipComponent {
  @Input() media!: Media;
  @Input() episodesInTV?: EpisodeInTelevision[];
  @Input() episodeInTV?: EpisodeInTelevision;
  @Input() noEpisodeInTVActions: boolean = false;
  @Input() timeInsteadOfDateOnEpisodeInTV: boolean = false;
  @Input() expanded?: boolean;
  @Input() actions: Action[];
  @Input() searchTextHighlight?: string | null;
  @Input() showSearchResultMatchScore?: boolean;
  @Input() apiSearchResult?: boolean = false;
  @Input() mediaToExplore?: boolean = false;
  @Input() selected?: boolean = false;
  @Input() lightBackground?: boolean = false;
  @Input() shadow?: boolean = false;
  @Input() outline?: boolean = true;
  @Input() showWatchability?: boolean = false;
  @Input() showYear?: boolean = false;
  @Input() genreClickable?: boolean = false;
  @Input() showNextEpisodeDetails?: boolean = false;

  // Einkaufsliste
  @Input() shoppingList: boolean = false;

  @Output() onActionClick = new EventEmitter<string>();
  @Output() onMediaClick = new EventEmitter<Media>();
  @Output() onTelevisionExpand = new EventEmitter<void>();
  @Output() onGenreClick = new EventEmitter<string>();

  URL_FAVICON = URL_FAVICON;
  EpisodeDetailType = EpisodeDetailType;
  EpisodeDetailNoteTypes = EpisodeDetailNoteTypes;
  RatingIndex = RatingIndex;
  URLS_MENU_GROUP_NAMES = URLS_MENU_GROUP_NAMES;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  onChipHovered = false;
  onGenreHovered = false;
  today = new Date();
  in2Weeks = DateFns.addDaysToDate(new Date(), 14);
  subButtonHover = false;

  constructor(
    protected translateService: TranslateService,
    protected localeService: LocaleService,
    protected channelApiService: ChannelApiService,
    private mediaApiService: MediaApiService,
    private mediaDialogService: MediaDialogService,
    private mediaDialogNoteService: MediaDialogNoteService,
    private mediaDialogRatingService: MediaDialogRatingService,
    private urlService: UrlService,
    protected openUrlOnDeviceApiService: OpenUrlOnDeviceApiService,
    protected searchEngineApiService: SearchEngineApiService,
    protected mediaEpisodeService: MediaEpisodeService,
    protected mediaDialogEpisodeDetailService: MediaDialogEpisodeDetailsService
  ) {}

  onFavorite(event: Event): void {
    event.stopPropagation();
    this.media.favorite = !this.media.favorite;
    this.mediaApiService.saveAndReloadMedia(this.media);
  }

  onNote(event: Event) {
    event.stopPropagation();

    this.mediaDialogNoteService.open(this.media).subscribe((result) => {
      if (result === undefined) return;

      this.media.note = result;
      this.mediaApiService.saveAndReloadMedia(this.media);
    });
  }

  onOpen(event: Event) {
    event.stopPropagation();

    if (this.apiSearchResult) {
      this.onMediaClick.emit(this.media);
      return;
    }

    this.mediaDialogService.openAndReloadData(this.media, {
      searchText: this.searchTextHighlight ?? undefined,
    });
  }

  onOpenRatingDialog(event: Event) {
    event.stopPropagation();

    this.mediaDialogRatingService
      .open(this.media, RatingIndex.WATCHABILITY, [], [])
      .subscribe((result) => {
        if (!result) return;

        this.media.ratingWatchability = result;
        this.mediaApiService.saveAndReloadMedia(this.media);
      });
  }

  onAction(event: Event, action: Action): void {
    event.stopPropagation();
    this.onActionClick.emit(action.id);
  }

  openUrl(
    url: string,
    event?: MouseEvent,
    searchEngine?: SearchEngine,
    episodeInTV?: EpisodeInTelevision
  ) {
    if (event) event.stopPropagation();

    const episode = episodeInTV
      ? episodeInTV.episode.episode
      : this.media.currentEpisode.episode + 1;

    this.urlService.openOrCopyUrl({
      event,
      url,
      season: this.media.currentSeason,
      episode,
      title: this.media.nameOriginal || this.media.name,
      searchEngine,
    });
  }

  onRemoveTelevisionAndNextEpisode(addEpisodes: number = 1) {
    if (this.media.television) {
      this.media.television = new Television({
        channelId: this.media.television.channelId,
        onlyChannel: true,
      });
    }
    this.media.incrementCurrentEpisode(addEpisodes);
    this.media.currentEpisode = new Episode(this.media.currentEpisode);
    this.mediaApiService.saveAndReloadMedia(this.media);
  }

  onEpisodeClick(event: Event, actions: MenuItem<string>[]) {
    event.stopPropagation();
    this.mediaEpisodeService.onEpisodeClicked(this.media, actions).subscribe((resultMedia) => {
      if (!resultMedia) return;

      resultMedia.subscribe((result) => {
        if (!result) return;

        // Neuladen triggern
        this.media.episodeDetails = cloneDeep(result.episodeDetails);
      });
    });
  }

  onPreviousEpisode(event: Event) {
    event.stopPropagation();
    this.mediaEpisodeService.onPreviousEpisode(this.media);
  }

  onNextEpisode(event: Event) {
    event.stopPropagation();
    this.mediaEpisodeService.onNextEpisode(this.media);
  }

  onAddNoteToCurrentEpisode(event: Event) {
    event.stopPropagation();

    this.mediaEpisodeService
      .onAddNote(this.media, this.media.currentEpisode)
      .subscribe((resultMedia) => {
        if (!resultMedia) return;

        // Neuladen triggern
        this.media.episodeDetails = cloneDeep(resultMedia.episodeDetails);
      });
  }
}
