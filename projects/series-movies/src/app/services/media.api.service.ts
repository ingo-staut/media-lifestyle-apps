import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "@angular/fire/firestore";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, combineLatest, from, tap } from "rxjs";
import { DISCOVERY_SOURCES, findSourceByText } from "shared/data/discovery-source.data";
import {
  LANGUAGES_WITHOUT_NONE,
  findLanguageByText,
  findLanguageIconByText,
} from "shared/data/language.data";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { NotificationService } from "shared/services/notification.service";
import { URL_FAVICON, getTitleOfUrl } from "shared/utils/url";
import { getNewUUID } from "shared/utils/uuid";
import { MediaEnum } from "../../../../../shared/models/enum/media.enum";
import { TimeRange } from "../../../../../shared/models/time-range.type";
import { environment } from "../../environments/environment";
import { getAllSearchTerms } from "../../utils/translation";
import { MediaDialogService } from "../dialogs/media-dialog/media-dialog.service";
import { EpisodeDetailType } from "../models/enum/episode-detail.enum";
import { EpisodeDetail } from "../models/episode-detail.class";
import { Episode } from "../models/episode.class";
import { Media } from "../models/media.class";
import { Television } from "../models/television.class";
import { WeekTimeRanges } from "../models/week-time-ranges.type";
import { ChannelCompleterService } from "./channel.completer.service";

const mediaList = [
  new Media({
    id: "person-of-interest",
    type: MediaEnum.SERIES,
    name: "Person of Interest",
    nameOriginal: "Test",
    note: "Person of Interest",
    images: [
      "https://assets.cdn.moviepilot.de/files/1542601fe312c48396906b7709e9496e2a5b72531f2a2af3dd5d2fb5b78a/copyright/1.jpg",
    ],
    favorite: false,
    editHistory: [new Date("2023-09-22T16:38:36.000Z")],
    rating: 5,
    currentEpisode: new Episode({
      episode: 7,
      season: 2,
    }),
    runtime: 30,
    yearStart: 2022,
    yearEnd: 2022,
    urlsWatch: [],
    urlsInfo: [],
    urlsVideo: [],
    rewatch: 0,
    availableUntil: null,
    linkedIds: [
      {
        id: "cc3daf76-e2d8-4e35-b4c2-ae681ba962ea",
        note: "Hallo",
      },
    ],
    episodeDetails: [
      new EpisodeDetail({
        id: "xxx",
        season: 2,
        note: "hhhhh",
        type: EpisodeDetailType.INFO,
        episode: 8,
      }),
    ],
    genreIds: [],
    television: new Television({
      date: new Date("2023-09-05T08:05:00.000Z"),
      note: "",
      times: [
        [],
        [],
        [
          {
            start: {
              minutes: 5,
              hours: 10,
            },
            end: null,
          },
        ],
        [
          {
            end: null,
            start: {
              minutes: 5,
              hours: 10,
            },
          },
        ],
        [],
        [
          {
            start: {
              hours: 10,
              minutes: 5,
            },
            end: null,
          },
        ],
        [],
      ],
      onlyChannel: false,
      channelId: "1dc5b245-abdb-4bd1-bb34-8013567c44f3",
      live: true,
      onlyStart: false,
      weekly: 1,
      episode: new Episode({
        season: 2,
        episode: 8,
      }),
    }),
    seasons: [
      {
        episodes: 22,
        special: false,
      },
      {
        special: false,
        episodes: 23,
      },
      {
        special: true,
        episodes: 30,
      },
      {
        episodes: 23,
        special: true,
      },
    ],
  }),
];

export enum Collection {
  COLLECTION_PROD_MEDIA = "media",
  COLLECTION_DEV_MEDIA = "media-dev",
}

@Injectable({
  providedIn: "root",
})
export class MediaApiService {
  private readonly COLLECTION_MEDIA = environment.production
    ? Collection.COLLECTION_PROD_MEDIA
    : Collection.COLLECTION_DEV_MEDIA;

  mediaDialogService: MediaDialogService;

