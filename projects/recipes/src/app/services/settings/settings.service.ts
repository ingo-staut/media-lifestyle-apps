import { BreakpointObserver } from "@angular/cdk/layout";
import { Injectable } from "@angular/core";
import { combineLatest, map } from "rxjs";
import { MEDIA_QUERY_MOBILE_SCREEN_STRING } from "shared/styles/data/media-queries";
import { SettingsApiService } from "./settings.api.service";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  constructor(
    private breakpointObserver: BreakpointObserver,
    private settingsApiService: SettingsApiService
  ) {}

  breakpoint$ = this.breakpointObserver.observe([MEDIA_QUERY_MOBILE_SCREEN_STRING]).pipe(
    map((state) => {
      return state.matches;
    })
  );

  allAccordionInitiallyPanelExpanded_recipes$ = combineLatest([
    this.settingsApiService.settings$,
    this.breakpoint$,
  ]).pipe(
    map(([settings, isMobileScreen]) => {
      const setting = settings.allAccordionInitiallyPanelExpanded?.recipes;
      if (!setting) return false; // Default Wert
      return isMobileScreen ? setting.mobile : setting.screen;
    })
  );

  editIngredientInListWithDialog$ = combineLatest([
    this.settingsApiService.settings$,
    this.breakpoint$,
  ]).pipe(
    map(([settings, isMobileScreen]) => {
      const setting = settings.editIngredientInListWithDialog;
      if (!setting) return true; // Default Wert
      return isMobileScreen ? setting.mobile : setting.screen;
    })
  );

  editIngredientInTagsWithDialog$ = combineLatest([
    this.settingsApiService.settings$,
    this.breakpoint$,
  ]).pipe(
    map(([settings, isMobileScreen]) => {
      const setting = settings.editIngredientInTagsWithDialog;
      if (!setting) return true; // Default Wert
      return isMobileScreen ? setting.mobile : setting.screen;
    })
  );

  editUtensilInTagsWithDialog$ = combineLatest([
    this.settingsApiService.settings$,
    this.breakpoint$,
  ]).pipe(
    map(([settings, isMobileScreen]) => {
      const setting = settings.editUtensilInTagsWithDialog;
      if (!setting) return true; // Default Wert
      return isMobileScreen ? setting.mobile : setting.screen;
    })
  );
}
