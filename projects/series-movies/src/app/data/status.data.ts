import { DropdownData } from "shared/models/dropdown.type";
import { QuickAddDropdownFilterFromSearch } from "shared/models/search-filter.type";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { findByTypes } from "shared/models/type.function";
import { FilterKey } from "../../../../../shared/models/enum/filter-keys.enum";
import { getAllSearchTerms } from "../../utils/translation";
import { StatusType } from "../models/enum/status.enum";

export const STATUS_DROPDOWN_DATA: DropdownData<StatusType, string>[] = [
  {
    key: StatusType.CURRENT,
    name: "STATUS.CURRENT",
    icon: "television",
  },
  {
    key: StatusType.IN_FUTURE,
    name: "FUTURE.IN",
    icon: "calendar-future",
  },
  {
    key: StatusType.STARTED,
    name: "STATUS.STARTED",
    icon: "continue-watching",
    alternativeSearchTerms: ["Gestartet"],
  },
  {
    key: StatusType.EXPLORE,
    name: "STATUS.EXPLORE",
    icon: "explore",
    alternativeSearchTerms: ["discover", "nicht gestartet"],
  },
  {
    key: StatusType.SEASON_END,
    name: "STATUS.SEASON_END",
    icon: "season-finale",
  },
  {
    key: StatusType.SERIES_END,
    name: "STATUS.SERIES_END",
    icon: "series-end",
    alternativeSearchTerms: ["series end", "ende der serie"],
  },
  {
    key: StatusType.WATCHED,
    name: "STATUS.WATCHED",
    icon: "watched",
    alternativeSearchTerms: ["angeschaut", "angesehen"],
  },
];

export const STATUS: ReadonlyArray<Group<string>> = [
  {
    name: "STATUS.",
    icon: "status",
    entries: STATUS_DROPDOWN_DATA.map((status) => {
      const { key, name, icon, alternativeSearchTerms } = status;
      const entry: Entry<string> = {
        type: key,
        name,
        icon,
        additionalSearchTerms: alternativeSearchTerms,
      };
      return entry;
    }),
  },
];

export function findStatusByType(type: StatusType) {
  return STATUS_DROPDOWN_DATA.find((status) => status.key === type);
}

export const findMultipleStatusByType = (types: string[]): Entry<string>[] => {
  return findByTypes<string>(types, STATUS, "STATUS.CHOOSE", "STATUS.", "status", "status");
};

export const getQuickAddDropdownFilterFromSearch = <DropdownKeyType>(
  groups: DropdownData<DropdownKeyType, string>[],
  key: string
) => {
  return groups.map((group) => {
    const data: QuickAddDropdownFilterFromSearch<DropdownKeyType> = {
      text: group.name,
      icon: group.icon,
      key,
      types: [group.key],
      searchTerms: [...getAllSearchTerms(group.name), ...(group.alternativeSearchTerms ?? [])],
    };
    return data;
  });
};

export const STATUS_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH: ReadonlyArray<
  QuickAddDropdownFilterFromSearch<string>
> = getQuickAddDropdownFilterFromSearch(STATUS_DROPDOWN_DATA, FilterKey.STATUS);
