import { Language } from "shared/models/enum/language.enum";
import { Url } from "shared/models/url.class";
import { getUrlByWikipediaUrl, isWikipediaUrl } from "./url.wikipedia";

describe("Wikipedia-URL", () => {
  it("Ist Wikipedia URL", () => {
    const is = isWikipediaUrl("https://de.wikipedia.org/wiki/Halbgeviertstrich");
    expect(is).toBeTruthy();
  });

  it("Sprache in URL erkennen", () => {
    const url = getUrlByWikipediaUrl("https://de.wikipedia.org/wiki/Halbgeviertstrich", true);
    expect(url).toEqual(
      new Url({ url: "https://de.wikipedia.org/wiki/Halbgeviertstrich", language: Language.GERMAN })
    );
  });

  it("Sprache in URL kann nicht erkannt werden (Null-Rückgabe)", () => {
    const url = getUrlByWikipediaUrl("https://wikipedia.org/wiki/Dash#En_dash", true);
    expect(url).toBeNull();
  });

  it("Sprache in URL kann nicht erkannt werden (URL-Rückgabe)", () => {
    const url = getUrlByWikipediaUrl("https://wikipedia.org/wiki/Dash#En_dash", false);
    expect(url).toEqual(new Url({ url: "https://wikipedia.org/wiki/Dash#En_dash" }));
  });
});
