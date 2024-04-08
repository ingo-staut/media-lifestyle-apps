import { ClipboardModule } from "@angular/cdk/clipboard";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CdkMenuModule } from "@angular/cdk/menu";
import { CurrencyPipe, DatePipe, registerLocaleData } from "@angular/common";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientJsonpModule,
  HttpClientModule,
} from "@angular/common/http";
import { LOCALE_ID, NgModule, isDevMode } from "@angular/core";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { FIREBASE_OPTIONS } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MatRippleModule,
} from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipDefaultOptions,
  MatTooltipModule,
} from "@angular/material/tooltip";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { environment } from "../environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AccordionPanelComponent } from "./components/accordion-panel/accordion-panel.component";
import { AddComponent } from "./components/add/add.component";
import { FormfieldTagsComponent } from "./components/formfield-tags/formfield-tags.component";
import { FormfieldComponent } from "./components/formfield/formfield.component";
import { IngredientListItemComponent } from "./components/ingredient-list-item/ingredient-list-item.component";
import { IngredientsListComponent } from "./components/ingredients-list/ingredients-list.component";
import { InstructionComponent } from "./components/instruction/instruction.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { PreparationHistoryChipComponent } from "./components/preparation-history-chip/preparation-history-chip.component";
import { RecipeChipComponent } from "./components/recipe-chip/recipe-chip.component";
import { DialogComponent } from "./dialogs/dialog/dialog.component";
import { RecipeDialogComponent } from "./dialogs/recipe-dialog/recipe-dialog.component";
import { PurchasesComponent } from "./pages/purchases/purchases.component";
import { RecipesComponent } from "./pages/recipes/recipes.component";
import { ShoppingListComponent } from "./pages/shopping-list/shopping-list.component";
import { StatisticsComponent } from "./pages/statistics/statistics.component";

