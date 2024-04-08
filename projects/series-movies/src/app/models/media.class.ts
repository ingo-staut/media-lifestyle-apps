import { TranslateService } from "@ngx-translate/core";
import isEqual from "lodash.isequal";
import { findSourceByText } from "shared/data/discovery-source.data";
import { DiscoverySource } from "shared/models/enum/discovery-source.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { Url } from "shared/models/url.class";
import { DateFns } from "shared/utils/date-fns";
import { isSameButCanVaryByOne } from "shared/utils/number";
import { forSearch } from "shared/utils/string";
import { getIMDbIdFromUrl } from "shared/utils/url.imdb";
import { MediaEnum } from "../../../../../shared/models/enum/media.enum";
import { Cinema } from "./cinema.type";
import { EpisodeDetailType } from "./enum/episode-detail.enum";
import { StatusType } from "./enum/status.enum";
import { EpisodeDetail } from "./episode-detail.class";
import { EpisodeInTelevision } from "./episode-in-television.type";
import { Episode } from "./episode.class";
import { Linked } from "./linked";
import { Season, SeasonEpisodes } from "./season.type";
import { Television } from "./television.class";

export const MEDIA_ATTRIBUTE_NAMES = new Map<keyof Media, string>([
  ["name", "TITLE"],
  ["nameOriginal", "TITLE_ORIGINAL"],
  ["note", "NOTE."],
  ["images", "IMAGE.S"],
  ["favorite", "FAVORITE."],
  ["editHistory", ""],
  ["rating", "RATING."],
  ["currentEpisode", "EPISODE.CURRENT"],
  ["runtime", "RUNTIME."],
  ["yearStart", "YEAR.START."],
  ["yearEnd", "YEAR.END."],
  ["urlsWatch", "URL.S.WATCH"],
  ["urlsInfo", "URL.S.INFO"],
  ["urlsVideo", "URL.S.VIDEO"],
  ["rewatch", "REWATCH"],
  ["availableUntil", "AVAILABLE_UNTIL"],
  ["linkedIds", "LINK.LINKED_MEDIA"],
  ["episodeDetails", "EPISODE.S.DETAILS"],
  ["genreIds", "GENRE.S"],
  ["television", "TELEVISION."],
  ["seasons", "SEASON.S"],
  ["automatic", "AUTOMATIC."],
  ["consecutiveEpisodeNumbering", "EPISODE.CONSECUTIVE_NUMBERING"],
  ["dvd", ""],
  ["cinema", "CINEMA."],
  ["ratingImdb", "RATING."],
  ["ratingMetascore", "RATING."],
  ["tags", "TAGS"],
]);

export class Media {
  id: string;
  idOld: string;
  type: MediaEnum;
  name: string;
  nameOriginal: string;
  note: string;
  images: string[]; // Header + Preview -> Immer Seitenverhältnis checken
  favorite: boolean;
  editHistory: Date[];
  rating: number;
  currentEpisode: Episode;
  runtime: number;
  yearStart: number;
  yearEnd: number;
  urlsWatch: Url[];
  urlsInfo: Url[];
  urlsVideo: Url[];
  rewatch: number;
  availableUntil: Date | null;
  linkedIds: Linked[];
  episodeDetails: EpisodeDetail[];
  genreIds: number[];
  television: Television | null;
  seasons: Season[];
  automatic: boolean;
  consecutiveEpisodeNumbering: boolean;
  wrapSeasonEpisodes: boolean;
  showYearPerSeason: boolean;
  dvd: boolean;
  cinema: Cinema | null;
  ratingImdb: number | null;
  ratingMetascore: number | null;
  ratingWatchability: number | null;
  tags: string[];
  tagline: string;
  languages: string[];
  countries: string[];
  hideFromNews: boolean;
  sources: string[];

  _episodeInTelevision?: EpisodeInTelevision;
  _searchMatchScore: number;
  _idImdb?: string;

  constructor(media: {
    id: string;
    idOld?: string;
    type: MediaEnum;
    name?: string;
    nameOriginal?: string;
    note?: string;
    images?: string[];
    favorite?: boolean;
    editHistory?: Date[];
    rating?: number;
    currentEpisode?: Episode;
    runtime?: number;
    yearStart?: number;
    yearEnd?: number;
    urlsWatch?: Url[];
    urlsInfo?: Url[];
    urlsVideo?: Url[];
    rewatch?: number;
    availableUntil?: Date | null;
    linkedIds?: Linked[];
    episodeDetails?: EpisodeDetail[];
    genreIds?: number[];
    television?: Television | null;
    seasons?: Season[];
    consecutiveEpisodeNumbering?: boolean;
    wrapSeasonEpisodes?: boolean;
    showYearPerSeason?: boolean;
    automatic?: boolean;
    dvd?: boolean;
    cinema?: Cinema | null;
    ratingImdb?: number | null;
    ratingMetascore?: number | null;
    ratingWatchability?: number | null;
    tags?: string[];
    tagline?: string;
    languages?: string[];
    countries?: string[];
    hideFromNews?: boolean;
    sources?: string[];
  }) {
    this.id = media.id ?? "";
    this.idOld = media.idOld ?? "";
    this.type = media.type ?? MediaEnum.SERIES;
    this.name = media.name ?? "";
    this.nameOriginal = media.nameOriginal ?? "";
    this.note = media.note ?? "";
    this.images = media.images ?? [];
    this.favorite = media.favorite ?? false;
    this.editHistory = media.editHistory ?? [];
    this.rating = media.rating ?? 0;
    this.currentEpisode = media.currentEpisode ?? new Episode({ season: 0, episode: 0 });
    this.runtime = media.runtime ?? 0;
    this.yearStart = media.yearStart ?? 0;
    this.yearEnd = media.yearEnd ?? 0;
    this.urlsWatch = media.urlsWatch ?? [];
    this.urlsInfo = media.urlsInfo ?? [];
    this.urlsVideo = media.urlsVideo ?? [];
    this.rewatch = media.rewatch ?? 0;
    this.availableUntil = media.availableUntil ?? null;
    this.linkedIds = media.linkedIds ?? [];
    this.episodeDetails = media.episodeDetails ?? [];
    this.genreIds = media.genreIds ?? [];
    this.television = media.television ?? null;
    this.seasons = media.seasons ?? [];
    this.consecutiveEpisodeNumbering = media.consecutiveEpisodeNumbering ?? false;
    this.wrapSeasonEpisodes = media.wrapSeasonEpisodes ?? false;
    this.showYearPerSeason = media.showYearPerSeason ?? false;
    this.automatic = media.automatic ?? false;
    this.dvd = media.dvd ?? false;
    this.cinema = media.cinema ?? null;
    this.ratingImdb = media.ratingImdb || null;
    this.ratingMetascore = media.ratingMetascore || null;
    this.ratingWatchability = media.ratingWatchability || null;
    this.tags = media.tags ?? [];
    this.tagline = media.tagline ?? "";
    this.languages = media.languages ?? [];
    this.countries = media.countries ?? [];
    this.hideFromNews = media.hideFromNews ?? false;
    this.sources = media.sources ?? [];

    this._idImdb = this.getImdbIdFromInfoUrls();
  }

