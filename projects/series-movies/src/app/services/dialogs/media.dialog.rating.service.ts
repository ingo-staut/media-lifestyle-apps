import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { RATING_DATA } from "shared/data/rating.data";
import { ActionButton, ActionButtons, NumberInput } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { RatingIndex } from "shared/models/enum/rating.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { SearchEngine } from "shared/models/search-engine.type";
import { Url } from "shared/models/url.class";
import { UrlService } from "shared/services/url.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { URL_FAVICON } from "shared/utils/url";
import { getMediaTypeDetailsByType } from "../../data/media-type.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { Media } from "../../models/media.class";

@Injectable({
  providedIn: "root",
})
export class MediaDialogRatingService {
  private readonly isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  constructor(private dialogService: DialogService) {}

  open(media: Media, ratingIndex: RatingIndex, searchEngines: SearchEngine[], urlsInfo: Url[]) {
    const { rating, ratingWatchability, ratingImdb, ratingMetascore, name, nameOriginal } = media;
    const ratingValue = [rating, ratingWatchability, ratingImdb, ratingMetascore][ratingIndex];
    const hideSliderInitially = [
      false,
      false,
      !this.isSmallScreen.matches,
      !this.isSmallScreen.matches,
    ][ratingIndex];

    const { icon, iconDialog, text, max, sliderSteps, suffix, searchEngineIncludes } =
      RATING_DATA.get(ratingIndex)!;

    const searchEnginesFiltered = searchEngines.filter(
      (searchEngine) =>
        searchEngine.type === SearchEngineType.URL_INFO &&
        searchEngineIncludes &&
        searchEngine.name.toLowerCase().includes(searchEngineIncludes) &&
        (searchEngine.mediaType === media.type || !searchEngine.mediaType)
    );

    const buttons: ActionButton[] = searchEnginesFiltered.map((searchEngine) => {
      const data: ActionButton = {
        action: {
          id: "",
          text: searchEngine.name,
          icon: getMediaTypeDetailsByType(searchEngine.mediaType)?.icon || "",
          image: searchEngine.image || URL_FAVICON + searchEngine.url,
          groupKey: "SearchEngine",
        },
        searchEngine: searchEngine,
        func: (event: MouseEvent, urlService: UrlService) => {
          urlService.openOrCopyUrl({ event, searchEngine, title: nameOriginal || name });
        },
      };

      return data;
    });

    const imdbUrl = urlsInfo.find((url) => url.url.includes("imdb"));
    if (ratingIndex === RatingIndex.IMDB && imdbUrl) {
      buttons.unshift({
        action: {
          id: "",
          text: "IMDb: " + name,
          icon: "imdb-color",
        },
        maxWidth: "250px",
        func: (event: MouseEvent, urlService: UrlService) => {
          urlService.openOrCopyUrl({ event, url: imdbUrl });
        },
      });
    }

    const metacriticUrl = urlsInfo.find((url) => url.url.includes("metacritic"));
    if (ratingIndex === RatingIndex.METASCORE && metacriticUrl) {
      buttons.unshift({
        action: {
          id: "",
          text: "Metascore: " + name,
          icon: "metascore-color",
        },
        maxWidth: "250px",
        func: (event: MouseEvent, urlService: UrlService) => {
          urlService.openOrCopyUrl({ event, url: metacriticUrl });
        },
      });
    }

    const actionButtons: ActionButtons[] = [];
    if (buttons.length) {
      actionButtons.push({
        placeholder: "MENU.SEARCH",
        buttons,
      });
    }

    const add = !ratingValue;

    const numberInputs: NumberInput[] = [
      {
        number: ratingValue || null,
        icon,
        placeholder: text,
        showSlider: true,
        hideSliderInitially,
        sliderSteps,
        min: 1,
        max,
        sliderMin: 1,
        sliderMax: max,
        required: true,
        sliderNoNumberFormatting: true,
        suffixShort: suffix,
        suffixLong: suffix,
      },
    ];

    const data: DialogData = {
      title: text,
      icons: [iconDialog],
      numberInputs,
      actionButtons,
      actionPrimary: add ? ActionKey.ADD : ActionKey.APPLY,
      actionDelete: !add,
      actionCancel: true,
    };

    return this.dialogService.open(data).pipe(
      map((result) => {
        if (result) {
          return result.actionDelete ? 0 : result.numberInputs[0];
        } else {
          return undefined;
        }
      })
    );
  }
}
