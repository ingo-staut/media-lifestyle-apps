import { all, missedAndNextOnly, previousOnly, years } from "shared/data/date-ranges.data";
import { findSourceByText } from "shared/data/discovery-source.data";
import { RATINGS } from "shared/data/rating.data";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { FilterGroupKey } from "shared/models/enum/filter.enum";
import { findRatingsByType } from "shared/models/enum/rating.enum";
import { tranformParamValueToType } from "shared/utils/type";
import { getTitleOfUrl } from "shared/utils/url";
import { FilterKey } from "../../../../../shared/models/enum/filter-keys.enum";
import { Channel } from "../models/channel.class";
import { FilterButtonTristate } from "../models/filter-button-tristate.type";
import { FilterButtonValue } from "../models/filter-button-value.type";
import { FilterDates } from "../models/filter-dates.type";
import { FilterMultiSelectDynamicData } from "../models/filter-multi-select-dynamic-data.type";
import { FilterMultiSelectSpecific } from "../models/filter-multi-select-specific.type";
import { FilterMultiSelect } from "../models/filter-multi-select.type";
import { FilterNumbers } from "../models/filter-numbers.type";
import { DEFAULT_KEY, FilterSelect } from "../models/filter-select.type";
import { FilterFunctions } from "../models/filter.functions";
import { Filter } from "../models/filter.type";
import { Media } from "../models/media.class";
import { CHANNEL_TYPES } from "./channel-type.data";
import { GENRES_GROUPS, findGenreById } from "./genres.data";
import { DATA_MEDIA_TYPE_FILTER } from "./media-type.data";
import { STATUS, findMultipleStatusByType } from "./status.data";

const filterButtonTristateDefault: FilterButtonTristate = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.TRISTATE,
  texts: ["", "", ""],
  icons: ["", "", ""],
  value: ButtonTristate.TRUE,
  show: false,
  _filterButtonTristate: "",
  func: () => true,
};

const filterButtonValueDefault: FilterButtonValue = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.VALUE,
  texts: ["", "", "", ""],
  icons: ["", "", "", ""],
  searchTerms: [],
  suffixShort: "",
  suffixLong: "",
  value: 0,
  min: false,
  show: false,
  hideNullValues: true,
  func: () => true,
};

const filterMultiSelectDefault: FilterMultiSelect<number> = {
  key: FilterKey.NONE,
  isString: false,
  groupKey: FilterGroupKey.MULTISELECT,
  texts: ["", "", "", ""],
  icons: ["", "", "", ""],
  groups: [],
  findByTypes: () => [],
  func: () => true,
  _filterMultiSelect: "",
  value: [0],
  show: false,
  noAvailable: false,
};

const filterMultiSelectSpecificDefault: FilterMultiSelectSpecific = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.MULTISELECT,
  texts: ["", "", "", ""],
  icons: ["", "", "", ""],
  groups: [],
  specialOppositeValues: [],
  // findByTypes: () => [],
  func: () => true,
  _filterMultiSelectSpecific: "",
  value: ["none"],
  show: false,
};

const filterMultiSelectDynamicDataDefault: FilterMultiSelectDynamicData = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.MULTISELECT,
  texts: ["", "", "", ""],
  icons: ["", "", "", ""],
  func: () => true,
  value: ["none"],
  dynamicDataIndex: 0,
  show: false,
  noAvailable: false,
};

const filterYearsDefault: FilterNumbers = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.DATES,
  texts: [""],
  icons: [""],
  data: [],
  _filterNumbers: "",
  valueDefault: "",
  func: () => true,
  value: "",
  show: false,
  additionalTermsRequired: [],
};

const filterDatesDefault: FilterDates = {
  key: FilterKey.NONE,
  groupKey: FilterGroupKey.DATES,
  texts: [""],
  icons: [""],
  data: [],
  _filterDates: "",
  func: () => true,
  value: "today",
  show: false,
  additionalTermsRequired: [],
};