  get isMovie() {
    return this.type === MediaEnum.MOVIE;
  }

  /**
   * ## Status
   * - **Aktuell**: Episode im TV
   * - **Angefangen**: Aktuelle Episode nicht "Staffel 1, Episode 0" & nicht letzte Episode
   * - **Entdecken**: Aktuelle Episode "Staffel 1, Episode 0"
   * - **Staffelende**: Letzte Episode ausgewählt
   * - **Serienende**: Letzte Episode ausgewählt & Endjahr gesetzt
   */
  get status(): StatusType {
    if (this.isMovie) {
      if (this.isWatchedOnce) {
        return StatusType.WATCHED;
      }

      if (
        this.television &&
        this.television.date &&
        DateFns.isBeforeOrToday(this.television.date)
      ) {
        return StatusType.CURRENT;
      }

      if (
        (this.television && this.television.date && DateFns.isAfterToday(this.television.date)) ||
        DateFns.isFutureYear(this.yearStart)
      ) {
        return StatusType.IN_FUTURE;
      }

      if (!this.isWatchedOnce) {
        return StatusType.EXPLORE;
      }

      return StatusType.WATCHED;
    }

    // Episoden im TV
    // In Zukunft: Erstes Event Serienstart und in Zukunft
    const isSeriesStartInFuture =
      this.television?._episodesInTelevision?.length &&
      DateFns.isAfterToday(this.television._episodesInTelevision[0].date) &&
      this.television._episodesInTelevision[0].episode.isSeriesStart;

    if (isSeriesStartInFuture || DateFns.isFutureYear(this.yearStart)) {
      return StatusType.IN_FUTURE;
    }

    // Explore: Serienstart in Vergangenheit
    const isSeriesStartInPast =
      this.television?._episodesInTelevision?.length &&
      DateFns.isBeforeOrToday(this.television._episodesInTelevision[0].date) &&
      this.television._episodesInTelevision[0].episode.isSeriesStart;

    if (isSeriesStartInPast && !this.automatic) {
      return StatusType.EXPLORE;
    }

    // Wenn Episoden im TV, dann "Aktuell / Current"
    if (this.television?._episodesInTelevision?.length) {
      return StatusType.CURRENT;
    }

    if (
      this.currentEpisodeIsLastInSeason &&
      !this.hasNextSeasonWithEpisodes &&
      this.yearEnd !== 0
    ) {
      return StatusType.SERIES_END;
    }

    if (this.currentEpisode.isSeriesStart) {
      return StatusType.EXPLORE;
    }

    if (
      this.currentEpisodeIsLastInSeason ||
      (this.currentEpisode.season >= 2 && this.currentEpisode.isSeasonStart)
    ) {
      return StatusType.SEASON_END;
    }

    return StatusType.STARTED;
  }

  get isCurrent() {
    return this.status === StatusType.CURRENT;
  }

  get isFuture() {
    return this.status === StatusType.IN_FUTURE;
  }

  get isStarted() {
    return this.status === StatusType.STARTED;
  }

  get isExplore() {
    return this.status === StatusType.EXPLORE;
  }

  get isSeriesEnd() {
    return this.status === StatusType.SERIES_END;
  }

  get isSeasonEnd() {
    return this.status === StatusType.SEASON_END;
  }

  get isWatched() {
    return this.status === StatusType.WATCHED;
  }

  get showInExplore() {
    return this.isExplore || (this.isCurrent && this.isSeasonStart);
  }

  get isGerman() {
    return this.languages.slice(0, 2).includes("de");
  }

  get isInternational() {
    return (
      !this.languages.slice(0, 2).includes("de") &&
      !this.languages.slice(0, 2).includes("en") &&
      !this.countries.slice(0, 2).includes("United States") &&
      !this.countries.slice(0, 2).includes("United Kingdom") &&
      !this.countries.slice(0, 2).includes("Germany") &&
      (this.languages.length || this.countries.length)
    );
  }

