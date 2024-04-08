import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";

export enum ButtonIconDirective {
  NORMAL = "",
  REVERSED = "REVERSED",
  ALWAYS_ICON = "ALWAYS_ICON",
  ALWAYS_ICON_AND_TEXT = "ALWAYS_ICON_AND_TEXT",
}

@Directive({
  selector: "[onlyIconMobile]",
})
export class ButtonOnlyIconMobileDirective implements AfterViewInit, OnChanges {
  @Input("onlyIconMobile") onlyIconMobile: "" | ButtonIconDirective = "";
  @Input() text: string;

  mediaQuery = MEDIA_QUERY_MOBILE_SCREEN;

  get use() {
    return this.onlyIconMobile === ButtonIconDirective.REVERSED || this.onlyIconMobile === "";
  }

  get reverse() {
    return this.onlyIconMobile === ButtonIconDirective.REVERSED;
  }

  get onlyIcon() {
    return this.onlyIconMobile === ButtonIconDirective.ALWAYS_ICON;
  }

  get onlyText() {
    return this.onlyIconMobile === ButtonIconDirective.ALWAYS_ICON_AND_TEXT;
  }

  constructor(private elementRef: ElementRef<HTMLButtonElement>) {}

  ngAfterViewInit(): void {
    // Timeout: Wenn inital das Rezept direkt mitgeladen wird
    setTimeout(() => {
      // Initial einmal setzen
      addOrRemoveOnlyIconClass(
        this.elementRef,
        this.text,
        ((this.reverse ? !this.mediaQuery.matches : this.mediaQuery.matches) && this.use) ||
          this.onlyIcon ||
          (!this.onlyText && !this.use)
      );
    }, 0);
    // Jedes mal wenn sich die Größe ändert
    this.mediaQuery.addEventListener("change", (e) => {
      addOrRemoveOnlyIconClass(
        this.elementRef,
        this.text,
        ((this.reverse ? !e.matches : e.matches) && this.use) ||
          this.onlyIcon ||
          (!this.onlyText && !this.use)
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["text"] && changes["text"].currentValue) {
      addOrRemoveOnlyIconClass(
        this.elementRef,
        this.text,
        ((this.reverse ? !this.mediaQuery.matches : this.mediaQuery.matches) && this.use) ||
          this.onlyIcon ||
          (!this.onlyText && !this.use)
      );
    }
  }
}

@Directive({
  selector: "[onlyIconSmallScreen]",
})
export class ButtonOnlyIconSmallScreenDirective implements AfterViewInit, OnChanges {
  @Input("onlyIconSmallScreen") onlyIconSmallScreen: "" | ButtonIconDirective = "";
  @Input() text: string;

  mediaQuery = MEDIA_QUERY_SMALL_SCREEN;

  get use() {
    return (
      this.onlyIconSmallScreen === ButtonIconDirective.REVERSED || this.onlyIconSmallScreen === ""
    );
  }

  get reverse() {
    return this.onlyIconSmallScreen === ButtonIconDirective.REVERSED;
  }

  get onlyIcon() {
    return this.onlyIconSmallScreen === ButtonIconDirective.ALWAYS_ICON;
  }

  get onlyText() {
    return this.onlyIconSmallScreen === ButtonIconDirective.ALWAYS_ICON_AND_TEXT;
  }

  constructor(private elementRef: ElementRef<HTMLButtonElement>) {}

  ngAfterViewInit(): void {
    // Timeout: Wenn inital das Rezept direkt mitgeladen wird
    setTimeout(() => {
      // Initial einmal setzen
      addOrRemoveOnlyIconClass(
        this.elementRef,
        this.text,
        ((this.reverse ? !this.mediaQuery.matches : this.mediaQuery.matches) && this.use) ||
          this.onlyIcon ||
          (!this.onlyText && !this.use)
      );
    }, 0);
    // Jedes mal wenn sich die Größe ändert
    this.mediaQuery.addEventListener("change", (e) => {
      addOrRemoveOnlyIconClass(
        this.elementRef,
        this.text,
        ((this.reverse ? !e.matches : e.matches) && this.use) ||
          this.onlyIcon ||
          (!this.onlyText && !this.use)
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["text"] && changes["text"].currentValue) {
      addOrRemoveOnlyIconClass(
        this.elementRef,
        this.text,
        ((this.reverse ? !this.mediaQuery.matches : this.mediaQuery.matches) && this.use) ||
          this.onlyIcon ||
          (!this.onlyText && !this.use)
      );
    }
  }
}

async function addOrRemoveOnlyIconClass(
  elementRef: ElementRef<HTMLButtonElement>,
  text: string,
  onlyIcon: boolean
) {
  const spanElement =
    elementRef.nativeElement.querySelector<HTMLSpanElement>("span.mdc-button__label");

  if (onlyIcon) {
    if (spanElement) spanElement.innerText = "";
    elementRef.nativeElement.classList.add("only-icon");
  } else {
    if (spanElement) spanElement.innerText = text;
    elementRef.nativeElement.classList.remove("only-icon");
  }
}
