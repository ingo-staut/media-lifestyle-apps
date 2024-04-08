import { previousDaysKey } from "shared/data/date-ranges.data";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { DateFns, DateRange } from "shared/utils/date-fns";
import { isNumberBetween } from "shared/utils/number";
import { FILTERS } from "../data/filter.data";
import { Channel } from "./channel.class";
import { FilterButtonTristate } from "./filter-button-tristate.type";
import { FilterButtonValue } from "./filter-button-value.type";
import { FilterDates } from "./filter-dates.type";
import { FilterMultiSelectDynamicData } from "./filter-multi-select-dynamic-data.type";
import { FilterMultiSelectSpecific } from "./filter-multi-select-specific.type";
import { FilterMultiSelect } from "./filter-multi-select.type";
import { FilterNumbers } from "./filter-numbers.type";
import { DEFAULT_KEY, FilterSelect } from "./filter-select.type";
import { Filter } from "./filter.type";
import { Media } from "./media.class";

export class FilterFunctions {
  static isValueSet(filter: Filter): boolean {
    if ("min" in filter) {
      return filter.show;
    } else if ("_filterButtonTristate" in filter) {
      return filter.show && filter.value !== ButtonTristate.NONE;
    } else if ("_filterMultiSelect" in filter) {
      return (
        filter.show &&
        filter.value.length > 0 &&
        !filter.value.includes(0) &&
        !filter.value.includes("none")
      );
    } else if ("dynamicDataIndex" in filter || "_filterMultiSelectSpecific" in filter) {
      return filter.show && filter.value.length > 0 && !filter.value.includes("none");
    } else if ("_filterDates" in filter) {
      return filter.show;
    } else if ("_filterNumbers" in filter) {
      return filter.show;
    } else if ("_filterSelect" in filter) {
      return filter.show && filter.value !== DEFAULT_KEY;
    }
    return false;
  }

  static triggerFunction(media: Media, filter: Filter, channels: Channel[]) {
    if ("min" in filter) {
      return filter.func(media, filter);
    } else if ("_filterButtonTristate" in filter) {
      return filter.func(media, filter);
    } else if ("_filterMultiSelect" in filter) {
      return filter.func(media, filter, channels);
    } else if ("dynamicDataIndex" in filter) {
      return filter.func(media, filter);
    } else if ("_filterMultiSelectSpecific" in filter) {
      return filter.func(media, filter);
    } else if ("_filterDates" in filter) {
      return filter.func(media, filter);
    } else if ("_filterNumbers" in filter) {
      return filter.func(media, filter);
    } else if ("_filterSelect" in filter) {
      return filter.func(media, filter);
    }
    return true;
  }

  static getFilterButtonValue(filter: Filter): FilterButtonValue | undefined {
    return "min" in filter ? filter : undefined;
  }

  static getFilterButtonTristate(filter: Filter): FilterButtonTristate | undefined {
    return "_filterButtonTristate" in filter ? filter : undefined;
  }

  static getFilterMultiSelect(filter: Filter): FilterMultiSelect | undefined {
    return "_filterMultiSelect" in filter ? filter : undefined;
  }

  static getFilterMultiSelectDynamicData(filter: Filter): FilterMultiSelectDynamicData | undefined {
    return "dynamicDataIndex" in filter ? filter : undefined;
  }

  static getFilterMultiSelectSpecific(filter: Filter): FilterMultiSelectSpecific | undefined {
    return "_filterMultiSelectSpecific" in filter ? filter : undefined;
  }

  static getFilterDates(filter: Filter): FilterDates | undefined {
    return "_filterDates" in filter ? filter : undefined;
  }

  static getFilterNumbers(filter: Filter): FilterNumbers | undefined {
    return "_filterNumbers" in filter ? filter : undefined;
  }

  static getFilterSelect(filter: Filter): FilterSelect | undefined {
    return "_filterSelect" in filter ? filter : undefined;
  }

