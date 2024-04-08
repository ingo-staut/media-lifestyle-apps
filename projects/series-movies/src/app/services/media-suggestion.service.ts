import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { hoursToMilliseconds } from "date-fns";
import { map } from "rxjs";
import { CarouselSymbol } from "shared/data/carousel-symbols.data";
import { Action } from "shared/models/action.type";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { findLandscapeImage } from "shared/utils/image";
import { getRandomElementsFromList } from "shared/utils/list";
import { URL_FAVICON } from "shared/utils/url";
import { UrlService } from "../../../../../shared/services/url.service";
import { CarouselItem } from "../components/carousel/carousel.component";
import { Channel } from "../models/channel.class";
import { Media } from "../models/media.class";
import { ChannelApiService } from "./channel.api.service";
import { MediaDialogNoteService } from "./dialogs/media.dialog.note.service";
import { MediaApiService } from "./media.api.service";

@Injectable({
  providedIn: "root",
})
export class MediaSuggestionService {
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  readonly NOTE_ID = "note";
  readonly FAVORITE_ID = "favorite";
  readonly TRAILER_ID = "trailer";
  readonly WATCH_ID = "watch";

  constructor(
    private mediaApiService: MediaApiService,
    private translateService: TranslateService,
    private channelApiService: ChannelApiService,
    private mediaDialogNoteService: MediaDialogNoteService,
    private urlService: UrlService
  ) {}

  mediaSuggestionsForCarousel$ = this.mediaApiService.media$.pipe(
    map((media) => {
      const items: CarouselItem[] = [];
      const totalSuggestionsCount = 6;
      const minRandomCount = 1;
      const maxRandomCount = 2;
      const minMediaToExploreCount = 3;

      this.findLiveTodayMedia(media, items);
      this.findSeriesStart(media, items);
      this.findSeasonStart(media, items);
      this.findMediaToExplore(media, items, minMediaToExploreCount, totalSuggestionsCount);
      this.findRandomMedia(media, items, minRandomCount, maxRandomCount, totalSuggestionsCount);

      items.map(async (item) => {
        if (item.media && item.media.images.length !== 0) {
          const landscapeImage = await findLandscapeImage(item.media.images);
          item.noVerticalImageAnimation = !!landscapeImage;
          // ! Überschreibt alle Bilder, die potenziell unten gesetzt werden
          item.image = landscapeImage ?? item.media.images[0];
        }

        return item;
      });

      return items.sort((a, b) => b.sortIndex - a.sortIndex);
    })
  );

  /**
   * Zufällige Medien finden
   */
  private findRandomMedia(
    media: Media[],
    suggestions: CarouselItem[],
    minCount: number,
    maxCount: number,
    totalSuggestionsCount: number
  ) {
    const possibleSuggestions = media.filter(
      (m) =>
        !suggestions.some((suggestion) => suggestion.id === m.id) &&
        m.favorite === false &&
        !m.hasTelevision
    );

    const newSuggestions = [...possibleSuggestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(Math.min(totalSuggestionsCount - suggestions.length, maxCount), minCount));

    suggestions.push(...newSuggestions.map((m) => this.getRandomMediaAsCarouselItemByMedia(m)));
  }

  private getRandomMediaAsCarouselItemByMedia(media: Media): CarouselItem {
    const urlVideoWithPrioTrailer = media.urlVideoWithPrioTrailer;
    const buttons: Action[] = [];

    this.getFavoriteButton(buttons, !!urlVideoWithPrioTrailer);
    this.getTrailerButton(media, buttons);

    const data: CarouselItem = {
      id: media.id,
      title: media.name,
      text: "SUGGESTION.RANDOM." + (media.isMovie ? "MOVIE" : "SERIES"),
      icon: "random",
      symbol: CarouselSymbol.CROSS,
      buttons,
      media,
      sortIndex: 1,
      showMediaDetails: true,
      func: (actionId: string, event: MouseEvent) => {
        this.handleClick(media, actionId, event);
      },
    };

    return data;
  }

  /**
   * Zufällige Medien finden
   */
  private findMediaToExplore(
    media: Media[],
    suggestions: CarouselItem[],
    minCount: number,
    totalSuggestionsCount: number
  ) {
    const possibleSuggestions = media.filter(
      (m) =>
        !suggestions.some((suggestion) => suggestion.id === m.id) &&
        !m.favorite &&
        !m.isFuture &&
        m.isExplore &&
        !m.wasEditedTheLast5Days // Evtl. auch längerer Zeitraum zurück
    );

    const newSuggestions = getRandomElementsFromList(
      possibleSuggestions,
      Math.max(totalSuggestionsCount - suggestions.length, minCount)
    );

    suggestions.push(...newSuggestions.map((m) => this.getMediaToExploreAsCarouselItemByMedia(m)));
  }

