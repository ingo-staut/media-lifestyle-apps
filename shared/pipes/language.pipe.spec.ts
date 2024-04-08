import { TestBed } from "@angular/core/testing";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { getMostSignificantFlags } from "./language.pipe";

describe.skip("Flaggen-Icons", () => {
  let translateService: TranslateService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
    });
    translateService = TestBed.inject(TranslateService);
  });

  it("Zwei wichtigsten Flaggen mit US-Flagge", () => {
    const flags = getMostSignificantFlags(["en", "es"], ["United States"], 2, translateService).map(
      (flag) => flag.icon
    );

    expect(flags).toEqual(["language-us", "language-es"]);
  });

  it("Zwei wichtigsten Flaggen mit US-Flagge, aber nur eine Flagge", () => {
    const flags = getMostSignificantFlags(["en"], ["United States"], 2, translateService).map(
      (flag) => flag.icon
    );

    expect(flags).toEqual(["language-us"]);
  });

  it("Zwei wichtigsten Flaggen", () => {
    const flags = getMostSignificantFlags(["de", "en", "fr"], ["Germany"], 2, translateService).map(
      (flag) => flag.icon
    );

    expect(flags).toEqual(["language-de", "language-en"]);
  });

  it("Eine wichtigste Flagge", () => {
    const flags = getMostSignificantFlags(["de", "en", "fr"], ["Germany"], 1, translateService).map(
      (flag) => flag.icon
    );

    expect(flags).toEqual(["language-de"]);
  });
});