  static getValuesFromParams(filter: Filter, params: any) {
    const filterButtonValue = FilterFunctions.getFilterButtonValue(filter);
    const filterButtonTristate = FilterFunctions.getFilterButtonTristate(filter);
    const filterMultiSelect = FilterFunctions.getFilterMultiSelect(filter);
    const filterMultiSelectDynamicData = FilterFunctions.getFilterMultiSelectDynamicData(filter);
    const filterMultiSelectSpecific = FilterFunctions.getFilterMultiSelectSpecific(filter);
    const filterDates = FilterFunctions.getFilterDates(filter);
    const filterNumbers = FilterFunctions.getFilterNumbers(filter);
    const filterSelect = FilterFunctions.getFilterSelect(filter);

    // Button mit Wert
    if (filterButtonValue && params[filterButtonValue.key]) {
      const values = params[filterButtonValue.key].split(":");
      filterButtonValue.value = +values[0];
      filterButtonValue.min = values[1] === "min";
      filterButtonValue.hideNullValues = values[2] === "hideNullValues";
      filterButtonValue.show = true;
      return filterButtonValue;
    }

    // TristateButton
    else if (filterButtonTristate && params[filterButtonTristate.key]) {
      filterButtonTristate.value = params[filterButtonTristate.key].toUpperCase() as ButtonTristate;
      filterButtonTristate.show = true;
      return filterButtonTristate;
    }

    // Dropdown
    else if (filterMultiSelect && params[filterMultiSelect.key]) {
      const isString = filterMultiSelect.isString;
      const selected: any[] = [];
      params[filterMultiSelect.key].split(",").forEach((text: string) => {
        if (text !== "" && text !== "none" && +text !== 0) selected.push(isString ? text : +text);
      });
      filterMultiSelect.value = selected.length === 0 ? [isString ? "none" : 0] : selected;
      filterMultiSelect.show = true;
    }

    // Dropdown mit dynamischen Daten
    else if (filterMultiSelectDynamicData && params[filterMultiSelectDynamicData.key]) {
      const selected: string[] = [];
      params[filterMultiSelectDynamicData.key].split(",").forEach((text: string) => {
        if (text !== "" && text !== "none") selected.push(text);
      });
      filterMultiSelectDynamicData.value = selected.length === 0 ? ["none"] : selected;
      filterMultiSelectDynamicData.show = true;
    }

    // Dropdown mit Datumsangaben
    else if (filterDates && params[filterDates.key]) {
      const key = params[filterDates.key].split(":")[0];

      if (params[filterDates.key].split(":").length === 2) {
        const text = params[filterDates.key].split(":")[1];
        this.setDateToFilterEntry(text, key, filterDates);
      } else {
        filterDates.value = key;
        filterDates.show = true;
      }
    }

    // Dropdown mit Zahlen
    else if (filterNumbers && params[filterNumbers.key]) {
      const key = params[filterNumbers.key].split(":")[0];

      if (params[filterNumbers.key].split(":").length === 2) {
        const text = params[filterNumbers.key].split(":")[1];
        this.setNumbersToFilterEntry(text, key, filterNumbers);
      } else {
        filterNumbers.value = key;
        filterNumbers.show = true;
      }
    }

    // Dropdown
    else if (filterSelect && params[filterSelect.key]) {
      filterSelect.value = params[filterSelect.key];
      filterSelect.show = true;
    }

    return filter;
  }

  static setValuesToParams(filter: Filter, params: any) {
    const filterButtonValue = FilterFunctions.getFilterButtonValue(filter);
    const filterButtonTristate = FilterFunctions.getFilterButtonTristate(filter);
    const filterMultiSelect = FilterFunctions.getFilterMultiSelect(filter);
    const filterMultiSelectDynamicData = FilterFunctions.getFilterMultiSelectDynamicData(filter);
    const filterMultiSelectSpecific = FilterFunctions.getFilterMultiSelectSpecific(filter);
    const filterDates = FilterFunctions.getFilterDates(filter);
    const filterNumbers = FilterFunctions.getFilterNumbers(filter);
    const filterSelect = FilterFunctions.getFilterSelect(filter);

    // Button mit Wert
    if (filterButtonValue && filterButtonValue.show) {
      params[filterButtonValue.key] = `${filterButtonValue.value}:${
        filterButtonValue.min ? "min" : "max"
      }:${filterButtonValue.hideNullValues ? "hideNullValues" : "showNullValues"}`;
    }

    // TristateButton
    else if (filterButtonTristate && this.isValueSet(filterButtonTristate)) {
      params[filterButtonTristate.key] = filterButtonTristate.value.toLocaleLowerCase();
    }

    // Dropdown
    else if (filterMultiSelect && this.isValueSet(filterMultiSelect)) {
      params[filterMultiSelect.key] = filterMultiSelect.value.join(",");
    }

    // Dropdown mit dynamischen Daten
    else if (filterMultiSelectDynamicData && this.isValueSet(filterMultiSelectDynamicData)) {
      params[filterMultiSelectDynamicData.key] = filterMultiSelectDynamicData.value.join(",");
    }

    // Dropdown mit Datumsangaben
    else if (filterDates && this.isValueSet(filterDates)) {
      const data = filterDates.data.find((d) => d.key == filterDates.value);
      if (data && data.value?.range.from && data.value?.range.to) {
        if (data.value.showDateInputs) {
          params[filterDates.key] =
            filterDates.value + ":" + this.getDateStringForParams(data.value.range);
        } else if (data.value.showDayInput) {
          params[filterDates.key] =
            filterDates.value +
            ":" +
            DateFns.daysBetweenDates(data.value.range.from, data.value.range.to);
        } else {
          params[filterDates.key] = filterDates.value;
        }
      }
    }

    // Dropdown mit Zahlen
    else if (filterNumbers && this.isValueSet(filterNumbers)) {
      const data = filterNumbers.data.find((d) => d.key == filterNumbers.value);
      if (data && (data.value?.range.from || data.value?.range.to)) {
        if (data.value.showNumberInputs) {
          params[filterNumbers.key] =
            filterNumbers.value +
            ":" +
            (data.value.range.from || "") +
            "-" +
            (data.value.range.to || "");
          // } else if (data.value.showNumberInput) {
          //   params[filterNumbers.key] = filterNumbers.value + ":" + data.value.range.from;
        } else {
          params[filterNumbers.key] = filterNumbers.value;
        }
      }
    }

    // Dropdown
    else if (filterSelect && this.isValueSet(filterSelect)) {
      params[filterSelect.key] = filterSelect.value;
    }
  }

