import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { getAllSearchTerms } from "projects/recipes/src/utils/translation";
import { BehaviorSubject, combineLatest, map, startWith } from "rxjs";
import {
  ButtonTristate,
  getButtonTristateIndexByType,
} from "shared/models/enum/button-tristate.enum";
import { FilterKey } from "shared/models/enum/filter-keys.enum";
import { Group } from "shared/models/type-group.type";
import { REGEX_PRICE } from "shared/utils/regexp";
import { splitStringBySeparator } from "shared/utils/string";
import { RATINGS_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH } from "../../../../../../shared/data/rating.data";
import {
  QuickAddFilterButtonTristateFromSearch,
  QuickAddFilterDatesFromSearch,
  QuickAddFilterFromSearch,
} from "../../../../../../shared/models/search-filter.type";
import { CATEGORIES_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH } from "../../data/category.data";
import { DIFFICULTIES_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH } from "../../data/difficulty.data";
import { FILTERS } from "../../data/filter.data";
import { CONTENTS_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH } from "../../data/ingredient-contents.data";
import { CategoryType, findCategoryByText } from "../../models/enum/category.enum";
import { FilterFunctions } from "../../models/filter.functions";
import { Filter } from "../../models/filter.type";
import { RecipeApiService } from "../../services/recipe/recipe.api.service";
import { SearchService } from "./search.service";
import { SearchUrlService } from "./search.url.service";

const NEGATION_TEXTS = [
  "nicht",
  "kein",
  "keine",
  "ohne",
  "without",
  "not",
  "no",
  "pas",
  "non",
  "sin",
];

@Injectable({
  providedIn: "root",
})
export class SearchFilterService {
  private filtersSubject = new BehaviorSubject<Filter[]>(FILTERS);
  filters$ = this.filtersSubject.asObservable();
  filtersSet$ = this.filters$.pipe(
    map((filters) => filters.filter((filter) => FilterFunctions.isValueSet(filter)).length)
  );
  filtersVisible$ = this.filters$.pipe(
    map((filters) => filters.filter((filter) => filter.show).length)
  );

  get filtersSnapshot() {
    return this.filtersSubject.value;
  }

  get filtersSetSnapshot() {
    return this.filtersSnapshot.some((filter) => FilterFunctions.isValueSet(filter));
  }

  resultCountSubject = new BehaviorSubject<number>(30);
  resultCount$ = this.resultCountSubject.asObservable();

  QuickAddDropdownFilter = [
    ...RATINGS_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH,
    ...CATEGORIES_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH,
    ...DIFFICULTIES_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH,
  ];

  QuickAddDropdownSpecificFilter = [...CONTENTS_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH];

