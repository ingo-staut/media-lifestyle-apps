import { Component, Input, OnDestroy } from "@angular/core";
import { interval, Subscription, takeWhile } from "rxjs";

@Component({
  selector: "app-timer",
  templateUrl: "./timer.component.html",
  styleUrls: ["./timer.component.scss"],
})
export class TimerComponent implements OnDestroy {
  @Input() text: string;
  @Input() time: number;

  isTimerRunning = false;
  progress = 0;
  sub: Subscription;

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  runProgressBar() {
    if (this.isTimerRunning) {
      this.isTimerRunning = false;
      return;
    }

    this.sub?.unsubscribe();

    this.isTimerRunning = true;
    // this.progress = 0;
    this.sub = interval(1000)
      .pipe(takeWhile(() => this.progress !== this.time && this.isTimerRunning))
      .subscribe(() => {
        this.progress = this.progress + 1;
        if (this.progress === this.time) {
          this.sub.unsubscribe();
          this.isTimerRunning = false;
          this.progress = 0;
          this.playAudio();
        }
      });
  }

  onReset(event: Event): void {
    event.stopPropagation();
    this.progress = 0;
  }

  playAudio() {
    let audio = new Audio();
    audio.src = "../../../assets/audio/notification_alert.mp3";
    audio.load();
    audio.play();
  }
}
