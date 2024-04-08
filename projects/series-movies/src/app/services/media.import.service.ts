import { Injectable } from "@angular/core";
import { take } from "rxjs";
import { Language } from "shared/models/enum/language.enum";
import { NotificationStyleType } from "shared/models/enum/notification-style.enum";
import { UrlType } from "shared/models/enum/url-type.enum";
import { TimeRange } from "shared/models/time-range.type";
import { Url } from "shared/models/url.class";
import { NotificationService } from "shared/services/notification.service";
import { DateFns } from "shared/utils/date-fns";
import { getNewUUID } from "shared/utils/uuid";
import { MediaEnum } from "../../../../../shared/models/enum/media.enum";
import {
  delimiter_lvl1,
  delimiter_lvl2,
  delimiter_lvl3,
  delimiter_lvl5,
} from "../data/settings-delimiter.data";
import { Cinema } from "../models/cinema.type";
import { EpisodeDetailType } from "../models/enum/episode-detail.enum";
import { EpisodeDetail } from "../models/episode-detail.class";
import { Episode } from "../models/episode.class";
import { Linked } from "../models/linked";
import { Media } from "../models/media.class";
import { Season } from "../models/season.type";
import { Television } from "../models/television.class";
import { ChannelApiService } from "./channel.api.service";
import { MediaApiService } from "./media.api.service";

@Injectable({
  providedIn: "root",
})
export class MediaImportService {
  constructor(
    private notificationService: NotificationService,
    private mediaApiService: MediaApiService,
    private channelApiService: ChannelApiService
  ) {}

  readInMovie(text: string) {
    const errorMessages: string[] = [];

    const list = text.split("\t");
    if (list.length !== 14) {
      errorMessages.push("Fehler beim Einlesen des Films!");
      return null;
    }
    const id = getNewUUID();
    const name = list[0];
    const nameOriginal = list[1];
    const yearStart = +list[2];
    const genreIds = list[3].split("|").map((genreId) => +genreId);
    // Sitcom -> Comedy
    if (genreIds.includes(18) && !genreIds.includes(4)) {
      genreIds.push(4);
    }
    // Musik
    if (genreIds.includes(26)) {
      errorMessages.push("Musik-Genre existiert nicht!");
    }
    const dvd = list[4] === "DVD";
    const note = list[5];

    // 6. Kino
    let cinema: Cinema | null = null;
    const cinema_tmp = list[6].split("|");
    if (cinema_tmp.length >= 3) {
      const building = cinema_tmp[0];
      const date = DateFns.getDateOfStringWithFormatting(cinema_tmp[1], "yyyy-MM-dd") ?? new Date();
      const price = cinema_tmp[2] ? parseFloat(cinema_tmp[2].replace(RegExp(" ?€"), "").trim()) : 0;
      const note = cinema_tmp.length >= 4 ? cinema_tmp[3] : "";

      cinema = {
        building,
        date,
        price,
        note,
      };
    }

    const rating = +list[7] * 2;
    const runtime = +list[8];

    // 9. Urls
    const urlsWatch: Url[] = [];
    const urlsVideo: Url[] = [];
    const urlsInfo: Url[] = [];
    this.readInUrls(list[9], urlsWatch, urlsVideo, urlsInfo, errorMessages);

    const rewatch = list[10] === "Angeschaut" ? 1 : 0;
    const favorite = list[11] === "1";

    // 12. Fernsehen
    let television: Television | null = null;
    let date: Date | null = null;
    let time: string = "";
    let channelStr: string = "";
    let channelId: string | null = null;
    list[12].split(";").forEach((item) => {
      item = item.trim();
      const dateMatch = item.match(RegExp("\\d\\d\\.\\d\\d\\.(\\d\\d\\d\\d)"));
      if (dateMatch) {
        if (+dateMatch[1] > 1800) date = DateFns.getDateOfStringWithFormatting(item, "dd.MM.yyyy");
      } else if (item.match(RegExp("\\d\\d:\\d\\d"))) {
        time = item;
      } else {
        channelStr = item;
      }
    });

    // Channel ID suchen
    if (channelStr) {
      this.channelApiService.channels$.pipe(take(1)).subscribe((channels) => {
        const found = channels.find(
          (channel) =>
            channel.name.toLowerCase() === channelStr.toLowerCase() ||
            channel.alternativeNames.includes(channelStr)
        );
        if (found) {
          channelId = found.id;
        } else {
          errorMessages.push(`TV-Sender mit der ID ${channelStr} nicht gefunden!`);
        }
      });
    }

    if (date && time) {
      date = DateFns.setTimeStringToDate(date, time);
    } else if (date) {
      time = "00:00";
      date = DateFns.setTimeStringToDate(date, time);
    }

    if (channelId && date && time) {
      const times: TimeRange[][] = [[], [], [], [], [], [], []];
      const start = DateFns.getHoursAndMinutesOfTimeString(time);
      times[date.getDay()] = [{ start, end: null }];

      television = new Television({
        channelId,
        date,
        times,
      });
    } else if (channelId) {
      television = new Television({
        channelId,
        onlyChannel: true,
      });
    }

    if (genreIds.includes(12) && television) {
      television.live = true;
    } else if (genreIds.includes(12)) {
      errorMessages.push("Live-Genre konnte nicht hinzugefügt werden, da kein Fernsehen existiert");
    }

    // 13. Anschauen bis Datum
    const availableUntil = list[13]
      ? DateFns.getDateOfStringWithFormatting(list[13], "yyyy-MM-dd")
      : null;

    const movie = new Media({
      type: MediaEnum.MOVIE,
      id,
      name,
      nameOriginal,
      note,
      yearStart,
      rating,
      urlsWatch,
      urlsVideo,
      urlsInfo,
      runtime,
      favorite,
      television,
      availableUntil,
      genreIds,
      rewatch,
      dvd,
      cinema,
    });

    movie.recalculateEvents();

    if (errorMessages.length) {
      this.notificationService.showNotificationText(
        errorMessages.join("; "),
        NotificationStyleType.ERROR
      );
    }

    return movie;
  }

