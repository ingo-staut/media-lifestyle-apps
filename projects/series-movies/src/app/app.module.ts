import { LOCALE_ID, NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { A11yModule } from "@angular/cdk/a11y";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CdkMenuModule } from "@angular/cdk/menu";
import { CurrencyPipe, DatePipe, registerLocaleData } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from "@angular/common/http";
import localeEn from "@angular/common/locales/En";
import localeEs from "@angular/common/locales/Es";
import localeFr from "@angular/common/locales/Fr";
import localeDe from "@angular/common/locales/de";
import localeEnExtra from "@angular/common/locales/extra/En";
import localeEsExtra from "@angular/common/locales/extra/Es";
import localeFrExtra from "@angular/common/locales/extra/Fr";
import localeDeExtra from "@angular/common/locales/extra/de";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { FIREBASE_OPTIONS } from "@angular/fire/compat";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from "@angular/material-moment-adapter";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatBadgeModule } from "@angular/material/badge";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatRippleModule,
} from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipDefaultOptions,
  MatTooltipModule,
} from "@angular/material/tooltip";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, TitleStrategy } from "@angular/router";
import { ServiceWorkerModule } from "@angular/service-worker";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { IsMediaEqualToEntryPipe, IsValuePipe } from "projects/series-movies/src/pipes/value.pipe";
import {
  ButtonOnlyIconMobileDirective,
  ButtonOnlyIconSmallScreenDirective,
} from "shared/directives/button-icon.directive";
import { SameSiteInterceptor } from "shared/interceptors/same-site.interceptor";
import { AllCountriesPipe } from "shared/pipes/country.pipe";
import {
  DaysBetweenDatesPipe,
  IsAfterDatePipe,
  IsBeforeDatePipe,
  IsSameDatePipe,
  IsTodayPipe,
  SameTimePipe,
} from "shared/pipes/date.pipe";
import {
  AllDiscoverySourcesPipe,
  FirstDiscoverySourceAllTextsPipe,
} from "shared/pipes/discovery-source.pipe";
import {
  DropdownDataSelectedIndexPipe,
  DropdownDataSelectedPipe,
} from "shared/pipes/dropdown-data.pipe";
import { ForSearchPipe } from "shared/pipes/for-search.pipe";
import { FormatDatePipe, WeekdayNameByDayIndexPipe } from "shared/pipes/format-date.pipe";
import { FormatDurationPipe } from "shared/pipes/format-duration.pipe";
import {
  FormatTimeOfDatePipe,
  FormatTimePipe,
  FormatTimeRangePipe,
  TimePipe,
} from "shared/pipes/format-time.pipe";
import { FormfieldRequiredPipe } from "shared/pipes/formfield.pipe";
import { GroupNameByKeyPipe } from "shared/pipes/group-name-by-key.pipe";
import { IconByFunctionPipe } from "shared/pipes/icon.pipe";
import { HeaderImagePipe, ImageByFormfieldPipe, IsImageFilePipe } from "shared/pipes/image.pipe";
import {
  AllLanguagesPipe,
  LanguageIconPipe,
  LanguagePipe,
  MostSignificantFlagsPipe,
} from "shared/pipes/language.pipe";
import { JoinPipe } from "shared/pipes/list.pipe";
import { MessageReplaceIsStringPipe } from "shared/pipes/message-replace.pipe";
import { OrderWithValuePipe, OrderWithValuesPipe } from "shared/pipes/order.pipe";
import { RatingByTypePipe } from "shared/pipes/rating-by-type.pipe";
import {
  EqualPipe,
  ExtendTextPipe,
  FirstCharToLowercasePipe,
  HighlightQuotesInTextPipe,
  JoinTextWithCommaPipe,
  ReplaceAllPipe,
  SplitStringPipe,
  SyntaxHighlightPipe,
  ToLowercasePipe,
  TrimToStringPipe,
} from "shared/pipes/string.pipe";
import {
  IsImdbOrYoutubeUrlPipe,
  IsValidUrlPipe,
  UrlIconsPipe,
  UrlPipe,
  UrlTitlePipe,
  UrlTitleWithTypeByUrlPipe,
  UrlTypePipe,
  UrlWithTypeByUrlPipe,
} from "shared/pipes/url.pipe";
import { MajorOrMinorVersionPipe, MajorVersionPipe, VersionPipe } from "shared/pipes/version.pipe";
import { PageTitleStrategyService } from "shared/services/page-title-strategy.service";
import { environment } from "../environments/environment";
import { ChannelByIdPipe, ChannelPipe, ChannelTypeIconPipe } from "../pipes/channel.pipe";
import { ChipPipe } from "../pipes/chip.pipe";
import { CinemaPipe } from "../pipes/cinema.pipe";
import {
  CurrentEpisodePipe,
  EpisodeIconPipe,
  EpisodeInTelevisionPipe,
  EpisodePipe,
  EpisodeProgressPipe,
  FilterEpisodesInTelevisionMissedPipe,
  LastEpisodeInSeasonPipe,
  TelevisionEpisodeCountPipe,
  TelevisionEpisodePipe,
} from "../pipes/episode.pipe";
import {
  EpisodeDetailIsWatchingPipe,
  EpisodeDetailPipe,
  EpisodeDetailsByEpisodePipe,
  EpisodeDetailsBySeasonAndEpisodePipe,
  EpisodeProgressByEpisodeDetailsWithDurationPipe,
  HasEpisodeDetailsByEpisodePipe,
  WatchedPipe,
} from "../pipes/episodeDetail.pipe";
import { GenrePipe } from "../pipes/genre.pipe";
import { MediaLastEditedPipe } from "../pipes/media-last-edited.pipe";
import { MediaTypePipe } from "../pipes/media-type.pipe";
import { UrlsForPlayPipe, UrlsMenuPipe } from "../pipes/media-urls.pipe";
import { MediaByIdPipe } from "../pipes/media.pipe";
import {
  NewsCategoryByIdPipe,
  NewsCategoryIconByIdPipe,
  NewsSourceByIdPipe,
} from "../pipes/news.pipe";
import { NumberInRangePipe } from "../pipes/number-in-range.pipe";
import { PricePipe } from "../pipes/price.pipe";
import { RatingSectionPipe } from "../pipes/rating.pipe";
import { CurrentSeasonPipe, SeasonPipe } from "../pipes/season.pipe";
import { ShowColumnPipe } from "../pipes/show-column.pipe";
import { SidenavMenuItemsPipe } from "../pipes/sidenav-menu-items.pipe";
import { SortItemBySortTypePipe } from "../pipes/sort.pipe";
import { StatusIconPipe, StatusPipe } from "../pipes/status.pipe";
import {
  NextInTelevisionPipe,
  TelevisionEventsDayHasErrorPipe,
  TelevisionPipe,
} from "../pipes/television.pipe";
import { YearsPipe } from "../pipes/years.pipe";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BottomSheetComponent } from "./bottom-sheets/bottom-sheet/bottom-sheet.component";
import { EpisodeDetailsMenuBottomSheetComponent } from "./bottom-sheets/episode-detail-menu-bottom-sheet/episode-detail-menu-bottom-sheet.component";
import { FunctionsBottomSheetComponent } from "./bottom-sheets/functions-bottom-sheet/functions-bottom-sheet.component";
import { ActionButtonGroupComponent } from "./components/action-button-group/action-button-group.component";
import { AddRemoveComponent } from "./components/add-remove/add-remove.component";
import { AddComponent } from "./components/add/add.component";
import { ButtonRatingImdbComponent } from "./components/button-rating-imdb/button-rating-imdb.component";
import { ButtonRatingMetascoreComponent } from "./components/button-rating-metascore/button-rating-metascore.component";
import { ButtonShowInSearchComponent } from "./components/button-show-in-search/button-show-in-search.component";
import { ButtonShowMoreComponent } from "./components/button-show-more/button-show-more.component";
import { ButtonTristateFilterComponent } from "./components/button-tristate-filter/button-tristate-filter.component";
import { ButtonTristateComponent } from "./components/button-tristate/button-tristate.component";
import { ButtonValueFilterComponent } from "./components/button-value-filter/button-value-filter.component";
import { CarouselComponent } from "./components/carousel/carousel.component";
import { CheckButtonGroupComponent } from "./components/check-button-group/check-button-group.component";
import { CheckIconComponent } from "./components/check-icon/check-icon.component";
import { DeveloperMenuButtonsComponent } from "./components/developer-menu-buttons/developer-menu-buttons.component";
import { DropdownMultipleWithGroupsComponent } from "./components/dropdown-multiple-with-groups/dropdown-multiple-with-groups.component";
import { DropdownWithGroupsComponent } from "./components/dropdown-with-groups/dropdown-with-groups.component";
import { DropdownWithInputComponent } from "./components/dropdown-with-input/dropdown-with-input.component";
import { DropdownWithNumberRangeComponent } from "./components/dropdown-with-number-range/dropdown-with-number-range.component";
import { DropdownComponent } from "./components/dropdown/dropdown.component";
import { EpisodeDetailsMenuComponent } from "./components/episode-detail-menu/episode-detail-menu.component";
import { EpisodeDetailsListComponent } from "./components/episode-details-list/episode-details-list.component";
import { EpisodeInTableWithEpisodeDetailsComponent } from "./components/episode-in-table-with-episode-details/episode-in-table-with-episode-details.component";
import { EpisodeInTelevisionButtonsComponent } from "./components/episode-in-television-buttons/episode-in-television-buttons.component";
import { FabMenuComponent } from "./components/fab-menu/fab-menu.component";
import { FormfieldComponent } from "./components/formfield/formfield.component";
import { GenreTagsComponent } from "./components/genre-tags/genre-tags.component";
import { ListComponent } from "./components/list/list.component";
import { LoadingComponent } from "./components/loading/loading.component";
import { MediaChipComponent } from "./components/media-chip/media-chip.component";
import { MenuBottomSheetComponent } from "./components/menu-bottom-sheet/menu-bottom-sheet.component";
import { MenuSortComponent } from "./components/menu-sort/menu-sort.component";
import { MenuComponent } from "./components/menu/menu.component";
import { NewsChipComponent } from "./components/news-chip/news-chip.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { QuickAddButtonComponent } from "./components/quick-add-button/quick-add-button.component";
import { SearchActionButtonComponent } from "./components/search-action-button/search-action-button.component";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { SearchFiltersComponent } from "./components/search-filters/search-filters.component";
import { SearchNoResultsComponent } from "./components/search-no-results/search-no-results.component";
import { SearchResultColumnComponent } from "./components/search-result-item/search-result-column/search-result-column.component";
import { SearchResultItemComponent } from "./components/search-result-item/search-result-item.component";
import { SearchSortingComponent } from "./components/search-sorting/search-sorting.component";
import { SearchSuggestionsComponent } from "./components/search-suggestions/search-suggestions.component";
import { SectionBannerSpacerComponent } from "./components/section-banner-spacer/section-banner-spacer.component";
import { SectionBannerComponent } from "./components/section-banner/section-banner.component";
import { ShowTelevisionProgramButton } from "./components/show-television-program-button/show-television-program-button.component";
import { SidenavComponent } from "./components/sidenav/sidenav.component";
import { TagsComponent } from "./components/tags/tags.component";
import { ThemeComponent } from "./components/theme/theme.component";
import { ToggleGroupComponent } from "./components/toggle-group/toggle-group.component";
import { UrlsTagsComponent } from "./components/urls-tags/urls-tags.component";
import { VersionEntryComponent } from "./components/version-entry/version-entry.component";
import { DialogComponent } from "./dialogs/dialog/dialog.component";
import { FunctionsDialogComponent } from "./dialogs/functions-dialog/functions-dialog.component";
import { MediaDialogComponent } from "./dialogs/media-dialog/media-dialog.component";
import { SettingsDialogComponent } from "./dialogs/settings-dialog/settings-dialog.component";
import { TelevisionDialogComponent } from "./dialogs/television-dialog/television-dialog.component";
import { ExploreComponent } from "./pages/explore/explore.component";
import { ImportViaShareComponent } from "./pages/import-via-share/import-via-share.component";
import { NewsComponent } from "./pages/news/news.component";
import { SearchComponent } from "./pages/search/search.component";
import { StartComponent } from "./pages/start/start.component";
import { StatisticsComponent } from "./pages/statistics/statistics.component";
import { WatchComponent } from "./pages/watch/watch.component";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