  private getMediaToExploreAsCarouselItemByMedia(media: Media): CarouselItem {
    const urlVideoWithPrioTrailer = media.urlVideoWithPrioTrailer;
    const buttons: Action[] = [];

    this.getFavoriteButton(buttons, !!urlVideoWithPrioTrailer);
    this.getTrailerButton(media, buttons);

    const data: CarouselItem = {
      id: media.id,
      title: media.name,
      text: "EXPLORE." + (media.isMovie ? "MOVIE" : "SERIES"),
      icon: "explore",
      buttons,
      media,
      sortIndex: 3,
      showMediaDetails: true,
      func: (actionId: string, event: MouseEvent) => {
        this.handleClick(media, actionId, event);
      },
    };

    return data;
  }

  /**
   * Medien finden, die heute Live sind
   */
  private findLiveTodayMedia(media: Media[], suggestions: CarouselItem[]) {
    media.forEach((media) => {
      if (
        media.television &&
        media.television.live &&
        media.television._episodesInTelevision?.some((episode) => DateFns.isToday(episode.date)) &&
        // Existiert noch nicht bei den Vorschlägen
        !suggestions.some((suggestion) => suggestion.id === media.id)
      ) {
        suggestions.push(
          this.getLiveTodayMediaAsCarouselItemByMedia(
            media,
            this.channelApiService.channelsSnapshot
          )
        );
      }
    });
  }

  private getLiveTodayMediaAsCarouselItemByMedia(media: Media, channels: Channel[]): CarouselItem {
    const channel = Channel.findChannelById(media.television?.channelId ?? "", channels);
    const urlLivestream = channel?.urlLive;
    const urlChannel = channel?.url;
    const url = urlLivestream ? urlLivestream : urlChannel;
    const episodeInTV = media.television?._episodesInTelevision?.find((episode) =>
      DateFns.isToday(episode.date)
    );
    const buttons = url
      ? [
          {
            id: "livestream",
            text: "LIVESTREAM",
            tooltip: url,
            icon: "",
            image: URL_FAVICON + url,
          },
        ]
      : [];

    if (!url) this.getTrailerButton(media, buttons);

    // Zeit bis Mitternacht
    const sortIndex = episodeInTV
      ? Math.abs(episodeInTV.date.getTime() - new Date().getTime() - hoursToMilliseconds(24))
      : 10;

    const data: CarouselItem = {
      id: media.id,
      symbol: CarouselSymbol.STAR,
      title: media.name,
      text: "LIVE.",
      icon: "live",
      television: media.television,
      episodeInTV,
      buttons,
      media,
      sortIndex,
      func: (actionId: string, event: MouseEvent) => {
        if (actionId === "livestream") {
          this.urlService.openOrCopyUrl({ event, url });
        }
        this.handleClick(media, actionId, event);
      },
    };

    return data;
  }

  /**
   * Medien finden, die heute Live sind
   */
  private findSeriesStart(media: Media[], suggestions: CarouselItem[]) {
    media.forEach((media) => {
      if (
        !media.isMovie &&
        media.television &&
        media.television._episodesInTelevision?.some(
          (episodeInTv) =>
            DateFns.isToday(episodeInTv.date) &&
            episodeInTv.episode.episode === 1 &&
            episodeInTv.episode.season === 1
        ) &&
        // Existiert noch nicht bei den Vorschlägen
        !suggestions.some((suggestion) => suggestion.id === media.id)
      ) {
        suggestions.push(this.getSeriesStartAsCarouselItemByMedia(media));
      }
    });
  }

  private getSeriesStartAsCarouselItemByMedia(media: Media): CarouselItem {
    const urlWatch = media.urlWatch;
    const buttons: Action[] = [];

    this.getTrailerButton(media, buttons, !!urlWatch);

    if (urlWatch) {
      buttons.push({
        id: this.WATCH_ID,
        text: "WATCH_VALUE",
        textReplace: "1. " + this.translateService.instant("EPISODE."),
        tooltip: this.translateService.instant("WATCH") + ": " + urlWatch.url,
        icon: "",
        image: URL_FAVICON + urlWatch.url,
      });
    }

    const data: CarouselItem = {
      id: media.id,
      symbol: CarouselSymbol.STAR,
      title: media.name,
      text: "START_OF_SERIES",
      icon: "season-new",
      television: media.television,
      buttons,
      media,
      sortIndex: 5,
      func: (actionId: string, event: MouseEvent) => {
        this.handleClick(media, actionId, event);
      },
    };

    return data;
  }

