import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import { DateFns } from "shared/utils/date-fns";
import { roundToNextNumber } from "shared/utils/number";
import { Recipe } from "../app/models/recipe.class";

@Pipe({
  name: "recipeById",
})
export class RecipeByIdPipe implements PipeTransform {
  transform(id: string, recipes: Recipe[]): Recipe | undefined {
    return recipes.find((recipe) => recipe.id === id);
  }
}

@Pipe({
  name: "recipeIsPlanned",
})
export class RecipeIsPlannedPipe implements PipeTransform {
  transform(recipe: Recipe): boolean {
    return recipe.oncePlanned;
  }
}

@Pipe({
  name: "recipeHasPortionsLeft",
})
export class RecipeHasPortionsLeftPipe implements PipeTransform {
  transform(recipe: Recipe): boolean {
    return !!recipe.lastPreparation && !!(recipe.lastPreparation.portionsAvailable ?? false);
  }
}

@Pipe({
  name: "recipePlannedDetails",
})
export class RecipePlannedDetailsPipe implements PipeTransform {
  transform(recipe: Recipe, locale: string) {
    return recipe.getPlannedDetails(locale);
  }
}

@Pipe({
  name: "totalPreparationDurationString",
})
export class TotalPreparationDurationStringPipe implements PipeTransform {
  transform(recipe: Recipe, locale: string): string {
    const roundToMinutes = 5;
    return DateFns.formatDurationRange(
      {
        min: roundToNextNumber(recipe.totalPreparationDurationInMinutes, roundToMinutes),
        max: 0,
      },
      locale
    );
  }
}

@Pipe({
  name: "showPreparationTime",
})
export class ShowPreparationTimePipe implements PipeTransform {
  transform(recipe: Recipe): boolean {
    const roundToMinutes = 5;
    return (
      roundToNextNumber(recipe.totalPreparationDurationInMinutes, roundToMinutes) > roundToMinutes
    );
  }
}

@Pipe({
  name: "totalPreparationTimeString",
})
export class TotalPreparationTimeStringPipe implements PipeTransform {
  transform(recipe: Recipe, withDetails: boolean, locale: string): string {
    const roundToMinutes = 5;
    const time = DateFns.roundToNextMinutes(recipe.getTotalPreparationTimeAsDate(), roundToMinutes);
    const minutes = roundToNextNumber(
      DateFns.getDurationBetweenDatesInMinutes(time, new Date()),
      roundToMinutes
    );
    const minutesFormatted = ` (~${DateFns.formatDurationRange({ min: minutes }, locale)})`;
    return (
      new DatePipe(locale).transform(time, "shortTime", undefined, locale) +
      DateFns.getTimeStringToAppend(locale) +
      (withDetails && minutes > roundToMinutes ? minutesFormatted : "")
    );
  }
}