registerLocaleData(localeDe, localeDeExtra);
registerLocaleData(localeEn, localeEnExtra);
registerLocaleData(localeFr, localeFrExtra);
registerLocaleData(localeEs, localeEsExtra);

export const tololtipDefaults: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 0,
  touchendHideDelay: 500,
  disableTooltipInteractivity: true,
  touchGestures: "off",
};

@NgModule({
  declarations: [
    AppComponent,
    NotificationComponent,
    StartComponent,
    ExploreComponent,
    SearchComponent,
    StatisticsComponent,
    ImportViaShareComponent,
    SidenavComponent,
    MediaChipComponent,
    VersionEntryComponent,
    MediaDialogComponent,
    AddRemoveComponent,
    AddComponent,
    DialogComponent,
    ListComponent,
    FormfieldComponent,
    BottomSheetComponent,
    ButtonTristateComponent,
    DropdownComponent,
    ToggleGroupComponent,
    DropdownWithGroupsComponent,
    CheckButtonGroupComponent,
    FunctionsBottomSheetComponent,
    FunctionsDialogComponent,
    TelevisionDialogComponent,
    SettingsDialogComponent,
    VersionEntryComponent,
    FabMenuComponent,
    MenuComponent,
    MenuBottomSheetComponent,
    CheckIconComponent,
    WatchComponent,
    CarouselComponent,
    UrlsTagsComponent,
    ButtonTristateFilterComponent,
    ButtonValueFilterComponent,
    DropdownMultipleWithGroupsComponent,
    DropdownWithInputComponent,
    DropdownWithNumberRangeComponent,
    MenuSortComponent,
    SearchActionButtonComponent,
    SearchBarComponent,
    SearchFiltersComponent,
    SearchSuggestionsComponent,
    SearchNoResultsComponent,
    SearchSortingComponent,
    SearchResultColumnComponent,
    SearchResultItemComponent,
    GenreTagsComponent,
    EpisodeDetailsMenuComponent,
    EpisodeDetailsMenuBottomSheetComponent,
    EpisodeInTelevisionButtonsComponent,
    QuickAddButtonComponent,
    DeveloperMenuButtonsComponent,
    EpisodeDetailsListComponent,
    EpisodeInTableWithEpisodeDetailsComponent,
    ThemeComponent,
    SectionBannerComponent,
    SectionBannerSpacerComponent,
    ButtonShowInSearchComponent,
    ButtonRatingImdbComponent,
    ButtonRatingMetascoreComponent,
    ActionButtonGroupComponent,
    NewsComponent,
    NewsChipComponent,
    LoadingComponent,
    ButtonShowMoreComponent,
    ShowTelevisionProgramButton,
    // Pipes
    EqualPipe,
    ExtendTextPipe,
    MediaLastEditedPipe,
    VersionPipe,
    MajorVersionPipe,
    MajorOrMinorVersionPipe,
    FormatDatePipe,
    WeekdayNameByDayIndexPipe,
    SameTimePipe,
    IsSameDatePipe,
    IsAfterDatePipe,
    IsBeforeDatePipe,
    ChannelPipe,
    ChannelTypeIconPipe,
    EpisodePipe,
    CurrentEpisodePipe,
    LastEpisodeInSeasonPipe,
    EpisodeIconPipe,
    EpisodeProgressPipe,
    EpisodeInTelevisionPipe,
    HighlightQuotesInTextPipe,
    FormfieldRequiredPipe,
    ImageByFormfieldPipe,
    IsImageFilePipe,
    DropdownDataSelectedIndexPipe,
    DropdownDataSelectedPipe,
    TelevisionPipe,
    TelevisionEventsDayHasErrorPipe,
    SeasonPipe,
    CurrentSeasonPipe,
    ChipPipe,
    MediaTypePipe,
    SidenavMenuItemsPipe,
    GroupNameByKeyPipe,
    FormatTimePipe,
    FormatTimeOfDatePipe,
    FormatTimeRangePipe,
    UrlTitlePipe,
    UrlTypePipe,
    MessageReplaceIsStringPipe,
    EpisodeProgressByEpisodeDetailsWithDurationPipe,
    EpisodeDetailsByEpisodePipe,
    HasEpisodeDetailsByEpisodePipe,
    EpisodeDetailsBySeasonAndEpisodePipe,
    TimePipe,
    FirstCharToLowercasePipe,
    SplitStringPipe,
    SortItemBySortTypePipe,
    OrderWithValuePipe,
    OrderWithValuesPipe,
    ShowColumnPipe,
    RatingByTypePipe,
    SyntaxHighlightPipe,
    GenrePipe,
    WatchedPipe,
    UrlPipe,
    IsValuePipe,
    IsMediaEqualToEntryPipe,
    HeaderImagePipe,
    UrlWithTypeByUrlPipe,
    UrlTitleWithTypeByUrlPipe,
    FormatDurationPipe,
    RatingSectionPipe,
    TagsComponent,
    YearsPipe,
    LanguagePipe,
    LanguageIconPipe,
    NextInTelevisionPipe,
    UrlsForPlayPipe,
    AllLanguagesPipe,
    AllCountriesPipe,
    FilterEpisodesInTelevisionMissedPipe,
    CinemaPipe,
    PricePipe,
    JoinTextWithCommaPipe,
    NumberInRangePipe,
    ForSearchPipe,
    StatusPipe,
    StatusIconPipe,
    MediaByIdPipe,
    NewsSourceByIdPipe,
    NewsCategoryByIdPipe,
    NewsCategoryIconByIdPipe,
    TrimToStringPipe,
    ToLowercasePipe,
    ChannelByIdPipe,
    IsImdbOrYoutubeUrlPipe,
    UrlsMenuPipe,
    EpisodeDetailPipe,
    EpisodeDetailIsWatchingPipe,
    JoinPipe,
    DaysBetweenDatesPipe,
    IsTodayPipe,
    ReplaceAllPipe,
    TelevisionEpisodePipe,
    TelevisionEpisodeCountPipe,
    UrlIconsPipe,
    MostSignificantFlagsPipe,
    AllDiscoverySourcesPipe,
    FirstDiscoverySourceAllTextsPipe,
    IconByFunctionPipe,
    IsValidUrlPipe,
    // Directives
    ButtonOnlyIconMobileDirective,
    ButtonOnlyIconSmallScreenDirective,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    // CDK
    CdkMenuModule,
    DragDropModule,
    A11yModule,
    // Material
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatSidenavModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatCardModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSelectModule,
    MatListModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule,
    MatSliderModule,
    MatBadgeModule,
    MatChipsModule,
    MatBottomSheetModule,
    MatSlideToggleModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
    TranslateModule.forRoot({
      defaultLanguage: "de",
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    FirstCharToLowercasePipe,
    // Firebase
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    // Tooltip
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: tololtipDefaults },
    // Locale
    { provide: MAT_DATE_LOCALE, useValue: "de-DE" },
    { provide: LOCALE_ID, useValue: "de-DE" },
    // Locale mit Moment
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    // Seitentitel
    { provide: TitleStrategy, useClass: PageTitleStrategyService },
    // Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SameSiteInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