  get isWatchedOnce() {
    return this.rewatch > 0;
  }

  /**
   * Nur änderbar, wenn Konstruktor augerufen wird
   */
  get imdbId() {
    if (this._idImdb) return this._idImdb;

    this._idImdb = this.getImdbIdFromInfoUrls();
    return this._idImdb;
  }

  getImdbIdFromInfoUrls() {
    const url = this.urlsInfo.find((url) => url.url.toLowerCase().includes("imdb"));
    if (!url) return undefined;

    return getIMDbIdFromUrl(url.url);
  }

  get lastEditedDate(): Date {
    return this.editHistory[0] ?? new Date(-1);
  }

  get creationDate(): Date {
    return this.editHistory[this.editHistory.length - 1] ?? new Date(-1);
  }

  get seasonsWithoutSpecialSeasons() {
    return this.seasons.filter((season) => !season.special);
  }

  get lastSeasonWithoutSpecials(): Season | undefined {
    const onlyNormalSeasons = this.seasonsWithoutSpecialSeasons;
    if (!onlyNormalSeasons.length) return;
    return onlyNormalSeasons[onlyNormalSeasons.length - 1];
  }

  get lastSeasonEpisodesWithoutSpecials(): number {
    if (!this.seasons.length) return 0;

    return this.lastSeasonWithoutSpecials?.episodes ?? 0;
  }

  get lastSeasonEpisodes(): number {
    if (!this.seasons.length) return 0;

    return this.seasons[this.seasons.length - 1].episodes;
  }

  get mostEpisodes(): number {
    if (!this.seasons.length) return 0;

    return Math.max(...this.seasons.map((season) => season.episodes));
  }

  get isSeriesStart() {
    return this.currentEpisode.isSeriesStart;
  }

  get isSeasonStart() {
    return this.currentEpisode.isSeasonStart && this.currentEpisode.season > 1;
  }

  get currentSeasonHasEpisodes(): boolean {
    return !!this.currentSeasonEpisodes && this.currentSeasonEpisodes > 0;
  }

  get currentSeasonEpisodes() {
    if (this.seasons.length < this.currentEpisode.season || this.currentEpisode.season === 0)
      return 0;
    return this.seasons[this.currentEpisode.season - 1].episodes;
  }

  get hasNextSeasonWithEpisodes(): boolean {
    return (
      this.currentEpisode.season < this.seasons.length &&
      this.seasons[this.currentEpisode.season].episodes > 0
    );
  }

  get currentEpisodeIsLastInSeason(): boolean {
    // Nicht bei Film, Automatisch oder wenn keine Staffel gesetzt ist
    if (
      this.isMovie ||
      this.automatic ||
      !this.seasons.length ||
      this.seasons.length < this.currentEpisode.season ||
      this.currentEpisode.season === 0
    )
      return false;

    return this.currentEpisode.episode === this.currentSeasonEpisodes;
  }

  get wasCreatedTheLast5Days(): boolean {
    return DateFns.isDateBetweenDates(
      this.creationDate,
      DateFns.addDaysToDate(new Date(), -5),
      new Date()
    );
  }

  get wasEditedTheLast5Days(): boolean {
    return this.editHistory.some((date) =>
      DateFns.isDateBetweenDates(date, DateFns.addDaysToDate(new Date(), -5), new Date())
    );
  }

  get wasEditedTheLast2Weeks(): boolean {
    return this.editHistory.some((date) =>
      DateFns.isDateBetweenDates(date, DateFns.addDaysToDate(new Date(), -14), new Date())
    );
  }

  get wasEditedTodayOrYesterday(): boolean {
    return this.editHistory.some(
      (date) =>
        DateFns.isToday(date) || DateFns.isYesterday(date) || DateFns.isDayBeforeYesterday(date)
    );
  }

  get wasEditedTodayOrYesterdayAndNotCreated(): boolean {
    return this.editHistory.length > 1 && this.wasEditedTodayOrYesterday;
  }

  get urlsVideoNoType() {
    return this.urlsVideo.filter((url) => url.type === UrlType.NONE || url.type === undefined);
  }

  get urlsTrailer() {
    return this.urlsVideo.filter((url) => url.type === UrlType.TRAILER);
  }

  get urlVideoWithPrioTrailer() {
    const urlsTrailer = this.urlsTrailer;
    const urlsVideoNoType = this.urlsVideoNoType;
    return urlsTrailer.length
      ? urlsTrailer[0]
      : urlsVideoNoType.length
      ? urlsVideoNoType[0]
      : this.urlsVideo.length
      ? this.urlsVideo[0]
      : null;
  }

  get urlTrailer() {
    const urlsTrailer = this.urlsTrailer;
    return urlsTrailer.length ? urlsTrailer[0] : null;
  }

  get urlsIntro() {
    return this.urlsVideo.filter((url) => url.type === UrlType.INTRO);
  }

  get urlIntro() {
    const urlsIntro = this.urlsIntro;
    return urlsIntro.length ? urlsIntro[0] : null;
  }

  get urlWatch() {
    const urlsWatch = this.urlsWatch;
    return urlsWatch.length ? urlsWatch[0] : null;
  }

  get urlInfo() {
    const urlsInfo = this.urlsInfo;
    return urlsInfo.length ? urlsInfo[0] : null;
  }

  get languagesForSearch() {
    return this.languages.slice(0, 1);
  }

  get countriesForSearch() {
    return this.countries.slice(0, 2);
  }

  get topInThisAndLastYear() {
    return (
      this.isExplore &&
      !this.hasTelevision &&
      (DateFns.isThisOrLastYear(this.yearStart) || DateFns.isThisOrLastYear(this.yearEnd))
    );
  }

