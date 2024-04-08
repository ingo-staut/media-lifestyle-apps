import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { combineLatest, take } from "rxjs";
import {
  findLanguageByText,
  findLanguageIconByText,
  getLanguageIconByKey,
} from "shared/data/language.data";
import { getUrlTypeIconByUrlType } from "shared/data/url-type.data";
import { LocaleService } from "shared/services/locale.service";
import { DateFns } from "shared/utils/date-fns";
import { URL_FAVICON, getTitleOfUrl, getUrlTypeNoteByUrl } from "shared/utils/url";
import { findGenreById } from "../data/genres.data";
import { Channel } from "../models/channel.class";
import { Media } from "../models/media.class";
import { ChannelApiService } from "./channel.api.service";
import { QuickAddButton, Strategy } from "./request-apis/request.api.service";

@Injectable({
  providedIn: "root",
})
export class QuickAddButtonService {
  constructor(
    private translateService: TranslateService,
    private localeService: LocaleService,
    private channelApiService: ChannelApiService
  ) {}

  getQuickAddButton(media: Media): QuickAddButton[] {
    const quickAddData: QuickAddButton[] = [];

    if (media.name) {
      quickAddData.push({
        key: "name",
        value: media.name,
        text: media.name,
        icons: ["rename"],
        strategy: Strategy.REPLACE,
      });
    }

    if (media.nameOriginal && media.nameOriginal.toLowerCase() !== media.name.toLowerCase()) {
      quickAddData.push({
        key: "nameOriginal",
        value: media.nameOriginal,
        text: media.nameOriginal,
        icons: ["rename"],
        strategy: Strategy.REPLACE,
      });
    }

    if (media.tagline) {
      quickAddData.push({
        key: "tagline",
        value: media.tagline,
        text: media.tagline,
        icons: ["tagline"],
        strategy: Strategy.REPLACE,
      });
    }

    if (media.yearStart) {
      quickAddData.push({
        key: "yearStart",
        value: media.yearStart,
        text: media.yearStart.toString(),
        icons: [media.isMovie ? "calendar" : "calendar-start"],
        strategy: Strategy.REPLACE,
      });
    }

    if (media.yearEnd) {
      quickAddData.push({
        key: "yearEnd",
        value: media.yearEnd,
        text: media.yearEnd.toString(),
        icons: ["calendar-end"],
        strategy: Strategy.REPLACE,
      });
    }

    if (media.runtime) {
      quickAddData.push({
        key: "runtime",
        value: media.runtime,
        text: media.runtime.toString() + " " + this.translateService.instant("TIME.MINUTES_SHORT"),
        icons: ["time"],
        strategy: Strategy.REPLACE,
      });
    }

    if (media.ratingImdb) {
      quickAddData.push({
        key: "ratingImdb",
        value: media.ratingImdb,
        text: media.ratingImdb.toString(),
        icons: ["imdb-color"],
        strategy: Strategy.REPLACE,
      });
    }

    if (media.ratingMetascore) {
      quickAddData.push({
        key: "ratingMetascore",
        value: media.ratingMetascore,
        text: media.ratingMetascore.toString(),
        icons: ["metascore-color"],
        strategy: Strategy.REPLACE,
      });
    }

    if (media.genreIds.length) {
      media.genreIds.forEach((genreId) => {
        const genre = findGenreById(genreId);
        if (genre) {
          quickAddData.push({
            key: "genreIds",
            value: genreId,
            text: genre.name,
            icons: [genre.icon],
            strategy: Strategy.APPEND,
          });
        }
      });
    }

    if (media.languages.length) {
      media.languages.forEach((language) => {
        const lang = findLanguageByText(language);
        if (lang) {
          quickAddData.push({
            key: "languages",
            value: lang.key, // Sollte gleich dem `language` sein
            text: lang.name,
            icons: [lang.icon],
            strategy: Strategy.APPEND,
          });
        } else {
          quickAddData.push({
            key: "languages",
            value: language,
            text: language,
            icons: [],
            strategy: Strategy.APPEND,
          });
        }
      });
    }

    if (media.countries.length) {
      media.countries.forEach((country) => {
        const icon = findLanguageIconByText(country);
        quickAddData.push({
          key: "countries",
          value: country,
          text: country,
          icons: icon ? [icon] : [],
          strategy: Strategy.APPEND,
        });
      });
    }

    if (media.television) {
      combineLatest([this.localeService.locale$, this.channelApiService.channels$])
        .pipe(take(1))
        .subscribe(([locale, channels]) => {
          const list: string[] = [];

          const channel = Channel.findChannelById(media.television!.channelId, channels);
          if (channel) list.push(this.translateService.instant(channel.name));

          if (media.television!.date)
            list.push(DateFns.formatDateExtraShortWithShortDay(media.television!.date, locale));

          const images = channel ? [channel.displayIcon] : [];
          const icons = channel ? [] : ["television"];
          quickAddData.push({
            key: "television",
            value: media.television,
            text: list.join(", "),
            images,
            icons,
            strategy: Strategy.REPLACE,
          });
        });
    }

    if (media.urlsInfo.length) {
      media.urlsInfo.forEach((url) => {
        const icon = getUrlTypeIconByUrlType(url.type, false);
        const icons = icon ? [icon] : [];
        quickAddData.push({
          key: "urlsInfo",
          value: url,
          text: getTitleOfUrl(url.url),
          tooltip: getUrlTypeNoteByUrl(url, this.translateService),
          icons,
          images: [URL_FAVICON + url.url],
          strategy: Strategy.APPEND,
        });
      });
    }

    if (media.urlsVideo.length) {
      media.urlsVideo.forEach((url) => {
        const icon = getUrlTypeIconByUrlType(url.type, false);
        const icons = icon ? [icon] : [];
        const languageIcon = getLanguageIconByKey(url.language, false);
        if (languageIcon) {
          icons.push(languageIcon);
        }
        quickAddData.push({
          key: "urlsVideo",
          value: url,
          text: getTitleOfUrl(url.url),
          tooltip: getUrlTypeNoteByUrl(url, this.translateService),
          icons,
          images: [URL_FAVICON + url.url],
          strategy: Strategy.APPEND,
        });
      });
    }

    if (media.images.length) {
      media.images.forEach((image) => {
        quickAddData.push({
          key: "images",
          value: image,
          tooltip: image,
          images: [image],
          strategy: Strategy.APPEND,
          appendAtFront: true,
        });
      });
    }

    if (media.tags.length) {
      media.tags.forEach((tag) => {
        quickAddData.push({
          key: "tags",
          value: tag,
          text: tag,
          strategy: Strategy.APPEND,
        });
      });
    }

    if (media.seasons.length) {
      const totalEpisodeCount = media.totalEpisodeCount;

      quickAddData.push({
        key: "seasons",
        value: media.seasons,
        text:
          media.seasons.map((season) => season.episodes.toString()).join(", ") +
          ` (${media.seasons.length} ${this.translateService.instant(
            "SEASON.S"
          )}, ${totalEpisodeCount} ${this.translateService.instant("EPISODE.S.")})`,
        icons: ["season"],
        strategy: Strategy.REPLACE,
      });
    }

    return quickAddData;
  }
}
