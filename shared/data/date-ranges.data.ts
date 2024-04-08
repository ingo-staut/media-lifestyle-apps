import { DropdownDataWithNumberRange } from "shared/models/dropdown-data-with-number-range.type";
import { DropdownDataWithRange } from "shared/models/dropdown-data-with-range.type";
import { DropdownData } from "shared/models/dropdown.type";
import { DateFns } from "shared/utils/date-fns";

enum GroupKey {
  MISSED = "missed",
  TODAY = "today",
  PREVIOUS = "previous",
  NEXT = "next",
  THIS = "this",
  RANGE = "range",
}

export const previousDaysKey = "previous-days";

export const missed: DropdownData<string, DropdownDataWithRange> = {
  key: "missed",
  name: "DATE.MISSED",
  icon: "calendar-missed",
  value: { range: { from: DateFns.firstDate, to: DateFns.addDaysToDate(new Date(), -1) } },
  groupKey: GroupKey.MISSED,
};

export const today: DropdownData<string, DropdownDataWithRange> = {
  key: "today",
  name: "DATE.TODAY",
  icon: "calendar-today",
  value: { range: { from: new Date(), to: new Date() } },
  groupKey: GroupKey.TODAY,
};

export const yesterday: DropdownData<string, DropdownDataWithRange> = {
  key: "yesterday",
  name: "DATE.YESTERDAY",
  icon: "calendar-yesterday",
  value: {
    range: {
      from: DateFns.addDaysToDate(new Date(), -1),
      to: DateFns.addDaysToDate(new Date(), -1),
    },
  },
  groupKey: GroupKey.PREVIOUS,
};

export const dayBeforeYesterday: DropdownData<string, DropdownDataWithRange> = {
  key: "day-before-yesterday",
  name: "DATE.BEFORE_YESTERDAY",
  icon: "calendar-yesterday",
  value: {
    range: {
      from: DateFns.addDaysToDate(new Date(), -2),
      to: DateFns.addDaysToDate(new Date(), -2),
    },
  },
  groupKey: GroupKey.PREVIOUS,
};

export const tomorrow: DropdownData<string, DropdownDataWithRange> = {
  key: "tomorrow",
  name: "DATE.TOMORROW",
  icon: "calendar-tomorrow",
  value: {
    range: {
      from: DateFns.addDaysToDate(new Date(), 1),
      to: DateFns.addDaysToDate(new Date(), 1),
    },
  },
  groupKey: GroupKey.NEXT,
};

export const dayAfterTomorrow: DropdownData<string, DropdownDataWithRange> = {
  key: "day-after-tomorrow",
  name: "DATE.AFTER_TOMORROW",
  icon: "calendar-tomorrow",
  value: {
    range: {
      from: DateFns.addDaysToDate(new Date(), 2),
      to: DateFns.addDaysToDate(new Date(), 2),
    },
  },
  groupKey: GroupKey.NEXT,
};

export const thisWeek: DropdownData<string, DropdownDataWithRange> = {
  key: "this-week",
  name: "DATE.THIS_WEEK",
  icon: "calendar-week",
  value: {
    range: {
      from: DateFns.getStartDateOfWeek(new Date()),
      to: DateFns.getEndDateOfWeek(new Date()),
    },
  },
  groupKey: GroupKey.THIS,
};

export const thisMonth: DropdownData<string, DropdownDataWithRange> = {
  key: "this-month",
  name: "DATE.THIS_MONTH",
  icon: "calendar-month",
  value: {
    range: {
      from: DateFns.getStartDateOfMonth(new Date()),
      to: DateFns.getEndDateOfMonth(new Date()),
    },
  },
  groupKey: GroupKey.THIS,
};

export const thisYear: DropdownData<string, DropdownDataWithNumberRange> = {
  key: "this-year",
  name: "DATE.THIS_YEAR",
  icon: "calendar",
  value: {
    range: { from: new Date().getFullYear(), to: new Date().getFullYear() },
    min: 0,
    max: Infinity,
  },
  groupKey: GroupKey.THIS,
};

export const nextYear: DropdownData<string, DropdownDataWithNumberRange> = {
  key: "next-year",
  name: "DATE.NEXT_YEAR",
  icon: "calendar-future",
  value: {
    range: { from: new Date().getFullYear() + 1, to: new Date().getFullYear() + 1 },
    min: 0,
    max: Infinity,
  },
  groupKey: GroupKey.THIS,
};