  get hasTelevision() {
    return this.television && !this.television.onlyChannel;
  }

  get oldButGold() {
    return (
      this.isExplore &&
      !this.hasTelevision &&
      DateFns.isBeforeLastYear(this.yearStart) &&
      DateFns.isBeforeLastYear(this.yearEnd)
    );
  }

  get availableUntilTodayOrNext2Week() {
    return (
      this.availableUntil &&
      DateFns.isAfterOrToday(this.availableUntil) &&
      DateFns.isBefore(this.availableUntil, DateFns.addDaysToDate(new Date(), 14))
    );
  }

  get totalEpisodeCount() {
    return this.seasons.reduce((previous, current) => (previous += current.episodes), 0);
  }

  get totalEpisodeCountWithoutSpecialSeasons() {
    return this.seasons.reduce(
      (previous, current) => (previous += current.special ? 0 : current.episodes),
      0
    );
  }

  get totalEpisodeToCurrentEpisode() {
    let totalEpisodesToCurrentEpisode = 0;
    this.seasons.forEach((season, index) => {
      if (index + 1 < this.currentEpisode.season) {
        totalEpisodesToCurrentEpisode += season.episodes;
      } else if (index + 1 === this.currentEpisode.season) {
        totalEpisodesToCurrentEpisode += this.currentEpisode.episode;
      }
    });

    return totalEpisodesToCurrentEpisode;
  }

  get episodeProgressPercentage() {
    if (!this.currentEpisode || this.automatic) return 0;

    const totalEpisodes = this.totalEpisodeCount;
    if (totalEpisodes === 0) return 0;

    return (this.totalEpisodeToCurrentEpisode / totalEpisodes) * 100;
  }

  get episodeProgressForCurrentSeasonPercentage() {
    if (!this.currentEpisode || !this.seasons.length || this.automatic) return 0;

    if (this.consecutiveEpisodeNumbering) return this.episodeProgressPercentage;

    const currentSeasonEpisodes = this.currentSeasonEpisodes;
    if (currentSeasonEpisodes === 0) return 0;

    return (this.currentEpisode.episode / currentSeasonEpisodes) * 100;
  }

  get onlyDiscoverySourcesWithKeys(): DiscoverySource[] {
    return this.sources
      .map((source) => findSourceByText(source)?.key)
      .filter((source): source is DiscoverySource => !!source);
  }

  get firstDiscoverySource() {
    return this.sources[0];
  }

  get currentSeason(): number {
    const seasons = this.getSeasons();

    if (this.currentEpisode.season - 1 > seasons.length) return this.currentEpisode.season;

    // Wenn nur Spezialstaffeln, dann gibt es hier eine "0",
    // diese soll durch die aktuelle Staffel ersetzt werden
    return seasons.at(this.currentEpisode.season - 1)?.season || this.currentEpisode.season;
  }

  hasDiscoverySourceByKey(key: DiscoverySource) {
    return this.onlyDiscoverySourcesWithKeys.includes(key);
  }

  static sortByYearDescendingAndImdbRatingDescending = (media: Media, other: Media) =>
    isSameButCanVaryByOne(media.yearStart, other.yearStart)
      ? (other.ratingImdb ?? 0) - (media.ratingImdb ?? 0)
      : (other.yearStart ?? 0) - (media.yearStart ?? 0);

  static sortByImdbRatingDescending = (media: Media, other: Media) =>
    (other.ratingImdb ?? 0) - (media.ratingImdb ?? 0);

  static sortByMetascoreRatingDescending = (media: Media, other: Media) =>
    (other.ratingMetascore ?? 0) - (media.ratingMetascore ?? 0);

  static sortByFirstSourceDescending = (media: Media, other: Media) =>
    other.firstDiscoverySource?.localeCompare(media.firstDiscoverySource);

  static sortByWatchabilityRatingDescending = (media: Media, other: Media) =>
    (other.ratingWatchability ?? 0) - (media.ratingWatchability ?? 0);

  static sortByWatchabilityRatingAndImdbRatingDescending = (media: Media, other: Media) =>
    media.ratingWatchability === other.ratingWatchability
      ? (other.ratingImdb ?? 0) - (media.ratingImdb ?? 0)
      : (other.ratingWatchability ?? 0) - (media.ratingWatchability ?? 0);

  static sortByEditHistoryDescending = (media: Media, other: Media) =>
    other.editHistory[0].getTime() - media.editHistory[0].getTime();

  static sortByIsLiveAtStart = (media: Media, other: Media) =>
    media.television?.live === other.television?.live ? 0 : media.television?.live ? -1 : 1;

  static sortAllSeasonOrSeriesStartToEnd = (media: Media, other: Media) =>
    (other.isSeasonEnd ? 0 : 1) - (media.isSeasonEnd ? 0 : 1) ||
    (other.isSeasonStart ? 0 : 1) - (media.isSeasonStart ? 0 : 1);

  static getEpisodeDetailsByEpisodeAndSeason(
    episodeDetails: EpisodeDetail[],
    season: number,
    episode: number
  ): EpisodeDetail[] {
    return episodeDetails.filter(
      (episodeDetail) => episodeDetail.season === season && episodeDetail.episode === episode
    );
  }

  static getEpisodeDetailsByTypeAndEpisodeAndSeason(
    episodeDetails: EpisodeDetail[],
    type: EpisodeDetailType,
    season: number,
    episode: number
  ): EpisodeDetail[] {
    return this.getEpisodeDetailsByEpisodeAndSeason(episodeDetails, season, episode).filter(
      (episodeDetail) => episodeDetail.type === type
    );
  }

