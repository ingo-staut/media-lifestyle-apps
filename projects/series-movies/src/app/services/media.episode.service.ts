import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { map } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { MenuItem } from "shared/models/menu-item.type";
import { NotificationService } from "shared/services/notification.service";
import { DateFns } from "shared/utils/date-fns";
import { MenuBottomSheetService } from "../components/menu-bottom-sheet/menu-bottom-sheet.service";
import { EpisodeDetailType } from "../models/enum/episode-detail.enum";
import { EpisodeDetail } from "../models/episode-detail.class";
import { EpisodeInTelevision } from "../models/episode-in-television.type";
import { Episode } from "../models/episode.class";
import { Media } from "../models/media.class";
import { MediaDialogEpisodeDetailsService } from "./dialogs/media.dialog.episode-detail.service";
import { MediaApiService } from "./media.api.service";

@Injectable({
  providedIn: "root",
})
export class MediaEpisodeService {
  constructor(
    private mediaApiService: MediaApiService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private menuBottomSheetService: MenuBottomSheetService,
    private mediaDialogEpisodeDetailService: MediaDialogEpisodeDetailsService
  ) {}

  private nextEpisodeInTelevision(
    media: Media,
    episodeInTV: EpisodeInTelevision | undefined,
    setNewEpisode: boolean,
    setNewEpisodeDetail: boolean
  ): void {
    if (episodeInTV && media.television) {
      const previousEpisodes = media.television._episodesInTelevision?.filter(
        (e) => e.date <= episodeInTV.date
      );
      const oldCurrentEpisode = media.currentEpisode;
      const old_episode_tmp = episodeInTV.episode;
      const oldEpisodeDetails = cloneDeep(media.episodeDetails);

      const newEvent = media.findAndSetNextEvent(episodeInTV);

      let episode_tmp = episodeInTV.episode;

      const newEpisodeDetails = Media.removeAllEpisodeDetailsWithWatchtimeByEpisode(
        old_episode_tmp.season,
        old_episode_tmp.episode,
        media.episodeDetails
      );

      media.episodeDetails = newEpisodeDetails;

      if (newEvent) {
        media.television.date = newEvent.date;
        const date_tmp = newEvent.date;

        if (setNewEpisode) {
          media.television.episode = newEvent.episode;
          media.currentEpisode = episode_tmp;

          if (media.automatic) {
            media.seasons[episode_tmp.season - 1].episodes = episode_tmp.episode;
          }
        }

        if (setNewEpisodeDetail) {
          previousEpisodes?.forEach((e) => {
            // Spezialepisode setzen
            const detail: EpisodeDetail = new EpisodeDetail({
              season: e.episode.season,
              episode: e.episode.episode,
              type: EpisodeDetailType.NOT_WATCHED,
            });
            media.addEpisodeDetail(detail);
          });
        }

        media.recalculateEvents();

        this.mediaApiService.saveAndReloadMedia(media, { withOutNotification: true }).then(() => {
          this.notificationTelevisionWithEpisode(
            media,
            NotificationTemplateType.NEXT_EPISODE_IN_TELEVISION,
            date_tmp,
            newEvent.episode
          )?.subscribe(() => {
            // Reset-Button in Benachrichtigung

            media.episodeDetails = oldEpisodeDetails;

            if (setNewEpisode) {
              media.currentEpisode = oldCurrentEpisode;

              if (media.automatic) {
                media.seasons[old_episode_tmp.season - 1].episodes = oldCurrentEpisode.episode;
              }
            }

            if (setNewEpisodeDetail) {
              previousEpisodes?.forEach((e) => {
                media.removeNotWatchedFromEpisodeDetailsByEpisodeAndSeason(
                  e.episode.season,
                  e.episode.episode
                );
              });
            }

            if (media.television && previousEpisodes) {
              const oldEpisodeInTV = previousEpisodes[0];
              media.television.date = oldEpisodeInTV.date;
              media.television.episode = oldEpisodeInTV.episode;

              media.recalculateEvents();

              this.mediaApiService
                .saveAndReloadMedia(media, { withOutNotification: true })
                .then(() => {
                  this.notificationTelevisionWithEpisode(
                    media,
                    NotificationTemplateType.PREVIOUS_EPISODE_IN_TELEVISION,
                    oldEpisodeInTV.date,
                    oldEpisodeInTV.episode
                  );
                });
            }
          });
        });
      }

      // Kein nächstes Event gefunden, da es z.B. die letzte Episode der Staffel ist
      else {
        if (setNewEpisode) {
          media.television.episode.episode = episodeInTV.episode.episode + 1;
          media.currentEpisode = episode_tmp;
        }

        // Sonderfall: Nur verschieben, da Event nicht stattgefunden hat und es letzte Episode in Staffel ist
        else {
          const oldDate = media.television.date;
          media.television.date = DateFns.addMinutesToDate(media.television.date!, 1);
          media.recalculateEvents();

          const newEvent = media.television._episodesInTelevision![0];
          media.television.date = newEvent.date;

          this.mediaApiService.saveAndReloadMedia(media, { withOutNotification: true }).then(() => {
            this.notificationTelevisionWithEpisode(
              media,
              NotificationTemplateType.NEXT_EPISODE_IN_TELEVISION,
              newEvent.date,
              newEvent.episode
            )?.subscribe(() => {
              media.television!.date = oldDate;
              media.episodeDetails = oldEpisodeDetails;

              media.recalculateEvents();

              this.mediaApiService.saveAndReloadMedia(media);
            });
          });

          return;
        }

        media.recalculateEvents();

        this.mediaApiService.saveAndReloadMedia(media, { withOutNotification: true }).then(() => {
          this.notificationService
            .show(NotificationTemplateType.NO_NEXT_EVENT, {
              extraActionOpen: { type: media.type, id: media.id },
            })
            ?.subscribe(() => {
              media.episodeDetails = oldEpisodeDetails;

              if (setNewEpisode) {
                media.television!.episode.episode = episodeInTV.episode.episode;
                media.currentEpisode = oldCurrentEpisode;
              }

              media.recalculateEvents();

              this.mediaApiService.saveAndReloadMedia(media);
            });
        });
      }
    }
  }