  quickAddFilterFromSearch$ = combineLatest([
    this.searchService.searchValue$,
    this.recipeApiService.searchFilterSourceUrls$,
    this.translateService.onLangChange
      .asObservable()
      .pipe(startWith(this.translateService.defaultLang)),
  ]).pipe(
    map(([searchValue, sourceUrls]) => {
      if (!searchValue) return;
      searchValue = searchValue.trim();

      const currentQuickAddFilterFromSearch: QuickAddFilterFromSearch[] = [];

      const {
        addFilter,
        removeFilter,
        searchValue: searchValueTrimmed,
      } = this.getAddRemoveFilter(searchValue);

      let searchValueWithoutNegationWords = searchValueTrimmed;

      if (!searchValueTrimmed) return;

      const searchFragments = splitStringBySeparator(searchValueTrimmed, {
        mainSeparator: " ",
        separator: undefined,
        trimAll: true,
        removeAllEmpty: true,
      });

      // Negation setzten, wenn der Value im NEGATION_TEXTS drin ist
      // Alle valueFragments einaml durchgehen und schauen ob der Value drin ist
      const negation = NEGATION_TEXTS.some((negationText) =>
        // Schauen ob searcnFragments den negationText drin hat
        {
          const negation = searchFragments.some(
            (searchFragment) => searchFragment.toLowerCase() === negationText.toLowerCase()
          );

          searchValueWithoutNegationWords = searchFragments
            .filter((searchFragment) => searchFragment.toLowerCase() !== negationText.toLowerCase())
            .join(" ");

          return negation;
        }
      )
        ? ButtonTristate.FALSE
        : ButtonTristate.TRUE;

      currentQuickAddFilterFromSearch.push(
        ...this.getFilteredQuickAddFilterButtonTristateFromSearch(searchValueTrimmed, negation),
        ...this.getFilteredQuickAddFilterButtonValueFromSearch(searchValueTrimmed, negation),
        ...this.getFilteredQuickAddFilterMultiSelectFromSearch(
          searchValueTrimmed,
          addFilter,
          removeFilter
        ),
        ...this.getFilteredQuickAddFilterMultiSelectSpecificFromSearch(
          searchValueWithoutNegationWords,
          addFilter,
          removeFilter,
          negation
        ),
        ...this.getFilteredQuickAddFilterMultiSelectDynamicDataFromSearch(
          sourceUrls,
          FilterKey.URLS,
          searchValueTrimmed,
          addFilter,
          removeFilter
        ),
        ...this.getFiltersQuickAddFilterDates(searchValueTrimmed)
      );

      const category = findCategoryByText(searchValueTrimmed);
      if (category.type !== CategoryType.NONE) {
        const filter: QuickAddFilterFromSearch = {
          key: FilterKey.CATEGORIES,
          text: category.name,
          icons: [category.icon],
          matchWeight: category.matchWeight,
          func: () => {
            this.quickAddDropdownFilter(
              [category.type as number],
              addFilter,
              removeFilter,
              FilterKey.CATEGORIES
            );
          },
        };
        currentQuickAddFilterFromSearch.push(filter);
      }

      return (
        currentQuickAddFilterFromSearch
          // Sortierung nach matchWeight
          .sort((a, b) => (b.matchWeight ?? 0) - (a.matchWeight ?? 0))
          // Alle mit dem höchsten matchWeight
          .filter((filter, _, array) => filter.matchWeight === array[0].matchWeight)
      );
    })
  );

  readonly QuickAddFilterButtonValue = FILTERS.map((filter) => {
    const f = FilterFunctions.getFilterButtonValue(filter);
    if (f) {
      const { texts, icons, key, suffixShort, suffixLong, sliderAndValueMax, searchTerms } = f;

      const data: QuickAddFilterButtonTristateFromSearch = {
        key,
        searchTerms: [...getAllSearchTerms(texts[0]), ...searchTerms],
        texts,
        icons,
        suffixShort,
        suffixLong,
        max: sliderAndValueMax,
      };
      return data;
    }
    return null;
  }).filter((filter): filter is QuickAddFilterButtonTristateFromSearch => !!filter);

  readonly QuickAddFilterButtonTristate = FILTERS.map((filter) => {
    if (FilterFunctions.getFilterButtonTristate(filter)) {
      const { texts, icons, key } = filter;
      const data: QuickAddFilterButtonTristateFromSearch = {
        key,
        searchTerms: getAllSearchTerms(texts[0]),
        texts,
        icons,
      };
      return data;
    }
    return null;
  }).filter((filter): filter is QuickAddFilterButtonTristateFromSearch => !!filter);

