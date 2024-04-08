import { ElementRef } from "@angular/core";

export function keyIsAlphanumeric(key: string) {
  return (key >= "0" && key <= "9") || (key >= "a" && key <= "z") || (key >= "A" && key <= "Z");
}

export function alphanumericKeyPressedInputFocus(
  event: KeyboardEvent,
  input: ElementRef<HTMLInputElement> | undefined
) {
  if (!input) return;

  if (keyIsAlphanumeric(event.key)) {
    input.nativeElement.focus();
  }
}
