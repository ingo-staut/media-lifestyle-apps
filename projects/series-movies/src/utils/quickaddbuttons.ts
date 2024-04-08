import { cloneDeep } from "lodash";
import { findLanguageKeyByText } from "shared/data/language.data";
import { TimeRange } from "shared/models/time-range.type";
import { Url } from "shared/models/url.class";
import { DateFns } from "shared/utils/date-fns";
import { MediaEnum } from "../../../../shared/models/enum/media.enum";
import { findAllGenreIdsByNames } from "../app/data/genres.data";
import { CINEMA_ID, STREAM_ID } from "../app/models/enum/channel.enum";
import { Episode } from "../app/models/episode.class";
import { Media } from "../app/models/media.class";
import { Television } from "../app/models/television.class";
import { QuickAddButton, Strategy } from "../app/services/request-apis/request.api.service";

export function quickAddButtonReplace(media: Media, entry: QuickAddButton, proof: boolean) {
  if (proof) {
    if (entry.strategy !== Strategy.REPLACE) return media;
  }

  const value = cloneDeep(entry.value);

  const newMedia = new Media({
    ...media,
    // Eigentlich eine Liste, die immer APPEND wird,
    // aber im Spezialfall, dass alle ersetzt werden hier auch APPEND-Typen REPLACE müssen
    [entry.key]: entry.strategy === Strategy.APPEND ? [value] : value,
  });

  return newMedia;
}

export function quickAddButtonAppend(media: Media, entry: QuickAddButton) {
  if (entry.strategy !== Strategy.APPEND) return media;

  const value = cloneDeep(entry.value);

  let oldValues = media[entry.key] as any[];

  if (value instanceof Url) {
    const alreadyExists = oldValues.some((v) => v.url === value.url);
    if (!alreadyExists) {
      if (entry.appendAtFront) {
        oldValues.unshift(value);
      } else {
        oldValues.push(value);
      }
    }
  } else {
    oldValues = entry.appendAtFront
      ? [...new Set([value, ...oldValues])]
      : [...new Set([...oldValues, value])];
  }

  const newMedia = new Media({
    ...media,
    [entry.key]: oldValues,
  });

  return newMedia;
}

export function quickAddAppendAll(media: Media, quickAddButtons: QuickAddButton[]) {
  quickAddButtons.forEach((entry) => {
    media = quickAddButtonAppend(media, entry);
  });

  return media;
}

export function quickAddOrReplaceAll(media: Media, quickAddButtons: QuickAddButton[]) {
  quickAddButtons.forEach((entry) => {
    media = quickAddButtonAppend(media, entry);
    media = quickAddButtonReplace(media, entry, true);
  });

  return media;
}

export function quickReplaceAll(media: Media, quickAddButtons: QuickAddButton[]) {
  const keys: (keyof Media)[] = [];
  quickAddButtons.forEach((entry) => {
    // ! Bevor der erste Wert für einen Key gesetzt wird, muss das Feld geleert werden
    if (entry.strategy === Strategy.APPEND) {
      if (keys.includes(entry.key)) {
        media = quickAddButtonAppend(media, entry);
        // media = quickAddButtonReplace(media, entry, true);
      } else {
        media = quickAddButtonReplace(media, entry, false);
        keys.push(entry.key);
      }
    } else {
      media = quickAddButtonReplace(media, entry, true);
    }
  });

  return media;
}

export function getTelevisionByDateAndChannel(
  type: MediaEnum,
  releaseDate?: Date,
  channelId?: string
): Television | null {
  if (releaseDate && DateFns.isAfterOrToday(releaseDate)) {
    const date = DateFns.setTimeRangeToDate(releaseDate, 0, 0);
    const times: TimeRange[][] = [[], [], [], [], [], [], []];

    const timeRange: TimeRange = { start: { hours: 0, minutes: 0 }, end: null };
    times[date.getDay()] = [timeRange];

    if (type === MediaEnum.SERIES) {
      // ! Staffel muss gesetzt sein
      // ! Aktuelle Episode muss gesetzt sein
      const television = new Television({
        channelId: channelId ?? STREAM_ID,
        episode: new Episode({ season: 1, episode: 1 }),
        date,
        times,
      });

      return television;
    } else {
      const television = new Television({
        channelId: channelId ?? CINEMA_ID,
        date,
        times,
      });

      return television;
    }
  } else if (!releaseDate && channelId) {
    const television = new Television({
      channelId: channelId,
      episode: type === MediaEnum.SERIES ? new Episode({ season: 1, episode: 1 }) : undefined,
      onlyChannel: true,
    });

    return television;
  }

  return null;
}

export function getLanguages(languageTexts: string[]): string[] {
  return languageTexts.map((text) => findLanguageKeyByText(text, true));
}

export function getCountriesWithObjects(countryTexts: any[]): string[] {
  return countryTexts
    .map((country) => country.name as string)
    .map((country) => (country === "United States of America" ? "United States" : country));
}

export function appendGenresByTagContents(genreIds: number[], tags: string[]) {
  genreIds.push(...findAllGenreIdsByNames(tags));

  return [...new Set(genreIds)];
}
