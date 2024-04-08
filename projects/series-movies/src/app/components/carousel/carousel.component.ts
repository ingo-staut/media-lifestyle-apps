import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";
import { environment } from "projects/series-movies/src/environments/environment";
import { CarouselSymbol } from "shared/data/carousel-symbols.data";
import { Action } from "shared/models/action.type";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { MediaDialogService } from "../../dialogs/media-dialog/media-dialog.service";
import { EpisodeInTelevision } from "../../models/episode-in-television.type";
import { Media } from "../../models/media.class";
import { Television } from "../../models/television.class";
import { ChannelApiService } from "../../services/channel.api.service";

export type CarouselItem = {
  id: string;
  symbol?: string;
  title: string;
  text: string;
  textReplace?: string;
  showMediaDetails?: boolean;
  television?: Television | null;
  episodeInTV?: EpisodeInTelevision | null;
  icon: string;
  image?: string;
  buttons: Action[];
  media?: Media;
  sortIndex: number;
  noVerticalImageAnimation?: boolean;
  func: (id: string, event: MouseEvent) => void;
  funcOpenSearch?: () => void;
};

@Component({
  selector: "app-carousel[height]",
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.scss"],
})
export class CarouselComponent implements OnChanges, OnDestroy {
  @Input() items: CarouselItem[] = [];
  @Input() height!: string;
  @Input() minHeight: string;

  @Output() actionClick = new EventEmitter<{
    item: CarouselItem;
    actionId: string;
    event: MouseEvent;
  }>();
  @Output() actionSearchClick = new EventEmitter<{ item: CarouselItem }>();

  isMobileSreen = MEDIA_QUERY_MOBILE_SCREEN;
  defaultCarouselSymbol = CarouselSymbol.CIRCLE;
  CarouselSymbol = CarouselSymbol;

  showProgressBar = this.moreThanOneItem;

  secondsMax = environment.production ? 8 : 80;
  secondsCounter = 0;
  selectedIndex = 0;
  isPaused = false;
  intervalId = this.setTimer();

  get moreThanOneItem() {
    return this.items && this.items.length > 1;
  }

  constructor(
    private mediaDialogService: MediaDialogService,
    protected channelApiService: ChannelApiService,
    protected localeService: LocaleService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["items"]) {
      this.showProgressBar = this.moreThanOneItem;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  previous() {
    if (this.moreThanOneItem)
      this.selectedIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : this.items!.length - 1;
    this.secondsCounter = 0;
  }

  next() {
    if (this.moreThanOneItem)
      this.selectedIndex = this.selectedIndex < this.items!.length - 1 ? this.selectedIndex + 1 : 0;
    this.secondsCounter = 0;
  }

  onMouseEnter() {
    this.isPaused = true;
  }

  onMouseLeave() {
    this.isPaused = false;
  }

  start() {
    this.showProgressBar = this.moreThanOneItem;
    this.intervalId = this.setTimer();
  }

  updateTimer() {
    this.secondsCounter++;
  }

  setTimer() {
    return setInterval(() => {
      if (!this.isPaused) this.updateTimer();

      if (this.secondsCounter >= this.secondsMax) {
        clearInterval(this.intervalId);
        this.secondsCounter = 0;
        this.next();
        this.start();
      }
    }, 1000);
  }

  onOpenMedia(event: Event, media: Media | undefined) {
    event.preventDefault();
    if (!media) return;
    this.mediaDialogService.openAndReloadData(media);
  }

  onActionClick(event: MouseEvent, actionId: string) {
    event.stopPropagation();

    this.actionClick.emit({ item: this.items[this.selectedIndex], actionId, event });
  }

  onActionSearchClick(event: Event) {
    event.stopPropagation();

    this.actionSearchClick.emit({ item: this.items[this.selectedIndex] });
  }
}