const filterMediaTypesDefault: FilterSelect = {
  key: FilterKey.NONE,
  show: false,
  groupKey: FilterGroupKey.MEDIA,
  texts: [""],
  icons: [""],
  value: DEFAULT_KEY,
  data: [],
  _filterSelect: "",
  func: () => true,
};

export const FILTERS: Filter[] = [
  {
    ...filterMediaTypesDefault,
    key: FilterKey.MEDIA_TYPE,
    data: DATA_MEDIA_TYPE_FILTER,
    texts: ["SERIES_AND_MOVIES"],
    icons: ["media"],
    alsoSingular: true,
    func: (media: Media, filter: FilterSelect) => {
      if (!filter.show || filter.value === DEFAULT_KEY) return true;
      return filter.value === media.type.toLowerCase();
    },
  },
  {
    ...filterYearsDefault,
    key: FilterKey.YEARS,
    texts: ["YEAR.S"],
    icons: ["calendar"],
    data: years,
    value: "this-year",
    valueDefault: "this-year",
    func: (media: Media, filter: FilterNumbers) => {
      return (
        FilterFunctions.filterNumbersShowMedia(media.yearStart, filter) ||
        (FilterFunctions.filterNumbersShowMedia(media.yearEnd, filter) && !!media.yearEnd)
      );
    },
  },
  {
    ...filterDatesDefault,
    key: FilterKey.LAST_EDITED,
    texts: ["LAST_EDITED"],
    additionalTermsRequired: ["edited", "bearbeitet", "editado", "édité"],
    icons: ["last-edited"],
    extraIcon: "last-edited",
    data: previousOnly,
    func: (media: Media, filter: FilterDates) => {
      return FilterFunctions.filterDatesShowMedia(media.editHistory, filter);
    },
  },
  {
    ...filterDatesDefault,
    key: FilterKey.CREATED,
    texts: ["CREATED"],
    icons: ["added"],
    extraIcon: "added",
    data: previousOnly,
    func: (media: Media, filter: FilterDates) => {
      return FilterFunctions.filterDatesShowMedia([media.creationDate], filter);
    },
  },
  {
    ...filterDatesDefault,
    key: FilterKey.EPISODES_CURRENTLY_IN_TELEVISION,
    texts: ["TELEVISION.EPISODES"],
    additionalTermsRequired: ["episoden im tv", "episodes in tv"],
    icons: ["episodes-in-television"],
    extraIcon: "episodes-in-television",
    data: all,
    func: (media: Media, filter: FilterDates) => {
      const dates = media.television?._episodesInTelevision?.map((episodeInTV) => episodeInTV.date);
      return FilterFunctions.filterDatesShowMedia(dates ?? [], filter);
    },
  },
  {
    ...filterDatesDefault,
    key: FilterKey.AVAILABLE_UNTIL,
    texts: ["AVAILABLE_UNTIL"],
    additionalTermsRequired: ["anschauen bis", "watch until", "ablaufdatum"],
    icons: ["calendar-until"],
    extraIcon: "calendar-until",
    data: missedAndNextOnly,
    func: (media: Media, filter: FilterDates) => {
      return FilterFunctions.filterDatesShowMedia(
        media.availableUntil ? [media.availableUntil] : [],
        filter
      );
    },
  },
  {
    ...filterMultiSelectDynamicDataDefault,
    key: FilterKey.URLS_WATCH,
    texts: ["URL.S.WATCH", "URL.S.NOT.WATCH", "DO_NOT_FILTER", "URL.S.CHOOSE.WATCH"],
    icons: ["stream", "stream-not", "filter-not", "stream"],
    extraIcons: ["url", "stream"],
    dynamicDataIndex: 0,
    noAvailable: true,
    func: (media: Media, filter: FilterMultiSelectDynamicData) => {
      if (!filter.show) return true;

      return (
        media.urlsWatch.some((url) => {
          return filter.value?.some((value) => {
            if (typeof value === "string")
              return getTitleOfUrl(url.url).toLowerCase() === value.toLowerCase();
            return false;
          });
        }) ||
        filter.value.length === 0 ||
        filter.value[0] === "none" ||
        // Keine Urls
        (filter.value.includes("no") && media.urlsWatch.length === 0)
      );
    },
  },
  {
    ...filterMultiSelectDynamicDataDefault,
    key: FilterKey.URLS_VIDEO,
    texts: ["URL.S.VIDEO", "URL.S.NOT.VIDEO", "DO_NOT_FILTER", "URL.S.CHOOSE.VIDEO"],
    icons: ["video", "video-not", "filter-not", "video"],
    extraIcons: ["url", "video"],
    dynamicDataIndex: 1,
    noAvailable: true,
    func: (media: Media, filter: FilterMultiSelectDynamicData) => {
      if (!filter.show) return true;

      return (
        media.urlsVideo.some((url) => {
          return filter.value?.some((value) => {
            if (typeof value === "string")
              return getTitleOfUrl(url.url).toLowerCase() === value.toLowerCase();
            return false;
          });
        }) ||
        filter.value.length === 0 ||
        filter.value[0] === "none" ||
        // Keine Urls
        (filter.value.includes("no") && media.urlsVideo.length === 0)
      );
    },
  },
  {
    ...filterMultiSelectDynamicDataDefault,
    key: FilterKey.URLS_INFO,
    texts: ["URL.S.INFO", "URL.S.NOT.INFO", "DO_NOT_FILTER", "URL.S.CHOOSE.INFO"],
    icons: ["info", "info-not", "filter-not", "info"],
    extraIcons: ["url", "info"],
    dynamicDataIndex: 2,
    noAvailable: true,
    func: (media: Media, filter: FilterMultiSelectDynamicData) => {
      if (!filter.show) return true;

      return (
        media.urlsInfo.some((url) => {
          return filter.value?.some((value) => {
            if (typeof value === "string")
              return getTitleOfUrl(url.url).toLowerCase() === value.toLowerCase();
            return false;
          });
        }) ||
        filter.value.length === 0 ||
        filter.value[0] === "none" ||
        // Keine Urls
        (filter.value.includes("no") && media.urlsInfo.length === 0)
      );
    },
  },
  {
    ...filterMultiSelectDynamicDataDefault,
    key: FilterKey.CHANNELS,
    texts: ["CHANNEL.S", "CHANNEL.NONE", "DO_NOT_FILTER", "CHANNEL.CHOOSE"],
    icons: ["channel", "channel-not", "filter-not", "channel"],
    extraIcons: ["channel"],
    dynamicDataIndex: 3,
    noAvailable: true,
    func: (media: Media, filter: FilterMultiSelectDynamicData) => {
      if (!filter.show) return true;

      if (!media.television) return filter.value.includes("no") || filter.value.length === 0;

      return filter.value.some((channelId) => media.television!.channelId === channelId);
    },
  },
  {
    ...filterMultiSelectDefault,
    key: FilterKey.CHANNEL_TYPES,
    isString: true,
    texts: ["CHANNEL.TYPE.", "CHANNEL.TYPE.NONE", "DO_NOT_FILTER", "CHANNEL.TYPE.CHOOSE"],
    icons: ["channel", "channel-not", "filter-not", "channel"],
    groups: CHANNEL_TYPES,
    noAvailable: true,
    value: ["none"],
    findByTypes: findMultipleStatusByType,
    func: (media: Media, filter: FilterMultiSelect<string>, channels: Channel[]) => {
      if (!filter.show) return true;
      if (filter.value.some((v: any) => v === "no" || v === "none") && !media.television)
        return true;
      if (!media.television) return false;

      const type = Channel.findChannelById(media.television.channelId, channels)?.type;
      if (!type) return false;

      return filter.value.some((v) => type === tranformParamValueToType(v));
    },
  },
  {
    ...filterMultiSelectDynamicDataDefault,
    key: FilterKey.LANGUAGES,
    texts: ["LANGUAGE.S", "LANGUAGE.NOT", "DO_NOT_FILTER", "LANGUAGE.CHOOSE"],
    icons: ["language", "language-not", "filter-not", "language"],
    extraIcons: ["language"],
    dynamicDataIndex: 4,
    noAvailable: true,
    func: (media: Media, filter: FilterMultiSelectDynamicData) => {
      if (!filter.show) return true;

      const valuesFromMedia = media.languagesForSearch;

      return (
        !!filter.value.some(
          (v: any) =>
            valuesFromMedia.includes(v) ||
            (v === -1 && !valuesFromMedia.length) ||
            (v === "no" && !valuesFromMedia.length)
        ) || filter.value.length === 0
      );
    },
  },
  {
    ...filterMultiSelectDynamicDataDefault,
    key: FilterKey.COUNTRIES,
    texts: ["COUNTRY.S", "COUNTRY.NOT", "DO_NOT_FILTER", "COUNTRY.CHOOSE"],
    icons: ["country", "country-not", "filter-not", "country"],
    extraIcons: ["country"],
    dynamicDataIndex: 5,
    noAvailable: true,
    func: (media: Media, filter: FilterMultiSelectDynamicData) => {
      if (!filter.show) return true;

      const valuesFromMedia = media.countriesForSearch;

      return (
        !!filter.value.some(
          (v: any) =>
            valuesFromMedia.includes(v) ||
            (v === -1 && !valuesFromMedia.length) ||
            (v === "no" && !valuesFromMedia.length)
        ) || filter.value.length === 0
      );
    },
  },
  {
    ...filterMultiSelectDynamicDataDefault,
    key: FilterKey.SOURCES,
    texts: [
      "DISCOVERY_SOURCE.S",
      "DISCOVERY_SOURCE.NOT",
      "DO_NOT_FILTER",
      "DISCOVERY_SOURCE.CHOOSE",
    ],
    icons: ["explore", "explore-not", "filter-not", "explore"],
    extraIcons: ["explore"],
    dynamicDataIndex: 6,
    noAvailable: true,
    func: (media: Media, filter: FilterMultiSelectDynamicData) => {
      if (!filter.show) return true;

      const valuesFromMedia = media.sources.map(
        (source) => findSourceByText(source)?.key ?? source
      );

      return (
        !!filter.value.some(
          (v: any) =>
            valuesFromMedia.includes(v) ||
            (v === -1 && !valuesFromMedia.length) ||
            (v === "no" && !valuesFromMedia.length)
        ) || filter.value.length === 0
      );
    },
  },
  {
    ...filterMultiSelectDefault,
    key: FilterKey.RATING,
    texts: ["RATING.", "RATING.NOT", "DO_NOT_FILTER", "RATING.CHOOSE"],
    icons: ["rating", "rating-not", "filter-not", "rating"],
    groups: RATINGS,
    noAvailable: true,
    findByTypes: findRatingsByType,
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterMultiSelectShowMedia(media.rating, filter);
    },
  },
  {
    ...filterMultiSelectDefault,
    key: FilterKey.STATUS,
    isString: true,
    texts: ["STATUS.", "", "DO_NOT_FILTER", "STATUS.CHOOSE"],
    icons: ["status", "", "filter-not", "status-choose"],
    groups: STATUS,
    value: ["none"],
    findByTypes: findMultipleStatusByType,
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterMultiSelectShowMedia(media.status, filter);
    },
  },
  {
    ...filterMultiSelectDefault,
    key: FilterKey.GENRES,
    isString: true,
    texts: ["GENRE.S", "GENRE.NO", "DO_NOT_FILTER", "GENRE.CHOOSE"],
    icons: ["tag", "tag-not", "filter-not", "tag"],
    groups: GENRES_GROUPS,
    value: ["none"],
    noAvailable: true,
    findByTypes: findMultipleStatusByType,
    func: (media: Media, filter: any) => {
      if (!filter.show) return true;

      const valuesFromMedia = media.genreIds.map((genreId) => findGenreById(genreId)?.type);

      return (
        !!filter.value.every(
          (v: any) => valuesFromMedia.includes(v) || (v === "no" && !valuesFromMedia.length)
        ) ||
        filter.value.length === 0 ||
        filter.value[0] === "none"
      );
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.FAVORITE,
    texts: ["FAVORITE.", "FAVORITE.", "FAVORITE.NO"],
    icons: ["favorite", "favorite-filled", "favorite-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(media.favorite, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.NOTE,
    texts: ["NOTE.", "NOTE.", "NOTE.NO"],
    icons: ["note", "note-filled", "note-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(media.note.trim().length > 0, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.LINKED_MEDIA,
    texts: ["LINK.LINKED_MEDIA", "LINK.LINKED_MEDIA", "LINK.NO_LINKED_MEDIA"],
    icons: ["link", "link", "unlink"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(media.linkedIds.length > 0, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.IMAGE,
    texts: ["IMAGE.", "IMAGE.", "IMAGE.NO"],
    icons: ["image", "image-filled", "image-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(media.images.length > 0, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.LIVE,
    texts: ["LIVE.", "LIVE.", "LIVE.NOT"],
    icons: ["live", "live", "live-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(media.television?.live ?? false, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.TELEVISION,
    texts: ["TELEVISION.", "TELEVISION.WITH", "TELEVISION.WITHOUT"],
    icons: ["television", "television-filled", "television-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.television, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.EPISODES_IN_TELEVISION,
    texts: ["TELEVISION.EPISODES", "TELEVISION.EPISODES", "TELEVISION.NO_EPISODES"],
    icons: ["episodes-in-television", "episodes-in-television-filled", "television-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(
        !!media.television?._episodesInTelevision,
        filter
      );
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.EPISODE_DETAILS,
    texts: ["EPISODE.S.DETAILS", "EPISODE.S.DETAILS_WITH", "EPISODE.S.DETAILS_WITHOUT"],
    icons: ["episode-details", "episode-details-filled", "episode-details-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.episodeDetails.length, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.DVD,
    texts: ["DVD.", "DVD.AVAILABLE", "DVD.NOT_AVAILABLE"],
    icons: ["dvd", "dvd-filled", "dvd-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(media.dvd, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.CINEMA,
    texts: ["CINEMA.VISIT", "CINEMA.VISIT", "CINEMA.VISIT_NOT"],
    icons: ["cinema", "cinema", "cinema-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(media.dvd, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.YEAR_START,
    texts: ["YEAR.START.", "YEAR.START.WITH", "YEAR.START.WITHOUT"],
    icons: ["calendar-start", "calendar-start-filled", "calendar-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.yearStart, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.YEAR_END,
    texts: ["YEAR.END.", "YEAR.END.WITH", "YEAR.END.WITHOUT"],
    icons: ["calendar-end", "calendar-end-filled", "calendar-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.yearEnd, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.TAGLINE,
    texts: ["TAGLINE.", "TAGLINE.WITH", "TAGLINE.WITHOUT"],
    icons: ["tagline", "tagline-filled", "tagline-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.tagline, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.AUTOMATIC,
    texts: ["AUTOMATIC.", "AUTOMATIC.", "AUTOMATIC.NOT"],
    icons: ["automatic", "automatic", "automatic-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.automatic, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.EPISODE_NUMBERING,
    texts: ["EPISODE.NUMBERING", "EPISODE.CONSECUTIVE_NUMBERING", "EPISODE.NUMBERING_PER_SEASON"],
    icons: ["consecutive-numbering", "consecutive-numbering", "numbering-per-season"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(
        !!media.consecutiveEpisodeNumbering,
        filter
      );
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.WRAP_EPISODES,
    texts: ["EPISODE.S.WRAP", "EPISODE.S.WRAP", "EPISODE.S.NOWRAP"],
    icons: ["season-wrap", "season-wrap", "season-nowrap"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.wrapSeasonEpisodes, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.YEAR_PER_SEASON,
    texts: ["YEAR.PER_SEASON", "YEAR.PER_SEASON", "YEAR.NOT_PER_SEASON"],
    icons: ["calendar", "calendar", "calendar-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.showYearPerSeason, filter);
    },
  },
  {
    ...filterButtonTristateDefault,
    key: FilterKey.INTERNATIONAL,
    texts: ["INTERNATIONAL.", "INTERNATIONAL.", "INTERNATIONAL.NOT"],
    icons: ["globe", "globe", "globe-not"],
    func: (media: Media, filter: any) => {
      return FilterFunctions.filterButtonTristateShowMedia(!!media.isInternational, filter);
    },
  },
  {
    ...filterButtonValueDefault,
    key: FilterKey.RUNTIME,
    value: 45,
    texts: ["RUNTIME.", "RUNTIME.", "RUNTIME.WITHOUT", "RUNTIME.WITH"],
    icons: ["time", "time", "time-not", "time"],
    suffixShort: "TIME.MINUTES_SHORT",
    suffixLong: "TIME.MINUTES_SHORT",
    sliderFormatAsDuration: true,
    func: (media: Media, filter: any) => {
      if (!filter.show) return true;
      if (!media.runtime && filter.hideNullValues) return false;

      return (
        ((!filter.min && media.runtime <= filter.value) ||
          (filter.min && media.runtime >= filter.value)) ??
        true
      );
    },
  },
  {
    ...filterButtonValueDefault,
    key: FilterKey.RATING_WATCHABILITY,
    value: 7,
    min: true,
    texts: [
      "RATING.WATCHABILITY.",
      "RATING.WATCHABILITY.",
      "RATING.WATCHABILITY.WITHOUT",
      "RATING.WATCHABILITY.WITH",
    ],
    icons: ["watch", "watch", "watch-not", "watch-filled"],
    searchTerms: ["watch"],
    iconDialog: "watch",
    suffixShort: "/10",
    suffixLong: "/10",
    sliderSteps: 1,
    sliderAndValueMax: 10,
    func: (media: Media, filter: any) => {
      if (!filter.show) return true;
      if (!media.ratingWatchability && filter.hideNullValues) return false;

      return (
        ((!filter.min && (media.ratingWatchability ?? 0) <= filter.value) ||
          (filter.min && (media.ratingWatchability ?? 0) >= filter.value)) ??
        true
      );
    },
  },
  {
    ...filterButtonValueDefault,
    key: FilterKey.RATING_IMDB,
    value: 7,
    min: true,
    texts: ["RATING.IMDB.", "RATING.IMDB.", "RATING.IMDB.WITHOUT", "RATING.IMDB.WITH"],
    icons: ["imdb", "imdb", "imdb-not", "imdb-filled"],
    searchTerms: ["imdb"],
    iconDialog: "imdb-color",
    suffixShort: "/10",
    suffixLong: "/10",
    sliderSteps: 0.1,
    sliderAndValueMax: 10,
    func: (media: Media, filter: any) => {
      if (!filter.show) return true;
      if (!media.ratingImdb && filter.hideNullValues) return false;

      return (
        ((!filter.min && (media.ratingImdb ?? 0) <= filter.value) ||
          (filter.min && (media.ratingImdb ?? 0) >= filter.value)) ??
        true
      );
    },
  },
  {
    ...filterButtonValueDefault,
    key: FilterKey.RATING_METASCORE,
    value: 50,
    min: true,
    texts: [
      "RATING.METASCORE.",
      "RATING.METASCORE.",
      "RATING.METASCORE.WITHOUT",
      "RATING.METASCORE.WITH",
    ],
    icons: ["metascore", "metascore", "metascore-not", "metascore-filled"],
    searchTerms: ["metascore", "metacritic"],
    iconDialog: "metascore-color",
    suffixShort: "/100",
    suffixLong: "/100",
    sliderSteps: 1,
    sliderAndValueMax: 100,
    func: (media: Media, filter: any) => {
      if (!filter.show) return true;
      if (!media.ratingMetascore && filter.hideNullValues) return false;

      return (
        ((!filter.min && (media.ratingMetascore ?? 0) <= filter.value) ||
          (filter.min && (media.ratingMetascore ?? 0) >= filter.value)) ??
        true
      );
    },
  },
];
