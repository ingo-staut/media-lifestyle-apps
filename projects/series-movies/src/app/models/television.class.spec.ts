import { MediaEnum } from "shared/models/enum/media.enum";
import { Episode } from "./episode.class";
import { Media } from "./media.class";
import { Television } from "./television.class";

describe("Fernsehen - Events", () => {
  it("Berechnen - 1 Event in ferner Zukunft und automatisch", () => {
    const media = new Media({
      id: "",
      type: MediaEnum.SERIES,
      seasons: [
        { special: false, episodes: 10 },
        { special: false, episodes: 5 },
      ],
      automatic: true,
      currentEpisode: new Episode({ season: 2, episode: 5 }),
      television: new Television({
        channelId: "",
        episode: new Episode({ season: 2, episode: 6 }),
        date: new Date("2024-01-01"), // Montag
        times: [
          [],
          [
            {
              start: { hours: 21, minutes: 0 },
              end: null,
            },
          ],
          [],
          [],
          [],
          [],
          [],
        ],
      }),
    });

    media.recalculateEvents(new Date("2023-05-05"));

    const length = media.television?._episodesInTelevision?.length;
    expect(length).toEqual(1);

    expect(media.television?._episodesInTelevision?.[0].date).toEqual(
      new Date("2024-01-01T20:00:00.000Z")
    );
  });

  it("Berechnen - 1 verstrichenes Event und 3 zukünftige Events", () => {
    const media = new Media({
      id: "",
      type: MediaEnum.SERIES,
      seasons: [
        { special: false, episodes: 10 },
        { special: false, episodes: 5 },
      ],
      currentEpisode: new Episode({ season: 2, episode: 1 }),
      television: new Television({
        channelId: "",
        episode: new Episode({ season: 2, episode: 2 }),
        date: new Date("2024-01-01"), // Montag
        times: [
          [],
          [
            {
              start: { hours: 21, minutes: 0 },
              end: null,
            },
          ],
          [],
          [],
          [],
          [],
          [],
        ],
      }),
    });

    media.recalculateEvents(new Date("2024-01-08"));

    const length = media.television?._episodesInTelevision?.length;
    expect(length).toEqual(4); // Ep. 2, 3, 4 und 5

    const event1 = media.television?._episodesInTelevision?.[0];
    expect(event1).toBeDefined();
    expect(event1!.date).toEqual(new Date("2024-01-01T20:00:00.000Z"));
    expect(event1!.episode.episode).toEqual(2);

    const event2 = media.television?._episodesInTelevision?.[1];
    expect(event2).toBeDefined();
    expect(event2!.date).toEqual(new Date("2024-01-08T20:00:00.000Z"));
    expect(event2!.episode.episode).toEqual(3);

    const event3 = media.television?._episodesInTelevision?.[2];
    expect(event3).toBeDefined();
    expect(event3!.date).toEqual(new Date("2024-01-15T20:00:00.000Z"));
    expect(event3!.episode.episode).toEqual(4);

    const event4 = media.television?._episodesInTelevision?.[3];
    expect(event4).toBeDefined();
    expect(event4!.date).toEqual(new Date("2024-01-22T20:00:00.000Z"));
    expect(event4!.episode.episode).toEqual(5);
  });

  it("Berechnen - Kein Event wenn nicht automatisch", () => {
    const media = new Media({
      id: "",
      type: MediaEnum.SERIES,
      seasons: [
        { special: false, episodes: 10 },
        { special: false, episodes: 5 },
      ],
      automatic: false,
      currentEpisode: new Episode({ season: 2, episode: 5 }),
      television: new Television({
        channelId: "",
        episode: new Episode({ season: 2, episode: 6 }),
        date: new Date("2024-01-01"), // Montag
        times: [
          [],
          [
            {
              start: { hours: 21, minutes: 0 },
              end: null,
            },
          ],
          [],
          [],
          [],
          [],
          [],
        ],
      }),
    });

    media.recalculateEvents(new Date("2023-05-05"));

    const length = media.television?._episodesInTelevision?.length;
    expect(length).toEqual(0);
  });
});