  searchFilterUrlsWatchSubject = new BehaviorSubject<ReadonlyArray<Group<string>>>([]);
  searchFilterUrlsWatch$ = this.searchFilterUrlsWatchSubject.asObservable();

  searchFilterUrlsVideoSubject = new BehaviorSubject<ReadonlyArray<Group<string>>>([]);
  searchFilterUrlsVideo$ = this.searchFilterUrlsVideoSubject.asObservable();

  searchFilterUrlsInfoSubject = new BehaviorSubject<ReadonlyArray<Group<string>>>([]);
  searchFilterUrlsInfo$ = this.searchFilterUrlsInfoSubject.asObservable();

  searchFilterChannels$ = this.channelCompleterService.channelDropdownData$;

  searchFilterLanguagesSubject = new BehaviorSubject<ReadonlyArray<Group<string>>>([]);
  searchFilterLanguages$ = this.searchFilterLanguagesSubject.asObservable();

  searchFilterCountriesSubject = new BehaviorSubject<ReadonlyArray<Group<string>>>([]);
  searchFilterCountries$ = this.searchFilterCountriesSubject.asObservable();

  searchFilterSourcesSubject = new BehaviorSubject<ReadonlyArray<Group<string>>>([]);
  searchFilterSources$ = this.searchFilterSourcesSubject.asObservable();

  get searchFilterSourcesSnapshot() {
    return this.searchFilterSourcesSubject.value;
  }

  countOldEpisodeDetails = 0;

