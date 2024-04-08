import { MediaEnum } from "shared/models/enum/media.enum";
import { Episode } from "./episode.class";
import { Media } from "./media.class";

describe("Media - Episoden und Staffeln", () => {
  it("Aktuelle Staffel", () => {
    const media = new Media({
      id: "",
      type: MediaEnum.SERIES,
      seasons: [
        { special: false, episodes: 10 },
        { special: false, episodes: 5 },
      ],
      currentEpisode: new Episode({ season: 2, episode: 5 }),
    });

    expect(media.currentSeason).toEqual(2);
  });

  it("Aktuelle Staffel mit Spezialstaffel", () => {
    const media = new Media({
      id: "",
      type: MediaEnum.SERIES,
      seasons: [
        { special: true, episodes: 10 },
        { special: false, episodes: 5 },
      ],
      currentEpisode: new Episode({ season: 2, episode: 5 }),
    });

    expect(media.currentSeason).toEqual(1);
  });

  it("Aktuelle Staffel mit nur Spezialstaffeln", () => {
    const media = new Media({
      id: "",
      type: MediaEnum.SERIES,
      seasons: [
        { special: true, episodes: 10 },
        { special: true, episodes: 5 },
      ],
      currentEpisode: new Episode({ season: 2, episode: 5 }),
    });

    expect(media.currentSeason).toEqual(2);
  });

  it("Aktuelle Staffel mit Spezialstaffeln", () => {
    const media = new Media({
      id: "",
      type: MediaEnum.SERIES,
      seasons: [
        { special: false, episodes: 10 },
        { special: true, episodes: 5 },
      ],
      currentEpisode: new Episode({ season: 2, episode: 5 }),
    });

    expect(media.currentSeason).toEqual(1);
  });
});