  /**
   * Medien finden, die heute Live sind
   */
  private findSeasonStart(media: Media[], suggestions: CarouselItem[]) {
    media.forEach((media) => {
      if (
        !media.isMovie &&
        media.television &&
        media.television._episodesInTelevision?.some(
          (episodeInTv) => DateFns.isToday(episodeInTv.date) && episodeInTv.episode.episode === 1
        ) &&
        // Existiert noch nicht bei den Vorschlägen
        !suggestions.some((suggestion) => suggestion.id === media.id)
      ) {
        suggestions.push(this.getSeasonStartAsCarouselItemByMedia(media));
      }
    });
  }

  private getSeasonStartAsCarouselItemByMedia(media: Media): CarouselItem {
    const episodeInTV = media.television?._episodesInTelevision![0]!;
    const urlWatch = media.urlWatch;
    const buttons: Action[] = [];

    this.getTrailerButton(media, buttons, !!urlWatch);

    if (urlWatch) {
      buttons.push({
        id: this.WATCH_ID,
        text: "WATCH_VALUE",
        textReplace: `S${episodeInTV.episode.season} E${episodeInTV.episode.episode}`,
        tooltip: this.translateService.instant("WATCH") + ": " + urlWatch.url,
        icon: "",
        image: URL_FAVICON + urlWatch.url,
      });
    }

    const data: CarouselItem = {
      id: media.id,
      symbol: CarouselSymbol.STAR,
      title: media.name,
      text: "START_OF_SEASON",
      icon: "season-new",
      television: media.television,
      buttons,
      media,
      sortIndex: 4,
      func: (actionId: string, event: MouseEvent) => {
        this.handleClick(media, actionId, event);
      },
    };

    return data;
  }

  private getFavoriteButton(buttons: Action[], onlyIcon: boolean) {
    const action: Action = {
      id: "favorite",
      text: "FAVORITE.",
      tooltip: "FAVORITE.ADD",
      icon: "favorite",
      onlyIcon,
    };

    buttons.push(action);
  }

  private handleFavoriteClick(media: Media, actionId: string) {
    if (actionId === this.FAVORITE_ID) {
      media.favorite = true;
      this.mediaApiService.saveAndReloadMedia(media);
      return true;
    }
    return false;
  }

  private getTrailerButton(media: Media, buttons: Action[], onlyIcon: boolean = false) {
    const url = media.urlVideoWithPrioTrailer;
    if (!url) return;

    const action: Action = {
      id: "trailer",
      text: "WATCH_VALUE",
      textReplace: "URL.TYPE.TRAILER",
      tooltip:
        (media.urlTrailer
          ? this.translateService.instant("URL.TYPE.TRAILER")
          : this.translateService.instant("URL.TYPE.VIDEO")) +
        ": " +
        url.url,
      icon: "",
      image: URL_FAVICON + url.url,
      onlyIcon,
    };

    if (url.url) buttons.push(action);
  }

  private handleTrailerClick(media: Media, actionId: string, event: MouseEvent) {
    const url = media.urlVideoWithPrioTrailer;

    if (actionId === this.TRAILER_ID && url) {
      this.urlService.openOrCopyUrl({
        event,
        url,
        season: media.currentSeason,
        episode: media.currentEpisode.episode - 1,
        year: media.yearStart,
      });
      return true;
    }
    return false;
  }

  private handleWatchClick(media: Media, actionId: string, event: MouseEvent) {
    const url = media.urlWatch;

    if (actionId === this.WATCH_ID && url) {
      this.urlService.openOrCopyUrl({
        event,
        url,
        season: media.currentSeason,
        episode: media.currentEpisode.episode - 1,
        year: media.yearStart,
      });
      return true;
    }
    return false;
  }

  private getNoteButton(media: Media, buttons: Action[], onlyIcon: boolean) {
    const action: Action = {
      id: this.NOTE_ID,
      text: media.note,
      tooltip: media.note,
      icon: "note-filled",
      onlyIcon,
    };

    if (media.note) buttons.push(action);
  }

  private handleNoteClick(media: Media, actionId: string) {
    if (actionId === this.NOTE_ID) {
      this.mediaDialogNoteService.open(media).subscribe((result) => {
        if (result === undefined) return;

        media.note = result;
        this.mediaApiService.saveAndReloadMedia(media);
      });
      return true;
    }
    return false;
  }

  private handleClick(media: Media, actionId: string, event: MouseEvent) {
    if (this.handleNoteClick(media, actionId)) return;
    if (this.handleFavoriteClick(media, actionId)) return;
    if (this.handleTrailerClick(media, actionId, event)) return;
    if (this.handleWatchClick(media, actionId, event)) return;
  }
}
