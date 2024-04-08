/**
 * Berechnet die Breite eines Textes
 * @returns Breite in Pixeln
 */
export function getTextWidth(text: string, font?: string): number {
  let context = document.createElement("canvas").getContext("2d");
  if (!context) return 0;
  context.font = font ?? "16px Roboto";
  return context.measureText(text).width;
}
