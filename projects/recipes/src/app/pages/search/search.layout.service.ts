import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ResultListLayout } from "../../../../../../shared/models/enum/result-list-layout.enum";

@Injectable({
  providedIn: "root",
})
export class SearchLayoutService {
  private layoutSubject = new BehaviorSubject<ResultListLayout>(ResultListLayout.GRID);
  layout$ = this.layoutSubject.asObservable();

  get layoutSnapshot() {
    return this.layoutSubject.value;
  }

  setLayout(layout: ResultListLayout) {
    this.layoutSubject.next(layout);
  }
}
