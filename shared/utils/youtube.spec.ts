import { getNameOfYoutubeTrailerTitle } from "./youtube";

describe("Name aus Youtube-Titel extrahieren", () => {
  it('"Trailer"', () => {
    const title = getNameOfYoutubeTrailerTitle("Person of Interest Trailer");
    expect(title).toEqual("Person Of Interest");
  });

  it('"Official"', () => {
    const title = getNameOfYoutubeTrailerTitle("Person of Interest Official Trailer");
    expect(title).toEqual("Person Of Interest");
  });

  it('"|"', () => {
    const title = getNameOfYoutubeTrailerTitle("Person of Interest | Trailer");
    expect(title).toEqual("Person Of Interest");
  });

  it('"Limited"', () => {
    const title = getNameOfYoutubeTrailerTitle("Person of Interest Limited Series");
    expect(title).toEqual("Person Of Interest");
  });
});