  static getDateFromParams(dates: string[]) {
    if (dates.length === 2) {
      let from = DateFns.getDateFromString(dates[0], "yyyy-MM-dd");
      let to = DateFns.getDateFromString(dates[1], "yyyy-MM-dd");

      if (!from) from = DateFns.firstDate;
      if (!to) to = DateFns.lastDate;

      return { from, to };
    } else {
      return null;
    }
  }

  static isPrevious(key: string) {
    return key === previousDaysKey;
  }

  static getDateRangeByDays(days: number, key: string) {
    const isPrevious = FilterFunctions.isPrevious(key);
    const daysAddFrom = isPrevious ? days - 2 * days : 0;
    const daysAddTo = isPrevious ? 0 : days;

    const from = DateFns.addDaysToDate(new Date(), daysAddFrom);
    const to = DateFns.addDaysToDate(new Date(), daysAddTo);

    const dateRange: DateRange = {
      from,
      to,
    };

    return dateRange;
  }

  static setDateToFilterEntry(text: string, key: string, filterDates: FilterDates) {
    const dateList = text.split(DateFns.separatorInParams);
    filterDates.data.map((d) => {
      if (d.key === key) {
        if (dateList.length === 2) {
          const dates = this.getDateFromParams(dateList);

          if (dates) {
            const { from, to } = dates;
            d.value = {
              range: {
                from,
                to,
              },
              showDateInputs: true,
            };
            filterDates.value = key;
            filterDates.show = true;
          }
        } else {
          const days = +text;
          const range = this.getDateRangeByDays(days, d.key);

          d.value = {
            range,
            showDayInput: true,
          };
          filterDates.value = key;
          filterDates.show = true;
        }
      }
      return d;
    });
  }

  static setNumbersToFilterEntry(text: string, key: string, filterNumbers: FilterNumbers) {
    const numbers = text.split("-");
    filterNumbers.data.map((d) => {
      if (d.key === key) {
        if (numbers.length === 2) {
          const from = +numbers[0];
          const to = +numbers[1];
          d.value = {
            ...d.value,
            min: d.value!.min,
            max: d.value!.max,
            range: {
              from: from || null,
              to: to || null,
            },
            showNumberInputs: true,
          };
          filterNumbers.value = key;
          filterNumbers.show = true;
          // } else {
          //   const from = +numbers[0];

          //   d.value = {
          //     range: { from },
          //     showNumberInput: true,
          //   };
          //   filterNumbers.value = key;
          //   filterNumbers.show = true;
        }
      }
      return d;
    });
  }

  static getDateStringForParams(range: DateRange): string {
    return (
      (DateFns.isFirstDay(range.from)
        ? ""
        : DateFns.formatDateByFormatString(range.from, "yyyy-MM-dd")) +
      DateFns.separatorInParams +
      (DateFns.isLastDay(range.to) ? "" : DateFns.formatDateByFormatString(range.to, "yyyy-MM-dd"))
    );
  }

