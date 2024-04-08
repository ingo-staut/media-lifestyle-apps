import { Pipe, PipeTransform } from "@angular/core";
import isEqual from "lodash.isequal";
import { Url } from "shared/models/url.class";
import { isValue } from "shared/utils/type";
import { Strategy } from "../app/services/request-apis/request.api.service";

@Pipe({
  name: "isValue",
})
export class IsValuePipe implements PipeTransform {
  transform(value: any, ...args: any): boolean {
    return isValue(value);
  }
}

@Pipe({
  name: "isMediaEqualToEntry",
})
export class IsMediaEqualToEntryPipe implements PipeTransform {
  transform(media: any, entry: any): boolean {
    return isMediaEqualToEntry(media, entry);
  }
}

export function isMediaEqualToEntry(media: any, entry: any) {
  const value = media[entry.key];

  if (entry.strategy === Strategy.APPEND) {
    if (value.length && value[0] instanceof Url) {
      if (value.some((f: Url) => isEqual(f.url, entry.value.url))) {
        return true;
      } else {
        return false;
      }
    } else if (value.some((f: any) => isEqual(f, entry.value))) {
      return true;
    } else {
      return false;
    }
  }

  return isEqual(value, entry.value);
}
