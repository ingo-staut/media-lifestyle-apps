import { TranslateService } from "@ngx-translate/core";
import { DateFns } from "shared/utils/date-fns";
import { splitTags } from "shared/utils/string";
import { getAllSearchTerms } from "../../utils/translation";
import {
  PreparationHistoryTimeType,
  PreparationHistoryType,
} from "./enum/preparation-history.enum";

export class PreparationHistoryEntry {
  date: Date;
  amount: number;
  note: string;
  type: PreparationHistoryType;
  portionsAvailable: number | null;
  preparationTimeType: PreparationHistoryTimeType;

  // Nicht in der Datenbank
  _lastAdded: Date;

  constructor(data: {
    date?: Date;
    amount?: number | null;
    note?: string;
    type?: PreparationHistoryType;
    portionsAvailable?: number | null;
    preparationTimeType?: PreparationHistoryTimeType;
  }) {
    this.date = data.date ?? new Date();
    this.amount = data.amount ?? 1;
    this.note = data.note ?? "";
    this.type = data.type ?? PreparationHistoryType.PREPARED;
    this.portionsAvailable = data.portionsAvailable ?? null;
    this.preparationTimeType = data.preparationTimeType ?? PreparationHistoryTimeType.MORNING;
    this._lastAdded = new Date();
  }

  static parse(text: string, translateService: TranslateService): PreparationHistoryEntry {
    const values = splitTags(text);

    let date: Date | null = null;
    let type: PreparationHistoryType | null = null;
    let amount: number | null = null;

    const indexUsed = new Set<number>();

    values.forEach((v, index) => {
      if (!date) {
        date = DateFns.getDateOfString(v, translateService);
        if (date) indexUsed.add(index);
      }
      if (!type) {
        type = PreparationHistoryEntry.getPreparationOfString(v);
        if (type) indexUsed.add(index);
      }
      if (!amount) {
        amount = PreparationHistoryEntry.getPortionAmountOfString(v);
        if (amount) indexUsed.add(index);
      }
    });

    if (!date) date = new Date();
    if (!amount) amount = 1;

    // Wenn kein Typ angegeben wurde,
    // dann wird der Typ auf "Vorbereitet" gesetzt,
    // wenn das Datum vor heute liegt
    const isDateBeforeToday = DateFns.isBeforeOrToday(date);
    type =
      isDateBeforeToday && !type ? PreparationHistoryType.PREPARED : PreparationHistoryType.PLANNED;

    return new PreparationHistoryEntry({ date, type, amount });
  }

  static sortDescending = (a: PreparationHistoryEntry, b: PreparationHistoryEntry) => {
    return b.date.getTime() - a.date.getTime();
  };

  static getPreparationOfString(text: string) {
    if (
      getAllSearchTerms("HISTORY.PLANNED").some((term) => text.toLowerCase() === term.toLowerCase())
    )
      return PreparationHistoryType.PLANNED;
    if (
      getAllSearchTerms("HISTORY.PREPARED").some(
        (term) => text.toLowerCase() === term.toLowerCase()
      )
    )
      return PreparationHistoryType.PREPARED;
    return null;
  }

  static getPortionAmountOfString(text: string) {
    const regEx = RegExp(
      `(\\d(?:(?:\\.|,)\\d)?) ?(?:port\\.|${getAllSearchTerms("PORTION.").join(
        "|"
      )}|${getAllSearchTerms("PORTION.S").join("|")})`,
      "i"
    );

    const match = text.match(regEx);
    if (!match) return null;

    return parseFloat(match[1]);
  }

  isEqual(other: PreparationHistoryEntry) {
    return (
      DateFns.sameDate(this.date, other.date) &&
      this.amount === other.amount &&
      this.note === other.note &&
      this.type === other.type &&
      this.portionsAvailable === other.portionsAvailable &&
      this.preparationTimeType === other.preparationTimeType
    );
  }

  static isEqual(entry1: PreparationHistoryEntry[], entry2: PreparationHistoryEntry[]) {
    entry1.sort(PreparationHistoryEntry.sortDescending);
    entry2.sort(PreparationHistoryEntry.sortDescending);

    if (entry1.length !== entry2.length) return false;

    for (let i = 0; i < entry1.length; i++) {
      if (!new PreparationHistoryEntry(entry1[i]).isEqual(entry2[i])) return false;
    }

    return true;
  }
}