  static getAllValuesFromParams(params: any) {
    FILTERS.forEach((filter) => {
      filter = FilterFunctions.getValuesFromParams(filter, params);
    });
    return FILTERS;
  }

  static setAllValuesToParams(params: any) {
    FILTERS.forEach((filter) => {
      FilterFunctions.setValuesToParams(filter, params);
    });
  }

  static filterButtonTristateShowMedia(valueFromMedia: boolean, filter: FilterButtonTristate) {
    if (!filter.show) return true;
    if (
      (filter.value === ButtonTristate.TRUE && valueFromMedia) ||
      (filter.value === ButtonTristate.FALSE && !valueFromMedia)
    )
      return true;
    return false;
  }

  static filterMultiSelectShowMedia(valueFromMedia: any, filter: FilterMultiSelect) {
    if (!filter.show) return true;

    return (
      !!filter.value.find((v) => valueFromMedia === v || (v === -1 && valueFromMedia === 0)) ||
      filter.value.length === 0 ||
      filter.value[0] === 0
    );
  }

  static filterDatesShowMedia(valueFromMedia: Date[], filter: FilterDates) {
    if (!filter.show) return true;

    const found = filter.data.find((data) => data.key === filter.value);
    if (!found) return true;

    return valueFromMedia.some(
      (date: Date) =>
        found.value?.range &&
        found.value?.range.from <= found.value?.range.to &&
        DateFns.isDateBetweenDates(date, found.value?.range.from, found.value?.range.to)
    );
  }

  static filterNumbersShowMedia(valueFromMedia: number, filter: FilterNumbers) {
    if (!filter.show) return true;
    if (!valueFromMedia) return false;

    const found = filter.data.find((data) => data.key === filter.value);
    if (!found) return true;

    return !!(
      found.value &&
      found.value.range &&
      (found.value.range.from ?? 0) <= (found.value.range.to ?? Infinity) &&
      isNumberBetween(valueFromMedia, found.value.range.from ?? 0, found.value.range.to ?? Infinity)
    );
  }

  static resetFilter(filter: Filter) {
    const filterButtonValue = FilterFunctions.getFilterButtonValue(filter);
    const filterButtonTristate = FilterFunctions.getFilterButtonTristate(filter);
    const filterMultiSelect = FilterFunctions.getFilterMultiSelect(filter);
    const filterMultiSelectSpecific = FilterFunctions.getFilterMultiSelectSpecific(filter);
    const filterMultiSelectDynamicData = FilterFunctions.getFilterMultiSelectDynamicData(filter);
    const filterDates = FilterFunctions.getFilterDates(filter);
    const filterNumbers = FilterFunctions.getFilterNumbers(filter);
    const filterSelect = FilterFunctions.getFilterSelect(filter);

    // Button mit Wert
    if (filterButtonValue) {
      filterButtonValue.show = false;
      filterButtonValue.value = 0;
      return filterButtonValue;
    }

    // TristateButton
    else if (filterButtonTristate) {
      filterButtonTristate.show = false;
      // Wert wird auf TRUE gesetzt, damit beim neuen
      // Hinzufügen des Filters direkt der Filter gesetzt wird
      filterButtonTristate.value = ButtonTristate.TRUE;
      return filterButtonTristate;
    }

    // Dropdown
    else if (filterMultiSelect) {
      filterMultiSelect.show = false;
      filterMultiSelect.value = [filterMultiSelect.isString ? "none" : 0];
      return filterMultiSelect;
    }

    // Dropdown
    else if (filterMultiSelectSpecific) {
      filterMultiSelectSpecific.show = false;
      filterMultiSelectSpecific.value = ["none"];
      return filterMultiSelectSpecific;
    }

    // Dropdown mit dynamischen Daten
    else if (filterMultiSelectDynamicData) {
      filterMultiSelectDynamicData.show = false;
      filterMultiSelectDynamicData.value = ["none"];
      return filterMultiSelectDynamicData;
    }

    // Dropdwon mit Datumsangaben
    else if (filterDates) {
      filterDates.show = false;
      filterDates.value = "today";
      return filterDates;
    }

    // Dropdwon mit Nummern
    else if (filterNumbers) {
      filterNumbers.show = false;
      filterNumbers.value = filterNumbers.valueDefault;
      return filterNumbers;
    }

    // Dropdown
    else if (filterSelect) {
      filterSelect.show = false;
      filterSelect.value = DEFAULT_KEY;
      return filterSelect;
    }

    return filter;
  }
}
