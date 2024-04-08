import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "app-section-banner[id][show]",
  templateUrl: "./section-banner.component.html",
  styleUrls: ["./section-banner.component.scss"],
})
export class SectionBannerComponent implements OnChanges, AfterViewInit {
  @Input() show: boolean;
  @Input() id: string;
  @Input() width: number;
  @Input() textHTML: string;
  @Input() textSmallHTML: string;
  @Input() gradientPercentageEnd: number = 100;
  /**
   * Vordefinierte CSS-Hintergründe
   */
  @Input() background:
    | "primary"
    | "germany"
    | "lgbtq"
    | "international"
    | "kino-plus"
    | "csb"
    | "reddit"
    | "eagerly-awaited";
  @Input() backgroundFilter: string;

  scaleContent: number = 1;
  opacityContent: number = 1;
  opacityBackground: number = 1;
  blurContent: number = 0;
  blurBackground: number = 0;
  gradientPercentage: number = 50;

  get scroller() {
    return document.querySelector<HTMLElement>(`#${this.id} .scrollbox`);
  }

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.setClassesAndStylesToParentElement();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["show"]) {
      setTimeout(() => {
        this.scroller?.addEventListener("scroll", this.onScroll.bind(this), true);
      }, 100);
    }
  }

  setClassesAndStylesToParentElement() {
    const parent = this.el.nativeElement.parentNode as HTMLElement;

    parent.id = this.id;
    parent.classList.add("section-banner");
    // Wird von Spacer-Komponente verwendet
    parent.style.setProperty("--width", `${this.width}px`);
  }

  onScroll() {
    let scrolled = this.scroller?.scrollLeft ?? 0;

    // Nach x Pixeln
    scrolled -= 50;

    if (scrolled > 0 && scrolled <= 300) {
      this.opacityContent = 1 - scrolled / 100;
      this.scaleContent = 1 - scrolled / 600;
      this.blurContent = scrolled / 10;
      this.blurBackground = scrolled / 25;
      this.gradientPercentage = Math.min(100 - scrolled / 2, 50);
    } else if (scrolled > 300) {
      this.opacityContent = 0;
      this.blurContent = 30;
      this.blurBackground = 30;
    } else {
      this.opacityContent = 1;
      this.scaleContent = 1;
      this.blurContent = 0;
      this.blurBackground = 0;
      this.gradientPercentage = 50;
    }

    if (scrolled > 0 && scrolled <= 1000) {
      this.opacityBackground = 1 - scrolled / 500;
    } else if (scrolled > 1000) {
      this.opacityBackground = 0;
    } else {
      this.opacityBackground = 1;
    }
  }
}