  readInSeries(text: string) {
    const errorMessages: string[] = [];

    const list = text.split("\t");
    if (list.length !== 22) {
      errorMessages.push("Fehler beim Einlesen des Films!");
      return null;
    }
    const id = getNewUUID();
    const idOld = list[0];
    const name = list[1];
    /**
     * 1 = Aktuelle Serie
     * 2 = Angefangene Serie
     * 3 = Serie entdecken
     * 4 = Staffelende
     * 5 = Beendete Serie
     */
    const status = +list[2];
    const yearStart = +list[3];
    const yearEnd = +list[4];
    const rating = +list[5] * 2;
    const note = list[6];

    // 7. genreIds, z.B.: "4_ 7$genreFavorite$_ 16" | delimiter: "_ "
    let favoriteGenre: number[] = [];
    const genreIds = list[7]
      .split("_ ")
      .map((genreId) => {
        if (genreId.includes("$genreFavorite$")) {
          const genre = +genreId.replace("$genreFavorite$", "");
          favoriteGenre = [genre];
          return genre;
        }
        return +genreId;
      })
      .filter((genreId) => genreId !== favoriteGenre[0]);
    genreIds.unshift(...favoriteGenre);

    // 8. Urls
    const urlsWatch: Url[] = [];
    const urlsVideo: Url[] = [];
    const urlsInfo: Url[] = [];
    this.readInUrls(list[8], urlsWatch, urlsVideo, urlsInfo, errorMessages);

    // 9. Aktuelle Episode
    const currentEpisode =
      list[9].split("|").length === 2
        ? new Episode({ season: +list[9].split("|")[0], episode: +list[9].split("|")[1] })
        : new Episode({ season: 0, episode: 0 });

    if (list[9].split("|").length !== 2)
      errorMessages.push("Aktuelle Episode konnte nicht korrekt eingelesen werden!");

    // 10. Staffeln
    const seasons = list[10]
      .split("_ ")
      .map((season) => +season)
      .map((episodes) => {
        const season: Season = { special: false, episodes };
        return season;
      });

    // 11. Spezialepisoden
    // Type: SPECIAL_FAVORITE, SPECIAL_INFO, SPECIAL_WATCH
    const episodeDetails = list[11]
      .split("_ ")
      .map((episodeDetailAti) => episodeDetailAti.split("|"))
      .filter((episodeDetailItems) => episodeDetailItems.length > 1)
      .map((episodeDetailsItems) => {
        const episodeType = episodeDetailsItems[2];
        const type =
          episodeType === "favorite"
            ? EpisodeDetailType.FAVORITE
            : episodeType === "info"
            ? EpisodeDetailType.INFO
            : episodeType === "watch"
            ? EpisodeDetailType.NOT_WATCHED
            : EpisodeDetailType.INFO;

        // Staffel === 0
        if (parseInt(episodeDetailsItems[0]) === 0) {
          errorMessages.push("Spezialstaffel (0. Staffel) mit Episode", episodeDetailsItems[1]);
        }

        return new EpisodeDetail({
          season: parseInt(episodeDetailsItems[0]),
          episode: parseInt(episodeDetailsItems[1]),
          type,
          note: episodeDetailsItems[3],
        });
      });

    // 12. + 13. Bilder
    // Bilder müssen manuell hinzugefügt werden

    // 14. Laufzeit
    const runtime = +list[14];

    // 15. Automatisch
    const automatic = +list[15] === 1;

    // 16. Fernsehen
    // 11||15.10.2023|7:1|00:00|00:00_00:00_7||1W|0
    const television_tmp = list[16].split("|");
    let television = null;
    if (television_tmp.length >= 5) {
      let channelId = television_tmp[0];

      // Channel ID suchen
      this.channelApiService.channels$.pipe(take(1)).subscribe((channels) => {
        const found = channels.find((channel) => channel.idOld === channelId);
        if (found) {
          channelId = found.id;
        } else {
          errorMessages.push(`TV-Sender mit der ID ${channelId} nicht gefunden!`);
        }
      });

      const note = television_tmp[1];
      const startDate_tmp =
        DateFns.getDateOfStringWithFormatting(television_tmp[2], "dd.MM.yyyy") ?? new Date();
      const episode_tmp = television_tmp[3].split(":");
      const episode = new Episode({ season: +episode_tmp[0], episode: +episode_tmp[1] });
      const date = DateFns.setTimeStringToDate(startDate_tmp, television_tmp[4]);

      const times: TimeRange[][] = [[], [], [], [], [], [], []];
      television_tmp[5].split(delimiter_lvl2).map((timeAtDay) => {
        const list = timeAtDay.split(delimiter_lvl3);
        if (list.length > 2) {
          const start = DateFns.getHoursAndMinutesOfTimeString(list[0]);
          const end_tmp = DateFns.getHoursAndMinutesOfTimeString(list[1]);
          // Bei gleicher Start- und Endzeit, die Endzeit verwerfen
          const end =
            start.hours === end_tmp.hours && start.minutes === end_tmp.minutes ? null : end_tmp;
          const days = list[2]
            .split(";")
            .map((day) => +day)
            .map((day) => day % 7);
          const timeRange: TimeRange = { start, end };

          if (days.includes(0)) times[0] = [...(times[0] ?? []), timeRange];
          if (days.includes(1)) times[1] = [...(times[1] ?? []), timeRange];
          if (days.includes(2)) times[2] = [...(times[2] ?? []), timeRange];
          if (days.includes(3)) times[3] = [...(times[3] ?? []), timeRange];
          if (days.includes(4)) times[4] = [...(times[4] ?? []), timeRange];
          if (days.includes(5)) times[5] = [...(times[5] ?? []), timeRange];
          if (days.includes(6)) times[6] = [...(times[6] ?? []), timeRange];
        } else {
          errorMessages.push("Beim Fernsehen konnte die Zeit nicht richtig eingelesen werden!");
        }
      });

      const onlyStart =
        television_tmp.length > 6 ? television_tmp[6].trim() === "NurEinEvent" : false;
      const weekly = television_tmp.length > 7 ? +television_tmp[7].replace("W", "").trim() : 1;
      const onlyChannel = television_tmp.length > 8 ? +television_tmp[8] === 1 : false;

      // Live
      let live = undefined;
      if (genreIds.includes(12)) {
        const index = genreIds.indexOf(12);
        genreIds.splice(index, 1);
        live = true;
      }

      television = new Television({
        channelId,
        note,
        episode,
        date,
        times,
        onlyStart,
        weekly,
        onlyChannel,
        live,
      });
    } else if (list[16] !== "") {
      errorMessages.push("Fernsehen konnte nicht richtig eingelesen werden!");
    }

    // 17. Favorit
    const favorite = +list[14] === 1;

    // 18. Verlinkte Medien
    let linkedIds: Linked[] =
      list.length > 18
        ? list[18]
            .split(delimiter_lvl2)
            .map((segement) => segement.split(delimiter_lvl1))
            .filter((segements) => segements.length > 1)
            .map((segement) => {
              return { id: segement[0], note: segement[1] };
            })
        : [];

    this.mediaApiService.media$.pipe(take(1)).subscribe((mediaList) => {
      linkedIds = linkedIds.map((linked) => {
        const found = mediaList.find((media) => media.idOld === linked.id);
        if (found) {
          linked.id = found.id;
        } else {
          errorMessages.push(`Verlinkte Serie mit ID ${linked.id} konnte nicht gefunden werden!`);
        }
        return linked;
      });
    });

    // 19. Favorit
    const rewatch = list.length > 19 ? +list[19].replace("x", "") : 0;

    // 20. Episodennummerierung
    const consecutiveEpisodeNumbering = list.length > 20 ? +list[20] === 1 : false;

    // 21. Anschauen bis Datum
    const availableUntil =
      list.length > 21 ? DateFns.getDateOfStringWithFormatting(list[21], "yyyy-MM-dd") : null;

    const series = new Media({
      type: MediaEnum.SERIES,
      id,
      idOld,
      name,
      note,
      yearStart,
      yearEnd,
      rating,
      urlsWatch,
      urlsVideo,
      urlsInfo,
      currentEpisode,
      seasons,
      episodeDetails,
      runtime,
      favorite,
      linkedIds,
      rewatch,
      television,
      consecutiveEpisodeNumbering,
      availableUntil,
      automatic,
      genreIds,
    });

    series.recalculateEvents();

    if (
      !(
        (status === 1 && series.isCurrent) ||
        (status === 2 && series.isStarted) ||
        (status === 3 && series.isExplore) ||
        (status === 4 && series.isSeasonEnd) ||
        (status === 5 && series.isSeriesEnd) ||
        (status === 5 && series.isWatched)
      )
    ) {
      const statusTexts = [
        "",
        "Aktuelle Serie",
        "Angefangene Serie",
        "Serie entdecken",
        "Staffelende",
        "Beendete Serie",
      ];
      errorMessages.push(`Status "${statusTexts[status]}" passt nicht zu "${series.status}"`);
    }

    if (errorMessages.length) {
      this.notificationService.showNotificationText(
        errorMessages.join("; "),
        NotificationStyleType.ERROR
      );
    }

    return series;
  }

