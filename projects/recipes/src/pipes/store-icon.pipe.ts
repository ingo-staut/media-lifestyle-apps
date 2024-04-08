import { Pipe, PipeTransform } from "@angular/core";
import { Store } from "../app/models/store.type";

@Pipe({
  name: "store",
})
export class StorePipe implements PipeTransform {
  transform(store: string, stores: Store[] | null): Store | undefined {
    return stores?.find((item) => item.name.toLowerCase() === store.toLowerCase());
  }
}