  readonly QuickAddFilterDates = FILTERS.map((filter) => {
    const filterDates = FilterFunctions.getFilterDates(filter);
    if (filterDates) {
      return filterDates.data.map((filterDate) => {
        const { name, icon, key } = filterDate;

        // WORKAROUND
        const additionalTerms =
          name === "DATE.PREVIOUS_X_DAYS"
            ? ["Letzten {{ days }} Tage", "Vor {{ days }} Tagen", "Last {{ days }} days"]
            : name === "DATE.THIS_MONTH"
            ? ["Diesen Monat"]
            : [];

        const { showDayInput, showDateInputs } = filterDate.value!;
        const data: QuickAddFilterDatesFromSearch = {
          key: filterDates.key,
          searchTerms: [...getAllSearchTerms(name), ...additionalTerms].map((term) =>
            term.toLowerCase()
          ),
          text: name,
          searchTermsRequired: [
            ...getAllSearchTerms(filterDates.texts[0]),
            ...filterDates.additionalTermsRequired,
          ].map((term) => term.toLowerCase()),
          icon: filterDates.extraIcon ? filterDates.icons[0] : icon,
          value: key,
          showDayInput,
          showDateInputs,
        };
        return data;
      });
    }
    return null;
  })
    .flat()
    .filter((filter): filter is QuickAddFilterDatesFromSearch => !!filter);

  constructor(
    private searchService: SearchService,
    private searchUrlService: SearchUrlService,
    private recipeApiService: RecipeApiService,
    private translateService: TranslateService
  ) {}

  setFilters(value: Filter[]) {
    this.filtersSubject.next(value);
  }

  setFilterByIndex(value: Filter, index: number) {
    const list = this.filtersSubject.value;
    list[index] = value;
    this.filtersSubject.next(list);
  }

  setFilterByKey(value: Filter) {
    const list = this.filtersSubject.value;
    const index = list.findIndex((filter) => filter.key === value.key);
    if (index === -1) return;
    list[index] = value;
    this.filtersSubject.next(list);
  }

  removeAllFilters() {
    const list = this.filtersSubject.value;
    list.forEach((filter) => {
      filter = FilterFunctions.resetFilter(filter);
    });
    this.filtersSubject.next(list);
  }

  quickAddDropdownFilter(types: number[], add: boolean, remove: boolean, key: string) {
    const data = this.filtersSubject.value;
    data.forEach((filter) => {
      if (filter.key === key) {
        const filterMultiSelect = FilterFunctions.getFilterMultiSelect(filter);
        if (!filterMultiSelect) return;
        filterMultiSelect.show = true;

        let values = filterMultiSelect.value;

        if (add) {
          values = [...values, ...types];
          values = values.filter((x) => x !== 0);
          values = [...new Set(values)];
        } else if (remove) {
          values = values.filter((x) => !types.includes(x));
          values = values.length === 0 ? [0] : values;
        } else {
          values = types;
        }

        filterMultiSelect.value = values;
        filter = filterMultiSelect;
      }
    });

    this.filtersSubject.next(data);
    this.searchService.clearSearchValue();
    this.searchUrlService.setSearchUrl();
  }

  quickAddDropdownSpecificFilter(types: string[], add: boolean, remove: boolean, key: string) {
    const data = this.filtersSubject.value;
    data.forEach((filter) => {
      if (filter.key === key) {
        const filterMultiSelectSpecific = FilterFunctions.getFilterMultiSelectSpecific(filter);
        if (!filterMultiSelectSpecific) return;
        filterMultiSelectSpecific.show = true;

        let values = filterMultiSelectSpecific.value;

        if (add) {
          values = [...values, ...types];
          values = values.filter((x) => x !== "none");
          values = [...new Set(values)];
        } else if (remove) {
          values = values.filter((x) => !types.includes(x));
          values = values.length === 0 ? ["none"] : values;
        } else {
          values = types;
        }

        filterMultiSelectSpecific.value = values;
        filter = filterMultiSelectSpecific;
      }
    });

    this.filtersSubject.next(data);
    this.searchService.clearSearchValue();
    this.searchUrlService.setSearchUrl();
  }

