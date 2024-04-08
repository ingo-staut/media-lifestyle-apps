import { Component, ElementRef, OnDestroy } from "@angular/core";
import { Subject, debounceTime, takeUntil } from "rxjs";
import { LoadingService } from "./loading.service";

@Component({
  selector: "app-loading",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.scss"],
})
export class LoadingComponent implements OnDestroy {
  private readonly destroySubject = new Subject<void>();

  constructor(protected loadingService: LoadingService, private elementRef: ElementRef) {
    loadingService.pendingCount$
      .pipe(takeUntil(this.destroySubject), debounceTime(500))
      .subscribe((count) => {
        if (count <= 0) this.elementRef.nativeElement.style.display = "none";
        else this.elementRef.nativeElement.style.display = "flex";
      });
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}
