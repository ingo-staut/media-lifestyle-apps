import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { UtensilObjectApiService } from "./utensil-object.api.service";

@Injectable({
  providedIn: "root",
})
export class UtensilObjectService {
  constructor(private utensilObjectApiService: UtensilObjectApiService) {}

  completerUtensilObjects$ = this.utensilObjectApiService.utensilObjects$.pipe(
    map((utensilObjects) => {
      const names: CompleterEntry[] = [];
      utensilObjects.forEach((utensilObject) => {
        const entries = [...utensilObject.alternativeNames, utensilObject.name].map((name) => {
          const entry: CompleterEntry = {
            text: name,
            icons: ["utensil-" + utensilObject.icon],
          };
          return entry;
        });
        names.push(...entries);
      });
      return names;
    })
  );
}