  static getEpisodeProgressByEpisodeDetailWithDuration(
    episode: Episode,
    episodeDetails: EpisodeDetail[],
    runtime: number
  ): number | undefined {
    let progress = 0;
    Media.getEpisodeDetailsByEpisodeAndSeason(
      episodeDetails,
      episode.season,
      episode.episode
    )?.forEach((detail) => {
      if (detail.type === EpisodeDetailType.INFO && detail.note) {
        const duration = DateFns.getDurationRangeOfString(detail.note || "")?.min ?? null;
        if (duration && runtime > duration) {
          progress = (duration / runtime) * 100;
        }

        // Laufzeit ist kürzer als angegebene Dauer
        else if (duration && runtime <= duration) {
          progress = 90;
        }

        // Laufzeit ist Null
        else if (duration && runtime === 0) {
          progress = 50;
        }
      }
    });

    return progress;
  }

  static removeAllEpisodeDetailsWithWatchtimeByEpisode(
    season: number,
    episode: number,
    episodeDetails: EpisodeDetail[]
  ): EpisodeDetail[] {
    return episodeDetails.filter(
      (detail) =>
        !(
          detail.season === season &&
          detail.episode === episode &&
          detail.type === EpisodeDetailType.INFO &&
          detail.note &&
          DateFns.getDurationRangeOfString(detail.note || "")?.min
        )
    );
  }

  removeNotWatchedFromEpisodeDetailsByEpisodeAndSeason(season: number, episode: number) {
    return this.episodeDetails.filter(
      (detail) =>
        !(
          detail.season === season &&
          detail.episode === episode &&
          detail.type === EpisodeDetailType.NOT_WATCHED
        )
    );
  }

  getCurrentEpisodeString(
    translateService: TranslateService,
    showCount: boolean,
    showTotolCount: boolean,
    totalCountWithHTML: boolean
  ): string {
    return this.getEpisodeString(
      this.currentEpisode,
      translateService,
      showCount,
      showTotolCount,
      totalCountWithHTML
    );
  }

  /**
   * @param translateService Wird für "Staffel 1" usw. benötigt
   * @param showCount Zeigt die Gesamtanzahl der Episoden in der aktuellen Staffel mit an "E2/10"
   * @param showTotalCount Zeigt die Gesamtanzahl aller Episoden mit an "E2/10 (100)"
   * @returns
   */
  getEpisodeString(
    episode: Episode,
    translateService: TranslateService,
    showCount: boolean = false,
    showTotalCount: boolean = false,
    totalCountWithHTML: boolean = false
  ): string {
    if (!episode || !episode.season || episode.season === 0 || !this.seasons.length) return "";

    episode = new Episode({ ...episode });

    // Nie den Wert der "letzten" Episode anzeigen,
    // da bei automatic es immer derselbe Wert ist
    if (this.automatic) {
      showCount = false;
      showTotalCount = false;
    }

    const seasonEpisodes = this.getSeasons();
    const season = seasonEpisodes[episode.season - 1];

    // Fortlaufende Nummerierung durch Staffeln und Spezialstaffeln hinweg
    if (this.consecutiveEpisodeNumbering) {
      if (season.special) return `S${season.seasonText} E${episode.episode}`;

      const episodesUntilEpisode = this.seasons
        .slice(0, episode.season - 1)
        .reduce((prev, curr) => (prev += curr.special ? 0 : curr.episodes), episode.episode);
      return `E${episodesUntilEpisode}${
        showCount ? "/" + this.totalEpisodeCountWithoutSpecialSeasons : ""
      }`;
    }

    if (episode.isSeasonStart) {
      // return `${translateService.instant("SEASON.")} ${season.season}`;
      return `S${season.seasonText}`;
    }

    const startHTML = "<span class='extra-info'>";
    const endHTML = "</span>";
    const totalEpisodeCount = this.totalEpisodeCount;
    const totalEpisodeToCurrentEpisode = this.totalEpisodeToCurrentEpisode;
    let totalCount = showTotalCount
      ? totalEpisodeCount === totalEpisodeToCurrentEpisode
        ? ` ${totalCountWithHTML ? startHTML : ""}(${totalEpisodeToCurrentEpisode})${
            totalCountWithHTML ? endHTML : ""
          }`
        : ` ${
            totalCountWithHTML ? startHTML : ""
          }(${totalEpisodeToCurrentEpisode}/${totalEpisodeCount})${
            totalCountWithHTML ? endHTML : ""
          }`
      : "";

    const count = showCount ? `/${this.seasons[episode.season - 1].episodes}` : "";

    // Sonderfall: Nur eine Staffel -> Keine Staffel anzeigen
    if (!season.special && this.seasonsWithoutSpecialSeasons.length === 1) {
      return `E${episode.episode}${count}${totalCount}`;
    }

    const countToAppend = episode.season > this.seasons.length ? totalCount : count;

    return `S${season.seasonText} E${episode.episode}${countToAppend}`;
  }

  getTelevisionEpisode(episode: Episode): number {
    if (this.consecutiveEpisodeNumbering) {
      const episodesUntilEpisode = this.seasons
        .slice(0, episode.season - 1)
        .reduce((prev, curr) => (prev += curr.special ? 0 : curr.episodes), episode.episode);

      return episodesUntilEpisode;
    }

    return episode.episode;
  }

  getTelevisionEpisodeString(episode: Episode) {
    const episodeCount = this.getTelevisionEpisode(episode);
    return episodeCount > 99 ? `${episodeCount}` : `E${episodeCount}`;
  }

