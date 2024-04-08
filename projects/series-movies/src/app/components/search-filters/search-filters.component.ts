import { Component, OnDestroy } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Subject, map, takeUntil } from "rxjs";
import { FILTER_GROUP_NAMES_MAP } from "shared/data/filter-groupnames.data";
import { DropdownDataWithNumberRange } from "shared/models/dropdown-data-with-number-range.type";
import { DropdownDataWithRange } from "shared/models/dropdown-data-with-range.type";
import { DropdownData } from "shared/models/dropdown.type";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { MenuItem } from "../../../../../../shared/models/menu-item.type";
import { FilterDates } from "../../models/filter-dates.type";
import { FilterNumbers } from "../../models/filter-numbers.type";
import { DEFAULT_KEY } from "../../models/filter-select.type";
import { FilterFunctions } from "../../models/filter.functions";
import { Filter } from "../../models/filter.type";
import { SearchFilterService } from "../../pages/search/search.filter.service";
import { ChannelApiService } from "../../services/channel.api.service";
import { MediaApiService } from "../../services/media.api.service";
import { MenuDialogData } from "../menu-bottom-sheet/menu-bottom-sheet.component";
import { MenuBottomSheetService } from "../menu-bottom-sheet/menu-bottom-sheet.service";

@Component({
  selector: "app-search-filters",
  templateUrl: "./search-filters.component.html",
  styleUrls: ["./search-filters.component.scss"],
})
export class SearchFiltersComponent implements OnDestroy {
  private readonly destroySubject = new Subject<void>();

  readonly getFilterButtonValue = FilterFunctions.getFilterButtonValue;
  readonly getFilterButtonTristate = FilterFunctions.getFilterButtonTristate;
  readonly getFilterMultiSelect = FilterFunctions.getFilterMultiSelect;
  readonly getFilterMultiSelectDynamicData = FilterFunctions.getFilterMultiSelectDynamicData;
  readonly getFilterMultiSelectSpecific = FilterFunctions.getFilterMultiSelectSpecific;
  readonly getFilterDates = FilterFunctions.getFilterDates;
  readonly getFilterNumbers = FilterFunctions.getFilterNumbers;
  readonly getFilterSelect = FilterFunctions.getFilterSelect;
  readonly resetFilter = FilterFunctions.resetFilter;

  DEFAULT_KEY = DEFAULT_KEY;
  FormfieldType = FormfieldType;
  FILTER_GROUP_NAMES_MAP = FILTER_GROUP_NAMES_MAP;

  readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  filters$ = this.searchFilterService.filters$.pipe(takeUntil(this.destroySubject));
  filtersMenu$ = this.filters$.pipe(
    map((filters) => {
      const data: MenuItem<Filter>[] = filters.map((filter) => {
        const item: MenuItem<Filter> = {
          text: filter.texts[0],
          value: filter,
          icon: filter.icons[0],
          highlight: filter.show,
          groupKey: filter.groupKey,
          favorite: undefined,
        };
        return item;
      });
      return data;
    })
  );
  filtersVisible$ = this.searchFilterService.filtersVisible$.pipe(takeUntil(this.destroySubject));
  extendFilters = false;

  dynamicFiltersData$ = [
    this.mediaApiService.searchFilterUrlsWatch$,
    this.mediaApiService.searchFilterUrlsVideo$,
    this.mediaApiService.searchFilterUrlsInfo$,
    this.mediaApiService.searchFilterChannels$,
    this.mediaApiService.searchFilterLanguages$,
    this.mediaApiService.searchFilterCountries$,
    this.mediaApiService.searchFilterSources$,
  ];

  constructor(
    private formBuilder: FormBuilder,
    protected searchFilterService: SearchFilterService,
    private menuBottomSheetService: MenuBottomSheetService,
    private mediaApiService: MediaApiService,
    private channelApiService: ChannelApiService
  ) {}

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onSelectChanged(range: DropdownData<string, DropdownDataWithRange>, filter: FilterDates) {
    filter.data.map((r) => {
      if (r.key === range.key) {
        r = range;
      }
      return r;
    });
    filter.value = range.key;

    this.searchFilterService.setFilterByKey(filter);
  }

  onNumbersFilterSelectChanged(
    range: DropdownData<string, DropdownDataWithNumberRange>,
    filter: FilterNumbers
  ) {
    filter.data.map((r) => {
      if (r.key === range.key) {
        r = range;
      }
      return r;
    });
    filter.value = range.key;

    this.searchFilterService.setFilterByKey(filter);
  }

  expandFilters() {
    this.extendFilters = !this.extendFilters;
  }

  onAddOrRemoveFilter(filter: Filter): void {
    filter.show = !filter.show;
    this.searchFilterService.setFilterByKey(filter);
  }

  onRemoveFilter(filter: Filter): void {
    filter.show = false;
    this.searchFilterService.setFilterByKey(filter);
  }

  removeAllFilters() {
    this.searchFilterService.removeAllFilters();
  }

  onFilterChange(filter: Filter, index: number) {
    this.searchFilterService.setFilterByIndex(filter, index);
  }

  onOpenFilterMenu() {
    if (!this.isSmallScreen.matches) return;

    const data: MenuDialogData<Filter> = {
      actions: this.searchFilterService.filtersSnapshot.map((filter) => {
        const item: MenuItem<Filter> = {
          text: filter.texts[0],
          value: filter,
          icon: filter.icons[0],
          highlight: filter.show,
          groupKey: filter.groupKey,
        };
        return item;
      }),
      showFilterInput: true,
    };

    this.menuBottomSheetService.open<Filter>(data).subscribe((data) => {
      if (data) {
        const index = this.searchFilterService.filtersSnapshot.findIndex((f) => f === data.value);
        this.onFilterChange(data.value, index);
      }
    });
  }

  onInputClicked(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
}