  quickAddDropdownDynamicDataFilter(types: string[], add: boolean, remove: boolean, key: string) {
    const data = this.filtersSubject.value;
    data.forEach((filter) => {
      if (filter.key === key) {
        const filterMultiSelectDynamicData =
          FilterFunctions.getFilterMultiSelectDynamicData(filter);
        if (!filterMultiSelectDynamicData) return;
        filterMultiSelectDynamicData.show = true;

        let values = filterMultiSelectDynamicData.value;

        if (add) {
          values = [...values, ...types];
          values = values.filter((x) => x !== "none");
          values = [...new Set(values)];
        } else if (remove) {
          values = values.filter((x) => !types.includes(x));
          values = values.length === 0 ? ["none"] : values;
        } else {
          values = types;
        }

        filterMultiSelectDynamicData.value = values;
        filter = filterMultiSelectDynamicData;
      }
    });

    this.filtersSubject.next(data);
    this.searchService.clearSearchValue();
    this.searchUrlService.setSearchUrl();
  }

  quickAddDatesFilter(selectedKey: string, key: string, days?: number) {
    const data = this.filtersSubject.value;
    data.map((filter) => {
      if (filter.key === key) {
        const filterDates = FilterFunctions.getFilterDates(filter);
        if (!filterDates) return;
        filterDates.show = true;
        filterDates.data.map((dataItem) => {
          if (dataItem.key === selectedKey) {
            if (days) {
              const range = FilterFunctions.getDateRangeByDays(days, dataItem.key);
              dataItem.value = { ...dataItem.value, range };
            }
          }
          return dataItem;
        });

        filterDates.value = selectedKey;
        filter = filterDates;
      }
      return filter;
    });

    this.filtersSubject.next(data);
    this.searchService.clearSearchValue();
    this.searchUrlService.setSearchUrl();
  }

  getAddRemoveFilter(searchValue: string) {
    let addFilter = false;
    let removeFilter = false;

    if (searchValue.startsWith("+")) {
      addFilter = true;
      searchValue = searchValue.substring(1).trim();
    } else {
      addFilter = false;
    }

    if (searchValue.startsWith("-")) {
      removeFilter = true;
      searchValue = searchValue.substring(1).trim();
    } else {
      removeFilter = false;
    }

    return { addFilter, removeFilter, searchValue };
  }

  getFilteredQuickAddFilterButtonTristateFromSearch(searchValue: string, negation: ButtonTristate) {
    return this.QuickAddFilterButtonTristate.map((filterFromSearch) => {
      if (filterFromSearch === null) return null;

      const showFilter = filterFromSearch.searchTerms.some((text) =>
        searchValue.toLowerCase().includes(text.toLowerCase())
      );

      if (!showFilter) return null;

      const quickAddFilter: QuickAddFilterFromSearch = {
        key: filterFromSearch.key,
        text: filterFromSearch.texts[getButtonTristateIndexByType(negation)],
        icons: [filterFromSearch.icons[getButtonTristateIndexByType(negation)]],
        func: () => {
          const data = this.filtersSubject.value;
          data.forEach((filter) => {
            if (filter.key === filterFromSearch.key) {
              filter.show = true;
              filter.value = negation;
            }
          });
          this.filtersSubject.next(data);
          this.searchService.clearSearchValue();
          this.searchUrlService.setSearchUrl();
        },
      };

      return quickAddFilter;
    }).filter((filter): filter is QuickAddFilterFromSearch => !!filter);
  }

