import { Language } from "shared/models/enum/language.enum";
import { MediaEnum } from "shared/models/enum/media.enum";
import { ReplaceInTitleType } from "shared/models/enum/replace-fitting-type.enum";
import { SearchEngineType } from "shared/models/enum/search-engine.enum";
import { cleanUrl, formatUrl, getTitleOfUrl, getUrlIcons, isValidHttpUrl } from "./url";

describe("URL", () => {
  it("Ist eine valide URL", () => {
    const isUrl = isValidHttpUrl("https://de.wikipedia.org/wiki/Halbgeviertstrich");
    expect(isUrl).toBeTruthy();
    const isUrl2 = isValidHttpUrl("https://www.youtube.com/watch?v=cHURDgtWrD0&list=WL&index=14");
    expect(isUrl2).toBeTruthy();
    const isUrl3 = isValidHttpUrl("www.youtube.com/watch?v=cHURDgtWrD0&list=WL&index=14");
    expect(isUrl3).toBeFalsy();
  });
});

describe("URL - Details extrahieren", () => {
  it("Titel der URL", () => {
    const title = getTitleOfUrl("https://de.wikipedia.org/wiki/Halbgeviertstrich");
    expect(title).toEqual("Wikipedia");
  });
});

describe("URL - Ändern", () => {
  it("Clean URL", () => {
    const title = cleanUrl("https://www.youtube.com/watch?v=cHURDgtWrD0&list=WL&index=14");
    expect(title).toEqual("https://www.youtube.com/watch?v=cHURDgtWrD0");
  });

  it("Clean URL mit Zeit", () => {
    const title = cleanUrl("https://youtu.be/cHURDgtWrD0?si=z68d4Yn4FY1wEprj&t=3412");
    expect(title).toEqual("https://www.youtube.com/watch?v=cHURDgtWrD0&t=3412s");
  });
});

describe("URL Icons", () => {
  it("Playlist", () => {
    const icons = getUrlIcons("https://www.youtube.com/watch?v=cHURDgtWrD0&list=WL&index=14");
    expect(icons).toEqual(["playlist"]);
  });
});