  isEqualTo(other: Media) {
    var equal = true;
    const messages: { key: string; this: any; other: any }[] = [];
    if (this.id !== other.id) {
      equal = false;
      messages.push({ key: "ID", this: this.id, other: other.id });
    }
    if (this.type !== other.type) {
      equal = false;
      messages.push({ key: "MEDIA.TYPE", this: this.type, other: other.type });
    }
    if (this.name !== other.name) {
      equal = false;
      messages.push({ key: "TITLE", this: this.name, other: other.name });
    }
    if (this.nameOriginal !== other.nameOriginal) {
      equal = false;
      messages.push({ key: "TITLE_ORIGINAL", this: this.nameOriginal, other: other.nameOriginal });
    }
    if (this.note !== other.note) {
      equal = false;
      messages.push({ key: "NOTE.", this: this.note, other: other.note });
    }
    if (!isEqual(this.images, other.images)) {
      equal = false;
      messages.push({ key: "IMAGE.S", this: this.images, other: other.images });
    }
    if (this.favorite !== other.favorite) {
      equal = false;
      messages.push({ key: "FAVORITE.", this: this.favorite, other: other.favorite });
    }
    if (this.hideFromNews !== other.hideFromNews) {
      equal = false;
      messages.push({ key: "NEWS.HIDE_FROM", this: this.hideFromNews, other: other.hideFromNews });
    }
    if (this.rating !== other.rating) {
      equal = false;
      messages.push({ key: "RATING.", this: this.rating, other: other.rating });
    }
    if (this.ratingImdb !== other.ratingImdb) {
      equal = false;
      messages.push({ key: "RATING.IMDB", this: this.ratingImdb, other: other.ratingImdb });
    }
    if (this.ratingMetascore !== other.ratingMetascore) {
      equal = false;
      messages.push({
        key: "RATING.METASCORE",
        this: this.ratingMetascore,
        other: other.ratingMetascore,
      });
    }
    if (this.ratingWatchability !== other.ratingWatchability) {
      equal = false;
      messages.push({
        key: "RATING.WATCHABILITY",
        this: this.ratingWatchability,
        other: other.ratingWatchability,
      });
    }
    if (
      this.currentEpisode.season !== other.currentEpisode.season ||
      this.currentEpisode.episode !== other.currentEpisode.episode
    ) {
      equal = false;
      messages.push({
        key: "EPISODE.CURRENT",
        this: JSON.stringify(this.currentEpisode),
        other: JSON.stringify(other.currentEpisode),
      });
    }
    if (this.runtime !== other.runtime) {
      equal = false;
      messages.push({ key: "RUNTIME.", this: this.runtime, other: other.runtime });
    }
    if (this.yearStart !== other.yearStart) {
      equal = false;
      messages.push({ key: "YEAR.START.", this: this.yearStart, other: other.yearStart });
    }
    if (this.yearEnd !== other.yearEnd) {
      equal = false;
      messages.push({ key: "YEAR.END.", this: this.yearEnd, other: other.yearEnd });
    }
    if (!isEqual(this.urlsInfo, other.urlsInfo)) {
      equal = false;
      messages.push({
        key: "URL.S.INFO",
        this: this.urlsInfo.map((url) => JSON.stringify(url)),
        other: other.urlsInfo.map((url) => JSON.stringify(url)),
      });
    }
    if (!isEqual(this.urlsWatch, other.urlsWatch)) {
      equal = false;
      messages.push({
        key: "URL.S.WATCH",
        this: this.urlsWatch.map((url) => JSON.stringify(url)),
        other: other.urlsWatch.map((url) => JSON.stringify(url)),
      });
    }
    if (!isEqual(this.urlsVideo, other.urlsVideo)) {
      equal = false;
      messages.push({
        key: "URL.S.VIDEO",
        this: this.urlsVideo.map((url) => JSON.stringify(url)),
        other: other.urlsVideo.map((url) => JSON.stringify(url)),
      });
    }
    if (!isEqual(this.languages, other.languages)) {
      equal = false;
      messages.push({
        key: "LANGUAGE.S",
        this: this.languages.map((language) => JSON.stringify(language)),
        other: other.languages.map((language) => JSON.stringify(language)),
      });
    }
    if (!isEqual(this.countries, other.countries)) {
      equal = false;
      messages.push({
        key: "COUNTRY.S",
        this: this.countries.map((country) => JSON.stringify(country)),
        other: other.countries.map((country) => JSON.stringify(country)),
      });
    }
    if (this.rewatch !== other.rewatch) {
      equal = false;
      messages.push({ key: "REWATCH", this: this.rewatch, other: other.rewatch });
    }
    if (this.automatic !== other.automatic) {
      equal = false;
      messages.push({ key: "AUTOMATIC.", this: this.automatic, other: other.automatic });
    }
    if (this.consecutiveEpisodeNumbering !== other.consecutiveEpisodeNumbering) {
      equal = false;
      messages.push({
        key: "EPISODE.NUMBERING_PER_SEASON",
        this: this.consecutiveEpisodeNumbering,
        other: other.consecutiveEpisodeNumbering,
      });
    }
    if (this.wrapSeasonEpisodes !== other.wrapSeasonEpisodes) {
      equal = false;
      messages.push({
        key: "EPISODE.S.WRAP",
        this: this.wrapSeasonEpisodes,
        other: other.wrapSeasonEpisodes,
      });
    }
    if (this.showYearPerSeason !== other.showYearPerSeason) {
      equal = false;
      messages.push({
        key: "YEAR.PER_SEASON",
        this: this.showYearPerSeason,
        other: other.showYearPerSeason,
      });
    }
    if (this.availableUntil?.getTime() !== other.availableUntil?.getTime()) {
      equal = false;
      messages.push({
        key: "AVAILABLE_UNTIL",
        this: this.availableUntil,
        other: other.availableUntil,
      });
    }
    if (this.dvd !== other.dvd) {
      equal = false;
      messages.push({
        key: "DVD.",
        this: this.dvd,
        other: other.dvd,
      });
    }
    if (!isEqual(this.tags, other.tags)) {
      equal = false;
      messages.push({
        key: "TAGS",
        this: this.tags,
        other: other.tags,
      });
    }
    if (!isEqual(this.cinema, other.cinema)) {
      equal = false;
      messages.push({
        key: "CINEMA.",
        this: this.cinema,
        other: other.cinema,
      });
    }
    if (!isEqual(this.linkedIds, other.linkedIds)) {
      equal = false;
      messages.push({
        key: "LINK.LINKED_MEDIA",
        this: JSON.stringify(this.linkedIds),
        other: JSON.stringify(other.linkedIds),
      });
    }
    if (!isEqual(this.episodeDetails, other.episodeDetails)) {
      equal = false;
      messages.push({
        key: "EPISODE.S.DETAILS",
        this: JSON.stringify(this.episodeDetails),
        other: JSON.stringify(other.episodeDetails),
      });
    }
    if (!isEqual(this.genreIds, other.genreIds)) {
      equal = false;
      messages.push({
        key: "GENRE.S",
        this: JSON.stringify(this.genreIds),
        other: JSON.stringify(other.genreIds),
      });
    }
    if (!isEqual(this.television, other.television)) {
      equal = false;
      messages.push({
        key: "TELEVISION.",
        this: JSON.stringify(this.television),
        other: JSON.stringify(other.television),
      });
    }
    if (!isEqual(this.seasons, other.seasons)) {
      equal = false;
      messages.push({
        key: "SEASON.S",
        this: JSON.stringify(this.seasons),
        other: JSON.stringify(other.seasons),
      });
    }
    if (!isEqual(this.sources, other.sources)) {
      equal = false;
      messages.push({
        key: "DISCOVERY_SOURCE.S",
        this: JSON.stringify(this.sources),
        other: JSON.stringify(other.sources),
      });
    }

    return {
      equal,
      messages: messages.map((m) => m.key),
    };
  }

