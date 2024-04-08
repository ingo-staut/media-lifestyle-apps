import { IMDbUrlKey } from "shared/models/imdb-url-key.type";
import { getIMDbIdFromUrl, getIMDbUrlById, getIMDbUrlTypeById } from "./url.imdb";

describe("IMDb-URL", () => {
  it("ID extrahieren", () => {
    const id = getIMDbIdFromUrl("https://www.imdb.com/name/nm3141961/");
    expect(id).toEqual("nm3141961");
  });
});

describe("IMDb-URL mit ID erstellen", () => {
  it("Personen-URL", () => {
    const url = getIMDbUrlById("nm3141961", IMDbUrlKey.PERSON);
    expect(url).toEqual("https://www.imdb.com/name/nm3141961/");
  });

  it("Titel-URL", () => {
    const url = getIMDbUrlById("tt1839578");
    expect(url).toEqual("https://www.imdb.com/title/tt1839578/");
  });
});

describe("IMDb-Typ aus ID", () => {
  it("Titel", () => {
    const key = getIMDbUrlTypeById("tt1839578");
    expect(key).toEqual(IMDbUrlKey.TITLE);
  });

  it("Person", () => {
    const key = getIMDbUrlTypeById("nm3141961");
    expect(key).toEqual(IMDbUrlKey.PERSON);
  });
});