import { A11yModule } from "@angular/cdk/a11y";
import localeEn from "@angular/common/locales/En";
import localeEs from "@angular/common/locales/Es";
import localeFr from "@angular/common/locales/Fr";
import localeDe from "@angular/common/locales/de";
import localeEnExtra from "@angular/common/locales/extra/En";
import localeEsExtra from "@angular/common/locales/extra/Es";
import localeFrExtra from "@angular/common/locales/extra/Fr";
import localeDeExtra from "@angular/common/locales/extra/de";
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from "@angular/material-moment-adapter";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatListModule } from "@angular/material/list";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { MatTableModule } from "@angular/material/table";
import { HammerModule } from "@angular/platform-browser";
import { TitleStrategy } from "@angular/router";
import { ServiceWorkerModule } from "@angular/service-worker";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { AutofocusDirective } from "shared/directives/autofocus.directive";
import {
  ButtonOnlyIconMobileDirective,
  ButtonOnlyIconSmallScreenDirective,
} from "shared/directives/button-icon.directive";
import { SameSiteInterceptor } from "shared/interceptors/same-site.interceptor";
import { DaysBetweenDatesPipe, IsSameDatePipe, IsTodayPipe } from "shared/pipes/date.pipe";
import {
  DropdownDataSelectedIndexPipe,
  DropdownDataSelectedPipe,
} from "shared/pipes/dropdown-data.pipe";
import { ForSearchPipe } from "shared/pipes/for-search.pipe";
import { FormatDatePipe } from "shared/pipes/format-date.pipe";
import { FormatDurationPipe } from "shared/pipes/format-duration.pipe";
import { FormatTimeOfDayPipe, FormatTimePipe, TimePipe } from "shared/pipes/format-time.pipe";
import { FormfieldRequiredPipe } from "shared/pipes/formfield.pipe";
import { GroupNameByKeyPipe } from "shared/pipes/group-name-by-key.pipe";
import { HeaderImagePipe, ImageByFormfieldPipe, IsImageFilePipe } from "shared/pipes/image.pipe";
import {
  IndexInListPipe,
  ItemInListDisplayTextPipe,
  ItemInListPipe,
  JoinPipe,
  ListItemNamePipe,
  ListItemPipe,
} from "shared/pipes/list.pipe";
import { MessageReplaceIsStringPipe } from "shared/pipes/message-replace.pipe";
import { OrderWithValuePipe, OrderWithValuesPipe } from "shared/pipes/order.pipe";
import { RatingByTypePipe } from "shared/pipes/rating-by-type.pipe";
import {
  EqualPipe,
  ExtendTextPipe,
  FirstCharToLowercasePipe,
  HighlightQuotesInTextPipe,
  SplitStringPipe,
  SyntaxHighlightPipe,
  ToLowercasePipe,
  TrimToStringPipe,
} from "shared/pipes/string.pipe";
import {
  UrlPipe,
  UrlTitlePipe,
  UrlTitleWithTypeByUrlPipe,
  UrlTypePipe,
  UrlWithTypeByUrlPipe,
} from "shared/pipes/url.pipe";
import { MajorOrMinorVersionPipe, MajorVersionPipe, VersionPipe } from "shared/pipes/version.pipe";
import { PageTitleStrategyService } from "shared/services/page-title-strategy.service";
import { CategoryByTypePipe } from "../pipes/category-by-type.pipe";
import { ChipPipe } from "../pipes/chip.pipe";
import {
  ClosestFractionPipe,
  DecimalWithFractionPipe,
  FractionAsStringPipe,
} from "../pipes/closest-fraction.pipe";
import {
  BeforeTodayOrTodayPipe,
  InDaysPipe,
  PredefinedDateRangeItemPipe,
} from "../pipes/date.pipe";
import { DifficultyByTypePipe } from "../pipes/difficulty-by-type.pipe";
import { FilterPipe } from "../pipes/filter.pipe";
import { FormErrorsPipe } from "../pipes/form-errors.pipe";
import { FromWithPipe } from "../pipes/from-with.pipe";
import {
  HasAtLeastOneInstructionPipe,
  HasAtLeastOneRecipePipe,
  HasNotAtLeastOneInstructionPipe,
  HasNotAtLeastOneRecipePipe,
  HasNotOneInstructionPipe,
  HasNotOneRecipePipe,
} from "../pipes/has-recipe.pipe";
import { IncludesPipe } from "../pipes/includes.pipe";
import { IngredientsAvailableCatgoryListsPipe } from "../pipes/ingredient-available.pipe";
import {
  ContainsAlcoholPipe,
  ContainsSugarOrNoSugarPipe,
  ContentsTypeTooltipInIngredientPipe,
  IngredientIsVeganPipe,
  IsVeganPipe,
  IsVegetarianPipe,
  MostlyContentsTypeInIngredientPipe,
  MostlyContentsTypeInRecipePipe,
  VeganPercentagePipe,
} from "../pipes/ingredient-contents-type.pipe";
import { HasEmojiPipe, IngredientConversionPipe } from "../pipes/ingredient-conversion.pipe";
import {
  AvailableObjectPipe,
  IngredientAvailabilityPipe,
  IngredientIsFromRecipePipe,
  IngredientItemTypePipe,
  IngredientPipe,
  IngredientsCheckedPipe,
  IngredientsDropdownDataPipe,
  IngredientsFromInstructionsPipe,
  ShowIngredientPipe,
} from "../pipes/ingredients.pipe";
import { InstructionByIdPipe } from "../pipes/instruction.pipe";
import {
  HasItemStructurePipe,
  ItemPipe,
  ItemTypeIconPipe,
  ShowAddToConversionPipe,
} from "../pipes/item.pipe";
import { LastAddedPipe } from "../pipes/last-added.pipe";
import { PreparationDetailsPipe, PreparationIcon } from "../pipes/preparation-details.pipe";
import { PricePipe } from "../pipes/price.pipe";
import { PurchaseItemsCountPipe } from "../pipes/purchase.pipe";
import { RecipeLastEditedPipe } from "../pipes/recipe-last-edited.pipe";
import { RecipeCostsPipe, RecipeCostsStringPipe } from "../pipes/recipe-price.pipe";
import {
  RecipeByIdPipe,
  RecipeHasPortionsLeftPipe,
  RecipeIsPlannedPipe,
  RecipePlannedDetailsPipe,
  ShowPreparationTimePipe,
  TotalPreparationDurationStringPipe,
  TotalPreparationTimeStringPipe,
} from "../pipes/recipe.pipe";
import { ShowColumnPipe } from "../pipes/show-column.pipe";
import { SidenavMenuItemsPipe } from "../pipes/sidenav-menu-items.pipe";
import { SortItemBySortTypePipe, SortPipe } from "../pipes/sort.pipe";
import {
  FilterPurchasesByDateRangePipe,
  NotesCountPipe,
  PurchasesNoSugarCountPipe,
  PurchasesNotVeganCountPipe,
  StoreCountPipe,
  TotalCostOfPurchasesPipe,
  itemsCountFromPurchasesPipe,
} from "../pipes/statistic.pipe";
import { StorePipe } from "../pipes/store-icon.pipe";
import { TimeHourFormatPipe } from "../pipes/time-hour-format.pipe";
import { UtensilIconPipe } from "../pipes/utensil-icon.pipe";
import { UtensilPipe, UtensilTextPipe, UtensilsFromInstructionsPipe } from "../pipes/utensil.pipe";
import { BottomSheetComponent } from "./bottom-sheets/bottom-sheet/bottom-sheet.component";
import { FunctionsBottomSheetComponent } from "./bottom-sheets/functions-bottom-sheet/functions-bottom-sheet.component";
import { MenuBottomSheetComponent } from "./bottom-sheets/menu-bottom-sheet/menu-bottom-sheet.component";
import { PurchaseToAdditionalIngredientsBottomSheetComponent } from "./bottom-sheets/purchase-to-additional-ingredients-bottom-sheet/purchase-to-additional-ingredients-bottom-sheet.component";
import { ActionButtonGroupComponent } from "./components/action-button-group/action-button-group.component";
import { AddRemoveComponent } from "./components/add-remove/add-remove.component";
import { ButtonAvailableComponent } from "./components/button-available/button-available.component";
import { ButtonContentsComponent } from "./components/button-contents/button-contents.component";
import { ButtonShowInSearchComponent } from "./components/button-show-in-search/button-show-in-search.component";
import { ButtonShowMoreComponent } from "./components/button-show-more/button-show-more.component";
import { ButtonTristateFilterComponent } from "./components/button-tristate-filter/button-tristate-filter.component";
import { ButtonTristateComponent } from "./components/button-tristate/button-tristate.component";
import { ButtonUseUntilComponent } from "./components/button-use-until/button-use-until.component";
import { ButtonValueFilterComponent } from "./components/button-value-filter/button-value-filter.component";
import { CarouselComponent } from "./components/carousel/carousel.component";
import { CheckButtonGroupComponent } from "./components/check-button-group/check-button-group.component";
import { CheckIconComponent } from "./components/check-icon/check-icon.component";
import { CounterComponent } from "./components/counter/counter.component";
import { DeveloperMenuButtonsComponent } from "./components/developer-menu-buttons/developer-menu-buttons.component";
import { DropdownMultipleWithGroupsComponent } from "./components/dropdown-multiple-with-groups/dropdown-multiple-with-groups.component";
import { DropdownWithGroupsComponent } from "./components/dropdown-with-groups/dropdown-with-groups.component";
import { DropdownWithInputComponent } from "./components/dropdown-with-input/dropdown-with-input.component";
import { DropdownComponent } from "./components/dropdown/dropdown.component";
import { FabMenuComponent } from "./components/fab-menu/fab-menu.component";
import { IngredientChipComponent } from "./components/ingredient-chip/ingredient-chip.component";
import { AppendButtonComponent } from "./components/ingredient-list-item/append-button/append-button.component";
import { FromButtonComponent } from "./components/ingredient-list-item/from-button/from-button.component";
import { IngredientsContentsDetailsComponent } from "./components/ingredients-contents-details/ingredients-contents-details.component";
import { IngredientsTagsComponent } from "./components/ingredients-tags/ingredients-tags.component";
import { ListHeaderComponent } from "./components/list-header/list-header.component";
import { ListComponent } from "./components/list/list.component";
import { LoadingComponent } from "./components/loading/loading.component";
import { MenuSortComponent } from "./components/menu-sort/menu-sort.component";
import { MenuComponent } from "./components/menu/menu.component";
import { PortionCounterComponent } from "./components/portion-counter/portion-counter.component";
import { PurchaseItemComponent } from "./components/purchase-item/purchase-item.component";
import { PurchaseStatisticsComponent } from "./components/purchase-statistics/purchase-statistics.component";
import { RatingComponent } from "./components/rating/rating.component";
import { SearchActionButtonComponent } from "./components/search-action-button/search-action-button.component";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { SearchFiltersComponent } from "./components/search-filters/search-filters.component";
import { SearchNoResultsComponent } from "./components/search-no-results/search-no-results.component";
import { SearchResultColumnComponent } from "./components/search-result-item/search-result-column/search-result-column.component";
import { SearchResultItemComponent } from "./components/search-result-item/search-result-item.component";
import { SearchSortingComponent } from "./components/search-sorting/search-sorting.component";
import { SearchSuggestionsComponent } from "./components/search-suggestions/search-suggestions.component";
import { SelectionButtonsComponent } from "./components/selection-buttons/selection-buttons.component";
import { SelectionOptionsListComponent } from "./components/selection-options-list/selection-options-list.component";
import { SidenavComponent } from "./components/sidenav/sidenav.component";
import { TabBadgeComponent } from "./components/tab-badge/tab-badge.component";
import { ThemeComponent } from "./components/theme/theme.component";
import { TimerComponent } from "./components/timer/timer.component";
import { ToggleGroupComponent } from "./components/toggle-group/toggle-group.component";
import { UrlsTagsComponent } from "./components/urls-tags/urls-tags.component";
import { UtensilListItemComponent } from "./components/utensil-list-item/utensil-list-item.component";
import { UtensilsListComponent } from "./components/utensils-list/utensils-list.component";
import { UtensilsTagsComponent } from "./components/utensils-tags/utensils-tags.component";
import { FunctionsDialogComponent } from "./dialogs/functions-dialog/functions-dialog.component";
import { PurchaseToAdditionalIngredientsDialogComponent } from "./dialogs/purchase-to-additional-ingredients-dialog/purchase-to-additional-ingredients-dialog.component";
import { MobileDesktopToggleComponent } from "./dialogs/settings-dialog/mobile-desktop-toggle/mobile-desktop-toggle.component";
import { SettingsDialogComponent } from "./dialogs/settings-dialog/settings-dialog.component";
import { VersionEntryComponent } from "./dialogs/settings-dialog/version-entry/version-entry.component";
import { ExploreComponent } from "./pages/explore/explore.component";
import { ImportViaShareComponent } from "./pages/import-via-share/import-via-share.component";
import { SearchComponent } from "./pages/search/search.component";

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
    RecipesComponent,
    ShoppingListComponent,
    PurchasesComponent,
    StatisticsComponent,
    RecipeChipComponent,
    DialogComponent,
    FormfieldComponent,
    FormfieldTagsComponent,
    RecipeDialogComponent,
    IngredientListItemComponent,
    IngredientsListComponent,
    AddComponent,
    NotificationComponent,
    AccordionPanelComponent,
    InstructionComponent,
    PreparationHistoryChipComponent,
    DropdownComponent,
    DropdownWithGroupsComponent,
    PreparationDetailsPipe,
    PreparationIcon,
    TimerComponent,
    SearchComponent,
    ButtonTristateComponent,
    SidenavComponent,
    DropdownMultipleWithGroupsComponent,
    UtensilsTagsComponent,
    IngredientsTagsComponent,
    UtensilTextPipe,
    UtensilPipe,
    UtensilsFromInstructionsPipe,
    UtensilIconPipe,
    SettingsDialogComponent,
    RecipeByIdPipe,
    RecipeIsPlannedPipe,
    RecipeHasPortionsLeftPipe,
    RecipePlannedDetailsPipe,
    TotalPreparationDurationStringPipe,
    TotalPreparationTimeStringPipe,
    ClosestFractionPipe,
    FractionAsStringPipe,
    HasAtLeastOneRecipePipe,
    HasNotAtLeastOneRecipePipe,
    HasNotOneRecipePipe,
    HasAtLeastOneInstructionPipe,
    HasNotAtLeastOneInstructionPipe,
    HasNotOneInstructionPipe,
    CategoryByTypePipe,
    ShowPreparationTimePipe,
    IngredientsFromInstructionsPipe,
    ShowIngredientPipe,
    IngredientPipe,
    IngredientItemTypePipe,
    IngredientsCheckedPipe,
    ItemInListDisplayTextPipe,
    IndexInListPipe,
    IngredientIsFromRecipePipe,
    IngredientAvailabilityPipe,
    IngredientsDropdownDataPipe,
    AvailableObjectPipe,
    InstructionByIdPipe,
    AppendButtonComponent,
    FromButtonComponent,
    FromWithPipe,
    RatingComponent,
    BottomSheetComponent,
    AddRemoveComponent,
    FormfieldRequiredPipe,
    UrlsTagsComponent,
    UrlTitlePipe,
    FormErrorsPipe,
    VersionPipe,
    MajorVersionPipe,
    MajorOrMinorVersionPipe,
    VersionEntryComponent,
    SplitStringPipe,
    HighlightQuotesInTextPipe,
    FirstCharToLowercasePipe,
    ToLowercasePipe,
    ExtendTextPipe,
    EqualPipe,
    SyntaxHighlightPipe,
    ButtonOnlyIconMobileDirective,
    ButtonOnlyIconSmallScreenDirective,
    FunctionsBottomSheetComponent,
    FunctionsDialogComponent,
    AutofocusDirective,
    PurchaseItemComponent,
    StorePipe,
    OrderWithValuePipe,
    OrderWithValuesPipe,
    LastAddedPipe,
    ChipPipe,
    RecipeLastEditedPipe,
    ButtonValueFilterComponent,
    SearchActionButtonComponent,
    ButtonTristateFilterComponent,
    CheckIconComponent,
    SearchResultItemComponent,
    DifficultyByTypePipe,
    RatingByTypePipe,
    ShowColumnPipe,
    MenuBottomSheetComponent,
    SearchSuggestionsComponent,
    SearchNoResultsComponent,
    SearchFiltersComponent,
    SearchSortingComponent,
    SearchBarComponent,
    ItemPipe,
    HasItemStructurePipe,
    ItemTypeIconPipe,
    ShowAddToConversionPipe,
    CarouselComponent,
    ThemeComponent,
    MenuComponent,
    DropdownWithInputComponent,
    PurchaseItemsCountPipe,
    ToggleGroupComponent,
    ImageByFormfieldPipe,
    ImportViaShareComponent,
    FilterPipe,
    FormatDatePipe,
    IsSameDatePipe,
    TimePipe,
    FormatTimePipe,
    FormatTimeOfDayPipe,
    TimeHourFormatPipe,
    MostlyContentsTypeInRecipePipe,
    MostlyContentsTypeInIngredientPipe,
    ContentsTypeTooltipInIngredientPipe,
    IngredientIsVeganPipe,
    ContainsAlcoholPipe,
    ContainsSugarOrNoSugarPipe,
    SearchResultColumnComponent,
    CheckButtonGroupComponent,
    PricePipe,
    IngredientConversionPipe,
    HasEmojiPipe,
    UtensilsListComponent,
    UtensilListItemComponent,
    ListHeaderComponent,
    MobileDesktopToggleComponent,
    RecipeCostsPipe,
    RecipeCostsStringPipe,
    ListComponent,
    InDaysPipe,
    BeforeTodayOrTodayPipe,
    PredefinedDateRangeItemPipe,
    ButtonContentsComponent,
    ListItemPipe,
    ListItemNamePipe,
    ItemInListPipe,
    SelectionButtonsComponent,
    SelectionOptionsListComponent,
    DropdownDataSelectedPipe,
    DropdownDataSelectedIndexPipe,
    MenuSortComponent,
    SortPipe,
    SortItemBySortTypePipe,
    CounterComponent,
    PurchaseToAdditionalIngredientsDialogComponent,
    ButtonAvailableComponent,
    PurchaseToAdditionalIngredientsBottomSheetComponent,
    IncludesPipe,
    PurchaseStatisticsComponent,
    StoreCountPipe,
    PurchasesNotVeganCountPipe,
    PurchasesNoSugarCountPipe,
    itemsCountFromPurchasesPipe,
    NotesCountPipe,
    TotalCostOfPurchasesPipe,
    FilterPurchasesByDateRangePipe,
    FabMenuComponent,
    SidenavMenuItemsPipe,
    GroupNameByKeyPipe,
    IngredientsContentsDetailsComponent,
    IsVeganPipe,
    IsVegetarianPipe,
    VeganPercentagePipe,
    MessageReplaceIsStringPipe,
    UrlTypePipe,
    UrlPipe,
    UrlWithTypeByUrlPipe,
    UrlTitleWithTypeByUrlPipe,
    ForSearchPipe,
    FormatDurationPipe,
    IsImageFilePipe,
    TrimToStringPipe,
    HeaderImagePipe,
    DecimalWithFractionPipe,
    ToLowercasePipe,
    JoinPipe,
    DaysBetweenDatesPipe,
    IsTodayPipe,
    IngredientsAvailableCatgoryListsPipe,
    DeveloperMenuButtonsComponent,
    ActionButtonGroupComponent,
    LoadingComponent,
    PortionCounterComponent,
    ExploreComponent,
    ButtonShowMoreComponent,
    ButtonShowInSearchComponent,
    TabBadgeComponent,
    IngredientChipComponent,
    ButtonUseUntilComponent,
  ],
  imports: [
    // Allgemein
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HammerModule,
    TranslateModule.forRoot({
      defaultLanguage: "de",
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxMaterialTimepickerModule,
    // CDK
    CdkMenuModule,
    DragDropModule,
    ClipboardModule,
    // Material
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatSidenavModule,
    MatDividerModule,
    MatCardModule,
    MatRippleModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatBadgeModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    MatGridListModule,
    MatBottomSheetModule,
    MatListModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSliderModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFirestoreModule.enablePersistence(),
    A11yModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
  providers: [
    DatePipe,
    PricePipe,
    CurrencyPipe,
    FormErrorsPipe,
    FirstCharToLowercasePipe,
    ItemInListPipe,
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