  private mediaSubject = new BehaviorSubject<Media[]>([]);
  media$ = this.mediaSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private channelCompleterService: ChannelCompleterService,
    private translateService: TranslateService
  ) {
    combineLatest([
      this.mediaSubject.asObservable(),
      this.translateService.onLangChange.asObservable(),
    ])
      .pipe(
        // ! Füllt das Subject "searchFilterSourceUrlsSubject"
        tap(([mediaList]) => {
          const allUrls = mediaList
            .flatMap((media) => media.urlsWatch)
            .filter((url) => !!url)
            .map((url) => {
              return { name: getTitleOfUrl(url.url), url };
            });
          const uniqueUrls = [...new Map(allUrls.map((v) => [v.name, v])).values()].map((obj) => {
            const entry: Entry<string> = {
              name: obj.name,
              type: obj.name.toLowerCase(),
              icon: "",
              image: URL_FAVICON + obj.url.url,
            };
            return entry;
          });

          const group: ReadonlyArray<Group<string>> = [
            {
              name: "URL.S.WATCH",
              icon: "stream",
              entries: uniqueUrls,
            },
          ];

          this.searchFilterUrlsWatchSubject.next(group);
        }),
        tap(([mediaList]) => {
          const allUrls = mediaList
            .flatMap((media) => media.urlsVideo)
            .filter((url) => !!url)
            .map((url) => {
              return { name: getTitleOfUrl(url.url), url };
            });
          const uniqueUrls = [...new Map(allUrls.map((v) => [v.name, v])).values()].map((obj) => {
            const entry: Entry<string> = {
              name: obj.name,
              type: obj.name.toLowerCase(),
              icon: "",
              image: URL_FAVICON + obj.url.url,
            };
            return entry;
          });

          const group: ReadonlyArray<Group<string>> = [
            {
              name: "URL.S.VIDEO",
              icon: "video",
              entries: uniqueUrls,
            },
          ];

          this.searchFilterUrlsVideoSubject.next(group);
        }),
        tap(([mediaList]) => {
          const allUrls = mediaList
            .flatMap((media) => media.urlsInfo)
            .filter((url) => !!url)
            .map((url) => {
              return { name: getTitleOfUrl(url.url), url };
            });
          const uniqueUrls = [...new Map(allUrls.map((v) => [v.name, v])).values()].map((obj) => {
            const entry: Entry<string> = {
              name: obj.name,
              type: obj.name.toLowerCase(),
              icon: "",
              image: URL_FAVICON + obj.url.url,
            };
            return entry;
          });

          const group: ReadonlyArray<Group<string>> = [
            {
              name: "URL.S.INFO",
              icon: "info",
              entries: uniqueUrls,
            },
          ];

          this.searchFilterUrlsInfoSubject.next(group);
        }),
        tap(([mediaList]) => {
          const allSources = mediaList
            .flatMap((media) => media.sources)
            .concat(DISCOVERY_SOURCES.map((source) => source.name))
            .filter((source) => !!source);

          const uniqueSources = [...new Set(allSources)]
            .map((obj) => {
              const s = findSourceByText(obj);
              const entry: Entry<string> = {
                name: s?.name ?? obj,
                type: s?.key ?? obj,
                icon: s?.icon ?? "",
                additionalSearchTerms: s ? s.alternativeSearchTerms : [obj],
              };
              return entry;
            })
            // Alle mit Icon nach vorne
            .sort((a, b) =>
              a.icon === "" && b.icon !== "" ? 1 : a.icon !== "" && b.icon === "" ? -1 : 0
            );

          const group: ReadonlyArray<Group<string>> = [
            {
              name: "DISCOVERY_SOURCE.S",
              icon: "explore",
              entries: uniqueSources,
            },
          ];

          this.searchFilterSourcesSubject.next(group);
        }),
        tap(([mediaList]) => {
          const allLanguages = mediaList
            .flatMap((media) => media.languagesForSearch)
            .concat(LANGUAGES_WITHOUT_NONE.map((language) => language.key))
            .filter((language) => !!language);

          const uniqueLanguages = [...new Set(allLanguages)]
            .map((obj) => {
              const lang = findLanguageByText(obj);
              const entry: Entry<string> = {
                name: lang ? this.translateService.instant(lang.name) : obj,
                type: lang?.key ?? obj,
                icon: lang?.icon ?? "",
                additionalSearchTerms: lang ? getAllSearchTerms(lang.name) : [obj],
              };
              return entry;
            })
            // Alle mit Icon nach vorne
            .sort((a, b) =>
              a.icon === "" && b.icon !== "" ? 1 : a.icon !== "" && b.icon === "" ? -1 : 0
            );

          const group: ReadonlyArray<Group<string>> = [
            {
              name: "LANGUAGE.S",
              icon: "language",
              entries: uniqueLanguages,
            },
          ];

          this.searchFilterLanguagesSubject.next(group);
        }),
        tap(([mediaList]) => {
          const allCountries = mediaList
            .flatMap((media) => media.countriesForSearch)
            .concat(LANGUAGES_WITHOUT_NONE.map((language) => language.value ?? ""))
            .filter((country) => !!country);

          const uniqueCountries = [...new Set(allCountries)]
            .map((obj) => {
              // ! Hier wird nach Sprachen gesucht um Icon zu setzen
              const icon = findLanguageIconByText(obj);
              const entry: Entry<string> = {
                name: obj,
                type: obj,
                icon,
                additionalSearchTerms: [obj],
              };
              return entry;
            })
            // Alle mit Icon nach vorne
            .sort((a, b) =>
              a.icon === "" && b.icon !== "" ? 1 : a.icon !== "" && b.icon === "" ? -1 : 0
            );

          const group: ReadonlyArray<Group<string>> = [
            {
              name: "COUNTRY.S",
              icon: "country",
              entries: uniqueCountries,
            },
          ];

          this.searchFilterCountriesSubject.next(group);
        })
      )
      .subscribe();
  }

  async getMedia(localStore = false) {
    this.countOldEpisodeDetails = 0;

    if (localStore) {
      mediaList.forEach((media) => media.recalculateEvents());
      this.mediaSubject.next(mediaList);
      return;
    }

    const db = collection(this.firestore, this.COLLECTION_MEDIA);

    return getDocs(db).then((data) => {
      const mediaList = data.docs.map((item) => {
        const media = this.convertMediaToVM(item.data());
        return new Media({ ...media, id: item.id });
      });

      console.log("Alle alten Episodendetails", this.countOldEpisodeDetails);

      this.mediaSubject.next(mediaList);
    });
  }

  get mediaListSnapshot() {
    return this.mediaSubject.value;
  }

  copyToOppositeEnvironment(media: Media) {
    if (environment.production) {
      this.saveAndReloadMedia(media, { collection: Collection.COLLECTION_DEV_MEDIA });
    } else {
      this.saveAndReloadMedia(media, { collection: Collection.COLLECTION_PROD_MEDIA });
    }
  }

  async saveAndReloadMedia(
    media: Media,
    optionals?: { withOutNotification?: boolean; collection?: Collection }
  ) {
    const { withOutNotification, collection } = optionals ?? {};

    media.editHistory = [new Date()].concat(media.editHistory);

    return this.addOrUpdateMedia(media, { collection })
      .then(() => {
        var newMedia = true;
        const mediaWithReplacement = this.mediaSubject.value.map((item) => {
          if (item.id === media.id) {
            item = media;
            newMedia = false;
          }
          return item;
        });

        if (newMedia) mediaWithReplacement.push(media);

        this.mediaSubject.next([...mediaWithReplacement]);

        if (!withOutNotification) {
          return this.notificationService
            .show(NotificationTemplateType.SAVING_SUCCESS, {
              messageReplace:
                this.translateService.instant(media.type + ".") + " " + '"' + media.name + '"',
              icon: media.type.toLowerCase(),
              extraDuration: 3,
              // extraAction: {
              //   name: media.type + ".OPEN",
              //   icon: "open",
              // },
              extraActionOpen: {
                type: media.type,
                id: media.id,
              },
            })
            ?.subscribe(() => {
              this.mediaDialogService.openAndReloadData(media);
            });
        }

        return;
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  private async addOrUpdateMedia(media: Media, optionals?: { collection?: Collection }) {
    const { collection } = optionals ?? {};

    // Wenn Id nicht gesetzt ist, dann generiere eine
    if (!media.id) media.id = getNewUUID();

    const data = this.convertMediaToDTO(media);

    await setDoc(doc(this.firestore, collection ?? this.COLLECTION_MEDIA, media.id), data);
  }

  convertMediaToDTO(media: Media) {
    let television = null;

    if (media.television) {
      const times = media.television.times;

      const weekTimeRanges: WeekTimeRanges = {};

      if (times && times.length === 7) {
        // Assign the time ranges from WeekTimeRanges to the corresponding day
        weekTimeRanges.sunday = times[0];
        weekTimeRanges.monday = times[1];
        weekTimeRanges.tuesday = times[2];
        weekTimeRanges.wednesday = times[3];
        weekTimeRanges.thursday = times[4];
        weekTimeRanges.friday = times[5];
        weekTimeRanges.saturday = times[6];

        television = {
          ...(media.television as any),
          times: weekTimeRanges,
          episode: this.getEpisodeWithoutDetails(media.television.episode),
        };
        delete television["_episodesInTelevision"];
      } else {
        television = {
          ...(media.television as any),
          times: null,
          episode: this.getEpisodeWithoutDetails(media.television.episode),
        };
        delete television["_episodesInTelevision"];
      }
    }

    const obj = {
      ...media,
      television,
      currentEpisode: this.getEpisodeWithoutDetails(media.currentEpisode),
      episodeDetails: media.episodeDetails.map((episodeDetail) => {
        return { ...(episodeDetail as any) };
      }),
      seasons: media.seasons.map((season) => {
        return { ...(season as any) };
      }),
      urlsWatch: media.urlsWatch.map((url) => {
        return { ...(url as any) };
      }),
      urlsInfo: media.urlsInfo.map((url) => {
        return { ...(url as any) };
      }),
      urlsVideo: media.urlsVideo.map((url) => {
        return { ...(url as any) };
      }),
    } as any;

    delete obj["id"];
    delete obj["_episodeInTelevision"];
    delete obj["_searchMatchScore"];
    delete obj["_idImdb"];
    return obj;
  }

  convertMediaToVM(data: any): Media {
    let media = new Media({ ...data });

    if (data.television && media.television) {
      if (media.television.date) {
        media.television.date = new Date(data.television.date.seconds * 1000);
      }

      const times = data.television.times as WeekTimeRanges | null;

      if (times) {
        const weekTimeRanges: TimeRange[][] = [[], [], [], [], [], [], []];

        // Assign the time ranges from WeekTimeRanges to the corresponding day
        weekTimeRanges[0] = times.sunday ?? [];
        weekTimeRanges[1] = times.monday ?? [];
        weekTimeRanges[2] = times.tuesday ?? [];
        weekTimeRanges[3] = times.wednesday ?? [];
        weekTimeRanges[4] = times.thursday ?? [];
        weekTimeRanges[5] = times.friday ?? [];
        weekTimeRanges[6] = times.saturday ?? [];

        media.television.times = weekTimeRanges;
      }
    }

    media.recalculateEvents();

    media.editHistory = data.editHistory?.map((item: any) => new Date(item.seconds * 1000));
    const oldEpisodeDetails = data.specialEpisodes?.map((specialEpisode: any) => {
      specialEpisode.details = specialEpisode.details.map((detail: any) => {
        if (detail.date) detail.date = new Date(detail.date.seconds * 1000);
        return detail;
      });
      return specialEpisode;
    });

    if (data.episodeDetails) {
      media.episodeDetails = data.episodeDetails.map((detail: any) => {
        if (detail.date) detail.date = new Date(detail.date.seconds * 1000);
        return detail;
      });
    } else {
      console.log("Alte Spezialepisoden", media.name, media.id);
      this.countOldEpisodeDetails++;

      media.episodeDetails = oldEpisodeDetails.flatMap((specialEpisode: any) => {
        const episode = specialEpisode.episode;
        const season = specialEpisode.season;
        return (
          specialEpisode.details?.map((detail: any) => {
            return new EpisodeDetail({ ...detail, episode, season });
          }) ?? []
        );
      });
    }

    if (data.availableUntil) media.availableUntil = new Date(data.availableUntil.seconds * 1000);

    if (data.cinema && media.cinema) media.cinema.date = new Date(data.cinema.date.seconds * 1000);

    if ((media.isExplore || media.isFuture) && !media.ratingWatchability && media.rating) {
      media.ratingWatchability = media.rating;
      media.rating = 0;
    }

    media.currentEpisode = new Episode({ ...data.currentEpisode });

    return media;
  }

  getMediaById(id: string) {
    return from(
      getDoc(doc(this.firestore, this.COLLECTION_MEDIA, id)).then((data) => {
        return this.convertMediaToVM({ ...data.data(), id: data.id });
      })
    );
  }

  private async deleteMedia(id: string) {
    await deleteDoc(doc(this.firestore, this.COLLECTION_MEDIA, id));
  }

  deleteMediaById(media: Media, optionals?: { withOutNotification?: boolean }) {
    const { withOutNotification } = optionals ?? {};

    this.deleteMedia(media.id)
      .then(() => {
        this.mediaSubject.next([...this.mediaSubject.value.filter((item) => item.id !== media.id)]);
        if (!withOutNotification) {
          this.notificationService
            .show(NotificationTemplateType.DELETE_SUCCESS, {
              messageReplace: media.type + ".",
              icon: media.type.toLowerCase(),
            })
            ?.subscribe(() => {
              this.saveAndReloadMedia(media, { withOutNotification });
            });
        }
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.DELETE_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  /**
   * Datenfeld in allen Median entfernen
   */
  removeDatafield(datafield: string) {
    this.mediaSubject.value.forEach((media) => {
      updateDoc(doc(this.firestore, this.COLLECTION_MEDIA, media.id), {
        [datafield]: deleteField(),
      });
    });
  }

  /**
   * Datenfeld allen Median hinzufügen
   */
  addDatafield(datafield: string, value: any) {
    this.mediaSubject.value.forEach((media) => {
      updateDoc(doc(this.firestore, this.COLLECTION_MEDIA, media.id), {
        [datafield]: value,
      });
    });
  }

  getEpisodeWithoutDetails(episode: Episode) {
    const e = { ...(episode as any) };
    delete e["details"];
    return e;
  }
}