// export const nextYears: DropdownData<string, DropdownDataWithNumberRange> = {
//   key: "next-years",
//   name: "DATE.NEXT_X_YEARS",
//   icon: "calendar",
//   value: {
//     range: { from: new Date().getFullYear(), to: new Date().getFullYear() + 2 },
//     showNumberInput: true,
//     textFrom: "Anzahl Jahre",
//   },
//   groupKey: GroupKey.NEXT,
// };

export const previousYear: DropdownData<string, DropdownDataWithNumberRange> = {
  key: "previous-year",
  name: "DATE.PREVIOUS_YEAR",
  icon: "calendar-past",
  value: {
    range: { from: new Date().getFullYear() - 1, to: new Date().getFullYear() - 1 },
    min: 0,
    max: Infinity,
  },
  groupKey: GroupKey.THIS,
};

// export const previousYears: DropdownData<string, DropdownDataWithNumberRange> = {
//   key: "previous-years",
//   name: "DATE.PREVIOUS_X_YEARS",
//   icon: "calendar",
//   value: {
//     range: { from: new Date().getFullYear() - 2, to: new Date().getFullYear() },
//     showNumberInput: true,
//     textFrom: "Anzahl Jahre",
//   },
//   groupKey: GroupKey.PREVIOUS,
// };

export const selectYears: DropdownData<string, DropdownDataWithNumberRange> = {
  key: "year-range",
  name: "DATE.DATE_RANGE",
  icon: "calendar-range",
  value: {
    range: { from: new Date().getFullYear() - 1, to: new Date().getFullYear() + 1 },
    showNumberInputs: true,
    textFrom: "YEAR.START.",
    textTo: "YEAR.END.",
    min: 1900,
    max: 2300,
  },
  groupKey: GroupKey.RANGE,
};

export const nextXDaysInput: DropdownData<string, DropdownDataWithRange> = {
  key: "next-days",
  name: "DATE.NEXT_X_DAYS",
  icon: "calendar-days",
  value: {
    range: {
      from: DateFns.addDaysToDate(new Date(), 0),
      to: DateFns.addDaysToDate(new Date(), 7),
    },
    showDayInput: true,
  },
  groupKey: GroupKey.NEXT,
};

export const previousXDaysInput: DropdownData<string, DropdownDataWithRange> = {
  key: previousDaysKey,
  name: "DATE.PREVIOUS_X_DAYS",
  icon: "calendar-days",
  value: {
    range: {
      from: DateFns.addDaysToDate(new Date(), -7),
      to: DateFns.addDaysToDate(new Date(), 0),
    },
    showDayInput: true,
  },
  groupKey: GroupKey.PREVIOUS,
};

export const next30DaysDateRange: DropdownData<string, DropdownDataWithRange> = {
  key: "date-range",
  name: "DATE.DATE_RANGE",
  icon: "calendar-range",
  value: {
    range: {
      from: DateFns.addDaysToDate(new Date(), 0),
      to: DateFns.addDaysToDate(new Date(), 30),
    },
    showDateInputs: true,
  },
  groupKey: GroupKey.RANGE,
};

export const previous30DaysDateRange: DropdownData<string, DropdownDataWithRange> = {
  key: "date-range",
  name: "DATE.DATE_RANGE",
  icon: "calendar-range",
  value: {
    range: {
      from: DateFns.addDaysToDate(new Date(), -30),
      to: DateFns.addDaysToDate(new Date(), 0),
    },
    showDateInputs: true,
  },
  groupKey: GroupKey.RANGE,
};

export const all: DropdownData<string, DropdownDataWithRange>[] = [
  thisMonth,
  thisWeek,
  nextXDaysInput,
  dayAfterTomorrow,
  tomorrow,

  today,

  yesterday,
  dayBeforeYesterday,
  previousXDaysInput,

  missed,

  next30DaysDateRange,
];

export const previousOnly: DropdownData<string, DropdownDataWithRange>[] = [
  today,

  yesterday,
  dayBeforeYesterday,
  previousXDaysInput,

  thisWeek,
  thisMonth,

  previous30DaysDateRange,
];

export const nextOnly: DropdownData<string, DropdownDataWithRange>[] = [
  today,

  tomorrow,
  dayAfterTomorrow,
  nextXDaysInput,

  thisWeek,
  thisMonth,

  next30DaysDateRange,
];

export const missedAndNextOnly: DropdownData<string, DropdownDataWithRange>[] = [
  missed,
  ...nextOnly,
];

export const years: DropdownData<string, DropdownDataWithNumberRange>[] = [
  // previousYears,
  previousYear,
  thisYear,
  nextYear,
  // nextYears,
  selectYears,
];
