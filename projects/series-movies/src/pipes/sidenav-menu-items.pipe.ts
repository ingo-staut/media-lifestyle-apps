import { Pipe, PipeTransform } from "@angular/core";
import { DialogAction } from "shared/models/dialog-action.type";

@Pipe({
  name: "sidenavMenuItems",
})
export class SidenavMenuItemsPipe implements PipeTransform {
  transform(selectedIndex: number) {
    const moreMenuItem: DialogAction = {
      key: "more",
      icon: "more",
      text: "MORE",
      value: "gray-background",
    };

    const seriesAndMovie = [
      {
        key: "create-series",
        text: "SERIES.",
        icon: "series",
      },
      {
        key: "create-movie",
        text: "MOVIE.",
        icon: "movie",
        color: "accent",
      },
      moreMenuItem,
    ];

    switch (selectedIndex) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
        return seriesAndMovie;

      default:
        return seriesAndMovie;
    }
  }
}