  incrementCurrentEpisode(addEpisodes: number = 1): void {
    const { season, episode } = this.currentEpisode;
    const currentSeason = this.seasons[season - 1];

    if (this.automatic) {
      currentSeason.episodes = currentSeason.episodes + addEpisodes;
      this.setCurrentEpisode(season, currentSeason.episodes);
      return;
    }

    if (currentSeason && episode + addEpisodes <= currentSeason.episodes) {
      this.setCurrentEpisode(season, episode + addEpisodes);
    } else if (season < this.seasons.length) {
      // Wenn addEpisodes mehr als 1 und am Ende der Staffel verfallen
      this.setCurrentEpisode(season + 1, 0);
    }
  }

  decrementCurrentEpisode(): void {
    const { season, episode } = this.currentEpisode;

    if (episode > 0) {
      this.setCurrentEpisode(season, episode - 1);
    } else if (season > 1) {
      const previousSeason = this.seasons[season - 2];
      this.setCurrentEpisode(season - 1, previousSeason.episodes);
    }

    if (this.automatic) {
      this.seasons[this.currentEpisode.season - 1].episodes = this.currentEpisode.episode;
      this.seasons.splice(this.currentEpisode.season);
    }
  }

  recalculateEvents(today: Date = new Date()) {
    if (!this.television || this.television.onlyChannel) return;

    if (this.isMovie) {
      if (this.television && this.television.date && this.television.times) {
        this.television._episodesInTelevision = [
          {
            date: this.television.date,
            time: this.television.times[this.television.date?.getDay()][0],
            episode: new Episode({ season: 1, episode: 1 }),
          },
        ];
      }
      return;
    }

    if (!this.seasons.length) return;

    const maxEpisodes = this.television.onlyStart
      ? 1
      : this.seasons[this.television.episode.season - 1].episodes;

    this.television._episodesInTelevision = Television.generateEvents(
      this.television.date,
      this.episodeDetails,
      maxEpisodes,
      this.television.times,
      this.television.weekly,
      this.television.episode,
      this.television.episodesPerTime,
      this.automatic,
      today
    );

    if (this.television.onlyStart) {
      this.television._episodesInTelevision?.splice(1);
    }

    const eventCount = this.television?._episodesInTelevision?.length;
    if (eventCount && eventCount > 30) {
      console.warn(
        "Media hat mehr als 30 Events, die generiert wurden",
        this.name,
        this.television?._episodesInTelevision?.length
      );
    }
  }

  findAndSetNextEvent(event: EpisodeInTelevision): EpisodeInTelevision | null {
    if (!this.television?._episodesInTelevision) return null;

    if (this.automatic) {
      return this.nextEventIfAutomatic(event);
    }

    const index = this.television._episodesInTelevision?.findIndex(
      (episodeInTV) =>
        episodeInTV.date === event.date &&
        episodeInTV.episode === event.episode &&
        episodeInTV.time === event.time
    );

    if (index < 0) {
      console.error("Es konnte das Event nicht gefunden werden!");
      return null;
    }

    if (this.television._episodesInTelevision.length > index + 1) {
      this.television._episodesInTelevision = this.television._episodesInTelevision.slice(
        index + 1
      );
      return this.television._episodesInTelevision[0]; // Null, nachdem alle davor gelöscht wurden
    }

    return null;
  }