  private notificationTelevisionWithEpisode(
    media: Media,
    type: NotificationTemplateType,
    date: Date,
    episode: Episode
  ) {
    return this.notificationService.show(type, {
      messageReplace: {
        name: media.name,
        episode:
          media.getEpisodeString(episode, this.translateService, !media.automatic) +
          ", " +
          DateFns.formatDateExtraShortWithShortDay(date, this.translateService.currentLang),
      },
      extraActionOpen: { type: media.type, id: media.id },
    });
  }

  private saveMovieAndShowTelevisionNotification(media: Media, riseWatchedCounter: boolean) {
    const television = media.television;
    media.television = null;
    if (riseWatchedCounter) media.rewatch = media.rewatch + 1;

    media.recalculateEvents();

    this.mediaApiService.saveAndReloadMedia(media, { withOutNotification: true }).then(() => {
      this.notificationService
        .show(NotificationTemplateType.WATCHED_VALUE_DELETE_TELEVISION, {
          messageReplace: riseWatchedCounter ? "WATCHED" : "NOT_WATCHED",
          extraActionOpen: { type: media.type, id: media.id },
        })
        ?.subscribe(() => {
          media.television = television;
          if (riseWatchedCounter) media.rewatch = media.rewatch - 1;

          media.recalculateEvents();

          this.mediaApiService.saveAndReloadMedia(media, { withOutNotification: true }).then(() => {
            this.notificationService.show(
              NotificationTemplateType.WATCHED_VALUE_RESTORED_TELEVISION,
              {
                messageReplace: "NOT_WATCHED",
                extraActionOpen: { type: media.type, id: media.id },
              }
            );
          });
        });
    });
  }

  onNext(media: Media, episodeInTV: EpisodeInTelevision | undefined) {
    if (media.isMovie) {
      this.saveMovieAndShowTelevisionNotification(media, true);
      return;
    }
    this.nextEpisodeInTelevision(media, episodeInTV, true, false);
  }

  onMoveToNext(media: Media, episodeInTV: EpisodeInTelevision | undefined) {
    this.nextEpisodeInTelevision(media, episodeInTV, false, false);
  }

  onNotWatched(media: Media, episodeInTV: EpisodeInTelevision | undefined) {
    if (media.isMovie) {
      this.saveMovieAndShowTelevisionNotification(media, false);
      return;
    }
    this.nextEpisodeInTelevision(media, episodeInTV, true, true);
  }

  onEpisodeInTVClicked(
    media: Media,
    episodeInTV: EpisodeInTelevision,
    event: Event,
    actions: MenuItem<string>[]
  ): void {
    event.stopPropagation();

    if (!media.isMovie) {
      actions.push({
        value: "onMoveToNext",
        text: this.translateService.instant("DID_NOT_TAKE_PLACE"),
        icon: "arrow-right",
        groupKey: "action",
      });
    }

    this.menuBottomSheetService
      .open<string>(
        {
          actions,
        },
        "without-padding"
      )
      .subscribe((value) => {
        if (value && value.value) {
          switch (value.value) {
            case "next":
              this.onNext(media, episodeInTV);
              break;
            case "onNotWatched":
              this.onNotWatched(media, episodeInTV);
              break;
            case "onMoveToNext":
              this.onMoveToNext(media, episodeInTV);
              break;
            case "note":
              this.onAddNote(media, episodeInTV.episode, true).subscribe();
              break;
            default:
              break;
          }
        }
      });
  }

  onAddNote(media: Media, episode: Episode, withOutNotification: boolean = false) {
    return this.mediaDialogEpisodeDetailService
      .openEditEpisodeDetail(media, {
        episode: episode.episode,
        season: episode.season,
        type: EpisodeDetailType.INFO,
      })
      .pipe(
        map((result) => {
          if (!result) return;

          media.recalculateEvents();
          this.mediaApiService.saveAndReloadMedia(media, { withOutNotification });

          return media;
        })
      );
  }

  onEpisodeClicked(media: Media, actions: MenuItem<string>[]) {
    return this.menuBottomSheetService
      .open<string>(
        {
          actions,
        },
        "without-padding"
      )
      .pipe(
        map((value) => {
          if (value && value.value) {
            switch (value.value) {
              case "note":
                return this.onAddNote(media, media.currentEpisode);
              case "previous-episode":
                this.onPreviousEpisode(media);
                break;
              case "next-episode":
                this.onNextEpisode(media);
                break;
              case "next-episodes":
                this.onNextEpisode(media, 2);
                break;
              default:
                break;
            }
          }

          return undefined;
        })
      );
  }

  onNextEpisode(media: Media, addEpisodes: number = 1) {
    media.incrementCurrentEpisode(addEpisodes);
    media.currentEpisode = new Episode(media.currentEpisode);
    this.mediaApiService.saveAndReloadMedia(media);
  }

  onPreviousEpisode(media: Media) {
    media.decrementCurrentEpisode();
    media.currentEpisode = new Episode(media.currentEpisode);
    this.mediaApiService.saveAndReloadMedia(media);
  }
}