  getFilteredQuickAddFilterButtonValueFromSearch(searchValue: string, negation: ButtonTristate) {
    // Extrahiere Zahl aus Suchbegriff mit regex
    const matchNumber = searchValue.match(REGEX_PRICE);
    let number = 0;
    if (matchNumber) {
      number = Number(matchNumber[0]);
    }

    let value = 1;
    let min = true;
    let hideNullValues = true;
    let index = 0;

    // Keine/Ohne ...
    if (negation === ButtonTristate.FALSE) {
      value = 0;
      min = false;
      hideNullValues = false;

      index = 2;
    } else if (matchNumber) {
      value = number;

      index = 1;

      hideNullValues = true;

      const matchMax = searchValue.match(/(max)/g);

      // Maximal
      if (matchMax) {
        min = false;
      }
      // Minimal & Ohne
      else {
        min = true;
      }
    }
    // Mit ...
    else {
      value = 1;
      min = true;
      hideNullValues = true;

      index = 3;
    }

    return this.QuickAddFilterButtonValue.map((filterFromSearch) => {
      if (filterFromSearch === null) return null;

      const showFilter = filterFromSearch.searchTerms.some((text) =>
        searchValue.toLowerCase().includes(text.toLowerCase())
      );

      if (!showFilter) return null;

      let text = filterFromSearch.texts[index];
      const suffix = filterFromSearch.suffixShort
        ? ` ${this.translateService.instant(filterFromSearch.suffixShort)}`
        : "";

      if (filterFromSearch.max) value = Math.min(value, filterFromSearch.max);

      if (value > 1) {
        text = `${this.translateService.instant(
          min ? "MIN_SHORT" : "MAX_SHORT"
        )} ${this.translateService.instant(filterFromSearch.texts[0])}: ${value}${suffix}`;
      }

      const quickAddFilter: QuickAddFilterFromSearch = {
        key: filterFromSearch.key,
        text: text,
        icons: [filterFromSearch.icons[index]],
        func: () => {
          const data = this.filtersSubject.value;
          data.forEach((filter) => {
            if (filter.key === filterFromSearch.key) {
              let filterButtonValue = FilterFunctions.getFilterButtonValue(filter);
              if (!filterButtonValue) return;
              filterButtonValue.show = true;
              filterButtonValue.value = value;
              filterButtonValue.min = min;
              filterButtonValue.hideNullValues = hideNullValues;

              filter = filterButtonValue;
            }
          });
          this.filtersSubject.next(data);
          this.searchService.clearSearchValue();
          this.searchUrlService.setSearchUrl();
        },
      };

      return quickAddFilter;
    }).filter((filter): filter is QuickAddFilterFromSearch => !!filter);
  }

  getFilteredQuickAddFilterMultiSelectFromSearch(
    searchValue: string,
    addFilter: boolean,
    removeFilter: boolean
  ) {
    return this.QuickAddDropdownFilter.map((filterFromSearch) => {
      const show1 = filterFromSearch.searchTerms.some((text) =>
        searchValue.toLowerCase().includes(text.toLowerCase())
      );

      const show2 = filterFromSearch.searchTerms.some(
        (text) => text.toLowerCase().includes(searchValue.toLowerCase()) && searchValue.length > 4
      );

      if (!show1 && !show2) return null;

      const filter: QuickAddFilterFromSearch = {
        key: filterFromSearch.key,
        text: filterFromSearch.text,
        icons: filterFromSearch.icon ? [filterFromSearch.icon] : [],
        matchWeight: show1 ? 10 : show2 ? 5 : 0,
        addFilter,
        removeFilter,
        func: () => {
          this.quickAddDropdownFilter(
            filterFromSearch.types,
            addFilter,
            removeFilter,
            filterFromSearch.key
          );
        },
      };

      return filter;
    }).filter((filter): filter is QuickAddFilterFromSearch => !!filter);
  }