  private readInUrls(
    text: string,
    urlsWatch: Url[],
    urlsVideo: Url[],
    urlsInfo: Url[],
    errorMessages: string[]
  ) {
    text.split(delimiter_lvl1).forEach((url_tmp) => {
      const urlSegments = url_tmp.split(delimiter_lvl5);
      if (urlSegments.length === 4) {
        const urlType = Number(urlSegments[0]);
        let link: string = urlSegments[1];
        let note: string = urlSegments[2];
        const favorite: boolean = urlSegments[3] === "true";
        let language = Language.NONE;

        // Url-Typ anhand der Notiz erkennen
        let type: UrlType = UrlType.NONE;
        if (note.toLowerCase().includes("trailer")) {
          if (note.toLowerCase() === "trailer") {
            note = "";
            type = UrlType.TRAILER;
          } else {
            note = note.replaceAll(RegExp("Trailer:? ?", "gi"), "").trim();
            type = UrlType.TRAILER;
          }
        } else if (note.toLowerCase().includes("intro")) {
          if (note.toLowerCase() === "intro") {
            note = "";
            type = UrlType.INTRO;
          } else {
            type = UrlType.INTRO;
          }
        } else if (note.toLowerCase().includes("kritik") || note.toLowerCase().includes("review")) {
          note = note.replaceAll(RegExp("(Kritik ?/ ?Review|Kritik|Review):? ?", "gi"), "").trim();
          type = UrlType.CRITIC_REVIEW;
        }

        if (note.toLowerCase().includes("en") || note.toLowerCase().includes("de")) {
          const match = note.match(/\(en\)|english|englisch/i);
          if (match) {
            language = Language.ENGLISH;
            note = note.replaceAll(RegExp("\\(en\\)|english|englisch", "gi"), "").trim();
          }
          const matchGerman = note.match(/\(de\)|deutsch|german/i);
          if (matchGerman) {
            language = Language.GERMAN;
            note = note.replaceAll(RegExp("\\(de\\)|deutsch|german", "gi"), "").trim();
          }
        }

        // Da die Url immer mit "/" am Ende bei QuickAdd gefunden wird
        // und die richtige URL ist
        if (link.includes("imdb") && !link.endsWith("/")) {
          link = link + "/";
        }

        const url = new Url({
          url: link,
          note,
          type,
        });

        // urls
        // NONE = 10,
        // WATCH = 0,
        // VIDEO = 1,
        // INFO = 2
        switch (urlType) {
          case 0:
            if (favorite) urlsWatch.unshift(url);
            else urlsWatch.push(url);
            break;
          case 1:
            if (favorite) urlsVideo.unshift(url);
            else urlsVideo.push(url);
            break;
          case 2:
            if (favorite) urlsInfo.unshift(url);
            else urlsInfo.push(url);
            break;

          default:
            errorMessages.push("Kein UrlType wie Anschauen, Video oder Info gefunden!");
            urlsWatch.push(url);
            break;
        }
      } else {
        errorMessages.push("Url konnte nicht richtig eingelesen werden!");
      }
    });
  }
}
