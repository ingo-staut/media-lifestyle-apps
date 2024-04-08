import { DateFns } from "shared/utils/date-fns";
import { TimeRange } from "../../../../../shared/models/time-range.type";
import { EpisodeDetail } from "./episode-detail.class";
import { EpisodeInTelevision } from "./episode-in-television.type";
import { Episode } from "./episode.class";
import { Media } from "./media.class";

export const EPISODES_MAX = 20;
export const EPISODES_MAX_FOR_TELEVISION_EVENTS = 1000;

export class Television {
  channelId: string;
  note: string;
  episode: Episode;
  date: Date | null; // Time + Date
  onlyStart: boolean;
  onlyChannel: boolean;
  live: boolean;
  weekly: number; // z.B.: Alle zwei Wochen
  times: TimeRange[][] | null;
  episodesPerTime: number;

  _episodesInTelevision: EpisodeInTelevision[] | null;

  constructor(channel: {
    channelId: string;
    note?: string;
    episode?: Episode;
    date?: Date | null;
    onlyStart?: boolean;
    onlyChannel?: boolean;
    live?: boolean;
    weekly?: number;
    times?: TimeRange[][] | null;
    episodesPerTime?: number;
  }) {
    const {
      channelId,
      note,
      episode,
      date,
      onlyStart,
      onlyChannel,
      live,
      weekly,
      times,
      episodesPerTime,
    } = channel;
    this.channelId = channelId;
    this.note = note ?? "";
    this.episode = episode ?? new Episode({ season: 0, episode: 0 });
    this.date = date ?? null;
    this.onlyStart = onlyStart ?? false;
    this.onlyChannel = onlyChannel ?? false;
    this.live = live ?? false;
    this.weekly = weekly || 1; // 1 für wöchentlich
    this.times = times ?? null;
    this.episodesPerTime = episodesPerTime || 1;
  }

  static generateEvents(
    startDateTime: Date | null,
    episodeDetails: EpisodeDetail[],
    maxEpisode: number,
    weekTimeRanges: TimeRange[][] | null,
    weekly: number,
    episode: Episode,
    episodesPerTime: number,
    automatic: boolean,
    today: Date = new Date()
  ) {
    if (!startDateTime || !weekTimeRanges) return null;

    const startSeason = episode.season;
    const startEpisode = episode.episode;

    const dateAndTimeRangeList: EpisodeInTelevision[] = [];
    let currentDate = new Date(startDateTime);
    let currentEpisode = startEpisode;

    if (episodesPerTime === 0) console.error("Keine Episoden pro Zeiteinheit festgelegt!");

    let maxCount = 0;

    if (automatic) maxEpisode = maxEpisode + EPISODES_MAX;

    const maxEpisodeCount = maxEpisode + EPISODES_MAX_FOR_TELEVISION_EVENTS;

    while (
      currentEpisode <= maxEpisode &&
      // Erste Episode hat keine zusätzlichen Bedingungen
      (currentEpisode === startEpisode ||
        // Wenn "Automatisch", dann nur die nächten 14 Tage
        // (verhindert, dass EPISODES_MAX umsonst voll ausgenutzt wird)
        (DateFns.isBefore(currentDate, DateFns.addDaysToDate(today, 14)) && automatic) ||
        !automatic)
    ) {
      maxCount++;

      // Verhindert ein Endlos-Loop
      if (maxCount === maxEpisodeCount) {
        console.error("Zu viele Episoden im TV generiert");
        break;
      }

      const timeRanges = weekTimeRanges[currentDate.getDay()];

      if (timeRanges && timeRanges.length > 0) {
        const validTimeRanges = timeRanges.filter((timeRange) => {
          const startTime = new Date(currentDate);
          startTime.setHours(timeRange.start.hours, timeRange.start.minutes);

          return startTime >= currentDate;
        });

        if (validTimeRanges.length > 0) {
          const earliestTimeRange = validTimeRanges.reduce((earliest, current) => {
            const earliestStart = new Date(currentDate);
            earliestStart.setHours(earliest.start.hours, earliest.start.minutes);

            const currentStart = new Date(currentDate);
            currentStart.setHours(current.start.hours, current.start.minutes);

            return earliestStart < currentStart ? earliest : current;
          });

          const startDateTime = new Date(currentDate);
          startDateTime.setHours(earliestTimeRange.start.hours, earliestTimeRange.start.minutes);

          const endDateTime = new Date(currentDate);
          const end = earliestTimeRange.end;
          if (end) endDateTime.setHours(end.hours, end.minutes);

          endDateTime.setHours(
            end && endDateTime > startDateTime ? end.hours : earliestTimeRange.start.hours,
            end && endDateTime > startDateTime ? end.minutes : earliestTimeRange.start.minutes + 1
          );

          for (let index = 0; index < episodesPerTime; index++) {
            const episodeDetailsForEpisode = Media.getEpisodeDetailsByEpisodeAndSeason(
              episodeDetails,
              startSeason,
              currentEpisode
            );

            dateAndTimeRangeList.push({
              date: startDateTime,
              time: earliestTimeRange,
              episode: new Episode({ season: startSeason, episode: currentEpisode }),
              episodeDetails: episodeDetailsForEpisode,
            });

            currentEpisode++;
          }

          currentDate = endDateTime;
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(0, 0, 0, 0);

          // Wenn Montag, dann evtl. eine Woche weiter
          if (currentDate.getDay() === 1) {
            currentDate.setDate(currentDate.getDate() + (weekly - 1) * 7);
          }
        }
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);

        // Wenn Montag, dann evtl. eine Woche weiter
        if (currentDate.getDay() === 1) {
          currentDate.setDate(currentDate.getDate() + (weekly - 1) * 7);
        }
      }
    }

    return dateAndTimeRangeList;
  }
}