  getFilteredQuickAddFilterMultiSelectSpecificFromSearch(
    searchValue: string,
    addFilter: boolean,
    removeFilter: boolean,
    negation: ButtonTristate
  ) {
    return this.QuickAddDropdownSpecificFilter.map((filterFromSearch) => {
      const show0 =
        filterFromSearch.negation !== undefined &&
        ((!filterFromSearch.negation && negation === ButtonTristate.TRUE) ||
          (filterFromSearch.negation && negation === ButtonTristate.FALSE));

      const show1 = filterFromSearch.searchTerms.some(
        (text) => searchValue.toLowerCase() === text.toLowerCase()
      );

      const show2 = filterFromSearch.searchTerms.some((text) =>
        searchValue.toLowerCase().includes(text.toLowerCase())
      );

      const show3 = filterFromSearch.searchTerms.some(
        (text) => text.toLowerCase().includes(searchValue.toLowerCase()) && searchValue.length > 4
      );

      if (!show1 && !show2 && !show3) return null;

      const matchWeight = (show1 ? 20 : show2 ? 10 : show3 ? 5 : 0) + (show0 ? 20 : 0);
      const filter: QuickAddFilterFromSearch = {
        key: filterFromSearch.key,
        text: filterFromSearch.text,
        icons: filterFromSearch.icon ? [filterFromSearch.icon] : [],
        matchWeight,
        addFilter,
        removeFilter,
        func: () => {
          this.quickAddDropdownSpecificFilter(
            filterFromSearch.types,
            addFilter,
            removeFilter,
            filterFromSearch.key
          );
        },
      };

      return filter;
    }).filter((filter): filter is QuickAddFilterFromSearch => !!filter);
  }

  getFilteredQuickAddFilterMultiSelectDynamicDataFromSearch(
    filters: ReadonlyArray<Group<string>>,
    key: FilterKey,
    searchValue: string,
    addFilter: boolean,
    removeFilter: boolean
  ): QuickAddFilterFromSearch[] {
    const filtersFromSearch: QuickAddFilterFromSearch[] = [];
    filters.forEach((filter) => {
      filter.entries.forEach((entry) => {
        const show =
          (entry.name.toLowerCase().includes(searchValue.toLowerCase()) &&
            searchValue.length > 6) ||
          entry.name.toLowerCase() === searchValue.toLowerCase();

        if (show) {
          const data: QuickAddFilterFromSearch = {
            key,
            text: entry.name,
            icons: [],
            image: entry.image,
            addFilter,
            removeFilter,
            matchWeight: entry.name.toLowerCase() === searchValue.toLowerCase() ? 10 : 5,
            func: () => {
              this.quickAddDropdownDynamicDataFilter(
                [entry.name.toLowerCase()], // ? key / type sourceUrl
                addFilter,
                removeFilter,
                key
              );
            },
          };
          filtersFromSearch.push(data);
        }
      });
    });

    return filtersFromSearch;
  }

  getFiltersQuickAddFilterDates(searchValue: string) {
    const filtersFromSearch: QuickAddFilterFromSearch[] = [];

    this.QuickAddFilterDates.forEach((filter) => {
      const { key, value, icon, text } = filter;

      if (
        !searchValue
          .split(" ")
          .some((value) => filter.searchTermsRequired.includes(value.toLowerCase())) &&
        // Für manuell gesetzte `searchTermsRequired` mit Leerzeichen in `filter.data.ts`
        !filter.searchTermsRequired.some((value) =>
          searchValue.toLowerCase().includes(value.toLowerCase())
        )
      ) {
        return;
      }

      filter.searchTerms.forEach((term) => {
        const t = term.replaceAll("{{ days }}", "(.*)");
        const match = searchValue.match(RegExp(t, "i"));

        if (filter.showDayInput && match) {
          const days = +match[1].trim();
          if (days) {
            const data: QuickAddFilterFromSearch = {
              key,
              matchWeight: 10,
              // Direkte Übersetzung d. Textes
              text: this.translateService.instant(text, { days: days.toString() }),
              icons: icon ? [icon] : [],
              func: () => {
                this.quickAddDatesFilter(value, key, days);
              },
            };
            filtersFromSearch.push(data);
          }
        } else if (match) {
          const data: QuickAddFilterFromSearch = {
            key,
            text,
            icons: icon ? [icon] : [],
            matchWeight: 10,
            func: () => {
              this.quickAddDatesFilter(value, key);
            },
          };
          filtersFromSearch.push(data);
        }
      });
    });

    return filtersFromSearch;
  }

  addResultCount(resultCount: number) {
    this.resultCountSubject.next(this.resultCountSubject.value + resultCount);
  }
}
