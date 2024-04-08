import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "lastAdded",
})
export class LastAddedPipe implements PipeTransform {
  transform(lastAdded: Date | null, items?: any | null): boolean {
    if (lastAdded && !items) return lastAdded.getTime() > new Date().getTime() - 1000;

    if (!items || !lastAdded) return false;

    return (
      !!items.find((i: any) =>
        i._lastAdded ? i._lastAdded.getTime() > lastAdded.getTime() && lastAdded.getTime() : true
      ) && lastAdded.getTime() > new Date().getTime() - 1000
    );
  }
}
