import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  private pendingCountSubject = new BehaviorSubject<number>(0);
  pendingCount$ = this.pendingCountSubject.asObservable();

  countUp() {
    this.pendingCountSubject.next(this.pendingCountSubject.value + 1);
  }

  countDown() {
    this.pendingCountSubject.next(this.pendingCountSubject.value - 1);
  }

  reset() {
    this.pendingCountSubject.next(0);
  }
}
