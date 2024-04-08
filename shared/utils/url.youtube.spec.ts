import { getYoutubeIdFromUrl, getYoutubeTimestampFromUrl, getYoutubeUrlById } from "./url.youtube";

describe("Youtube-URL", () => {
  it("ID extrahieren", () => {
    const id = getYoutubeIdFromUrl("https://www.youtube.com/watch?v=cHURDgtWrD0&list=WL&index=14");
    expect(id).toEqual("cHURDgtWrD0");
  });

  it("Zeit extrahieren", () => {
    const duration = getYoutubeTimestampFromUrl(
      "https://youtu.be/cHURDgtWrD0?si=z68d4Yn4FY1wEprj&t=3412"
    );
    expect(duration).toEqual(3412);
  });

  it("Erstellen mit ID", () => {
    const url = getYoutubeUrlById("cHURDgtWrD0");
    expect(url).toEqual("https://www.youtube.com/watch?v=cHURDgtWrD0");
  });
});