  nextEventIfAutomatic(event: EpisodeInTelevision | null) {
    if (!this.television) return null;

    this.recalculateEvents();

    // Ermöglicht das Klicken auf ✔️ bei Episoden in der Zukunft
    // z.B. "Nächsten 7 Tage" Tab auf der Startseite
    if (event) {
      return (
        this.television._episodesInTelevision?.find((episodeInTV) =>
          DateFns.isAfter(episodeInTV.date, event.date)
        ) ?? null
      );
    }

    // Insbesondere für die Anzeige im Dialog verwedet
    // z.B. "Nächste Episode in 3 Tagen"
    return (
      this.television._episodesInTelevision?.find((episodeInTV) =>
        DateFns.isAfterCurrent(episodeInTV.date)
      ) ?? null
    );
  }

  /**
   * !!! Verändert irgendwie die Uhrzeiten in `_episodesInTelevision` !!!
   */
  findNextEvent() {
    if (
      !this.television ||
      !this.television._episodesInTelevision ||
      !this.television._episodesInTelevision.length
    )
      return null;

    if (this.automatic) {
      return this.nextEventIfAutomatic(null);
    }

    const nextEvent = this.television._episodesInTelevision?.find((episodeInTV) =>
      DateFns.isAfterCurrent(episodeInTV.date)
    );

    return nextEvent;
  }

  setCurrentEpisode(season: number, episode: number) {
    this.currentEpisode.season = season;
    this.currentEpisode.episode = episode;

    if (this.television) {
      this.television.episode.season = this.currentEpisode.season;
      this.television.episode.episode = this.currentEpisode.episode + 1;

      this.recalculateEvents();
    }
  }

  getPlayUrl() {
    const urlsWatch = this.urlsWatch;
    if (urlsWatch.length) {
      return urlsWatch[0];
    }

    const urlsVideo = this.urlsVideo;
    if (urlsVideo.length) {
      return urlsVideo[0];
    }

    const urlsInfo = this.urlsInfo;
    if (urlsInfo.length) {
      return urlsInfo[0];
    }

    return null;
  }

  static findMediaIdsInText(titles: string[], mediaList: Media[]) {
    const mediaIds: { media: Media; count: number }[] = [];
    // Serie / Film finden
    titles.forEach((title) => {
      const t = forSearch(title);
      const media =
        mediaList.find(
          (media) => forSearch(media.name) === t || forSearch(media.nameOriginal) === t
        ) ?? null;

      if (media) {
        const foundIndex = mediaIds.findIndex((obj) => obj.media.id === media.id);
        if (foundIndex === -1) {
          mediaIds.push({ media, count: 1 });
        } else {
          mediaIds[foundIndex].count = mediaIds[foundIndex].count + 1;
        }
      }
    });

    mediaIds.sort((a, b) => b.count - a.count);

    return mediaIds.map((obj) => obj.media);
  }

  getSeasons(): SeasonEpisodes[] {
    let seasons = 0;
    let specialSeasons = 0;
    let yearStart = this.yearStart;
    const countUpYear = !!yearStart;
    let totalEpisodes = 0;

    return this.seasons.map((season: Season, seasonIndex) => {
      const episodes: Episode[] = [];

      for (let i = 1; i <= season.episodes; i++) {
        episodes.push(
          new Episode({
            season: seasonIndex,
            episode: season.special ? i : totalEpisodes + i,
          })
        );
      }

      if (!season.special) {
        seasons++;
        specialSeasons = 0;
      } else {
        specialSeasons++;
      }

      if (this.consecutiveEpisodeNumbering && !season.special) {
        totalEpisodes += season.episodes;
      }

      const data: SeasonEpisodes = {
        special: season.special,
        episodes,
        seasonText: season.special ? `${seasons}.${specialSeasons}` : `${seasons}`,
        season: seasons,
        year: yearStart,
      };

      if (!season.special && countUpYear) {
        yearStart++;
      }

      return data;
    });
  }

  static findEpisodeDetailById(episodeDetails: EpisodeDetail[], id: string) {
    return episodeDetails.find((episodeDetail) => episodeDetail.id === id);
  }

  findEpisodeDetailById(id: string) {
    return this.episodeDetails.find((episodeDetail) => episodeDetail.id === id);
  }

  static removeEpisodeDetailById(episodeDetail: EpisodeDetail[], id: string) {
    return episodeDetail.filter((episodeDetail) => episodeDetail.id !== id);
  }

  removeEpisodeDetailById(id: string) {
    this.episodeDetails = Media.removeEpisodeDetailById(this.episodeDetails, id);
  }

  static removeAllEpisodeDetailsBySeasonAndEpisode(
    episodeDetail: EpisodeDetail[],
    season: number,
    episode: number
  ) {
    return episodeDetail.filter(
      (episodeDetail) => episodeDetail.season !== season || episodeDetail.episode !== episode
    );
  }

  removeAllEpisodeDetailsBySeasonAndEpisode(season: number, episode: number) {
    this.episodeDetails = Media.removeAllEpisodeDetailsBySeasonAndEpisode(
      this.episodeDetails,
      season,
      episode
    );
  }

  static addEpisodeDetail(episodeDetails: EpisodeDetail[], episodeDetail: EpisodeDetail) {
    episodeDetails.push(episodeDetail);
    return episodeDetails;
  }

  addEpisodeDetail(episodeDetail: EpisodeDetail) {
    this.episodeDetails.push(episodeDetail);
  }
}
