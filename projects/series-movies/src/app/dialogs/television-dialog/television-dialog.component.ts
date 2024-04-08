import { Component, HostListener, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import moment, { Moment } from "moment";
import { preventBrowserTabClosing } from "projects/series-movies/src/utils/warning-dialog";
import { ButtonIconDirective } from "shared/directives/button-icon.directive";
import { DialogAction } from "shared/models/dialog-action.type";
import { ItemsType } from "shared/models/dialog-input.type";
import { DialogData } from "shared/models/dialog.type";
import { ActionKey } from "shared/models/enum/action-key.enum";
import { ButtonTristate } from "shared/models/enum/button-tristate.enum";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { compareTimes } from "shared/models/time.type";
import { LocaleService } from "shared/services/locale.service";
import { NotificationService } from "shared/services/notification.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { DateFns } from "shared/utils/date-fns";
import { REGEX_NOT_NONE } from "shared/utils/regexp";
import { TimeRange } from "../../../../../../shared/models/time-range.type";
import { CINEMA_ID, STREAM_ID } from "../../models/enum/channel.enum";
import { Episode } from "../../models/episode.class";
import { Media } from "../../models/media.class";
import { Television } from "../../models/television.class";
import { ChannelApiService } from "../../services/channel.api.service";
import { ChannelCompleterService } from "../../services/channel.completer.service";
import { ChannelDialogsService } from "../../services/channel.dialogs.service";
import { DialogService } from "../dialog/dialog.service";

export type TelevisionDialogReturnData = {
  actionKey: string;
  actionAdd?: boolean;
  actionApply?: boolean;
  actionAddOrApply?: boolean;
  actionDelete?: boolean;
  television?: Television | null;
};

export type TelevisionDialogData = {
  add: boolean;
  television: Television;
  media: Media;
};

@Component({
  selector: "app-television-dialog",
  templateUrl: "./television-dialog.component.html",
  styleUrls: ["./television-dialog.component.scss"],
})
export class TelevisionDialogComponent implements OnInit {
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  FormfieldType = FormfieldType;
  ButtonIconDirective = ButtonIconDirective;
  ItemsType = ItemsType;
  DateFns = DateFns;

  tristateButtonState: ButtonTristate;

  showInputsInGroupIndex: boolean[] = [];

  add: boolean;
  actionPrimary: DialogAction;

  onlyChannel: boolean;
  onlyStart: boolean;
  live: boolean;
  seasonMin: number = 1;
  seasonMax: number;
  seasonDisabled: boolean;
  episodeMin: number = 1;
  episodeMax: number;
  episodeDisabled: boolean;
  weeklyDisabled: boolean;
  startDateDisabled: boolean;
  startTimeDisabled: boolean;
  startTime: string;

  formGroup: ReturnType<typeof this.initializeFormGroup>;

  get isAllowedSubmit() {
    return this.formGroup.valid;
  }

  get disableEditChannel() {
    return (
      !this.formGroup.controls.channelId.value ||
      (this.formGroup.controls.channelId.value &&
        (this.formGroup.controls.channelId.value === CINEMA_ID ||
          this.formGroup.controls.channelId.value === STREAM_ID ||
          this.formGroup.controls.channelId.value === "none"))
    );
  }

  constructor(
    private dialogRef: MatDialogRef<TelevisionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TelevisionDialogData,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private channelDialogsService: ChannelDialogsService,
    private channelApiService: ChannelApiService,
    protected localeService: LocaleService,
    protected channelCompleterService: ChannelCompleterService
  ) {}

  ngOnInit(): void {
    this.add = this.data.add;
    this.actionPrimary = this.getActionPrimary(this.add);

    this.formGroup = this.initializeFormGroup();

    const { onlyChannel, onlyStart, live } = this.data.television;

    this.onlyChannel = onlyChannel;
    this.onlyStart = onlyStart;
    this.live = live;
    this.seasonMax = this.data.media.seasons.length;
    this.episodeMax =
      this.data.media.seasons.length &&
      this.data.television.episode.season > 0 &&
      this.data.television.episode.season <= this.data.media.seasons.length
        ? this.data.media.seasons[this.data.television.episode.season - 1].episodes + 1
        : 1;

    this.formGroup.controls.season.valueChanges.subscribe((season) => {
      if (!season || season < 0 || !this.data.media.seasons.length) return;
      this.episodeMax = this.data.media.seasons[season - 1].episodes + 1;
    });

    if (this.data.media.isMovie) {
      this.formGroup.controls.date.valueChanges.subscribe((date) => {
        const startDate = date?.toDate();
        if (startDate) {
          const times: TimeRange[][] = [[], [], [], [], [], [], []];
          const start = DateFns.getHoursAndMinutesOfTimeString(
            this.formGroup.controls.startTime.value ?? "00:00"
          );
          times[startDate.getDay()] = [{ start, end: null }];
          this.formGroup.controls.events.patchValue(times);
        }
      });
      this.formGroup.controls.startTime.valueChanges.subscribe((time) => {
        time = time ?? "00:00";
        const date = this.formGroup.controls.date.value
          ? this.formGroup.controls.date.value.toDate()
          : new Date();
        const times: TimeRange[][] = [[], [], [], [], [], [], []];
        const start = DateFns.getHoursAndMinutesOfTimeString(time);
        times[date.getDay()] = [{ start, end: null }];
        this.formGroup.controls.events.patchValue(times);
      });
    }

    this.onOnlyChannelChange();
  }

  eventsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const events = control.get("events")?.value as TimeRange[][] | null;
      const startTime = control.get("startTime")?.value as string | null;
      const date = control.get("date")?.value as Moment | null;

      if (!startTime || !date || !events) return { noStartTime: { value: "nully" } };

      const weekdayIndex = date?.day();
      const timeRange = events[weekdayIndex];

      const startTimeAsDate = DateFns.setTimeStringToDate(new Date(), startTime);

      if (!timeRange || timeRange.length === 0) {
        return { noEventsForThisDay: { value: "" } };
      }

      if (
        !timeRange.some(
          (time) =>
            time.start.hours === startTimeAsDate.getHours() &&
            time.start.minutes === startTimeAsDate.getMinutes()
        )
      ) {
        return { noSuitableEventsForThisDay: { value: "" } };
      }

      return null;
    };
  }

  initializeFormGroup() {
    const { note, episode, weekly, date, channelId, times, episodesPerTime } = this.data.television;

    const startTime = this.data.television.date
      ? DateFns.formatDateAsTimeString(this.data.television.date, this.translateService.currentLang)
      : "00:00";

    return this.formBuilder.group({
      note: [note],
      season: [episode.season],
      episode: [episode.episode],
      weekly: [weekly],
      episodesPerTime: [episodesPerTime],
      date: [moment(date)],
      startTime: [startTime],
      channelId: [channelId, [Validators.required, Validators.pattern(REGEX_NOT_NONE)]],
      events: [times as TimeRange[][]],
    });
  }

  getActionPrimary(add: boolean): DialogAction {
    const key = add ? ActionKey.ADD : ActionKey.APPLY;
    const action: DialogAction = {
      key,
      text: "ACTION." + key.toUpperCase(),
      icon: add ? "add" : "check",
      color: "primary",
    };
    return action;
  }

  getAllData() {
    if (this.onlyChannel) {
      const dataFromForm = this.formGroup.getRawValue();
      const data: Television = new Television({
        ...this.data.television,
        times: [],
        note: dataFromForm.note ?? "",
        episode: new Episode({ season: 0, episode: 0 }),
        weekly: 1,
        episodesPerTime: 1,
        channelId: dataFromForm.channelId ?? "",
        date: null,
        onlyChannel: this.onlyChannel,
        onlyStart: false,
        live: false,
      });
      return data;
    }

    const dataFromForm = this.formGroup.getRawValue();
    const data: Television = new Television({
      ...this.data.television,
      times: dataFromForm.events,
      note: dataFromForm.note ?? "",
      episode: new Episode({
        season: dataFromForm.season || 0,
        episode: dataFromForm.episode || 0,
      }),
      weekly: dataFromForm.weekly ?? 1,
      episodesPerTime: dataFromForm.episodesPerTime ?? 1,
      channelId: dataFromForm.channelId ?? "",
      date:
        dataFromForm.date && dataFromForm.startTime
          ? DateFns.setTimeStringToDate(dataFromForm.date.toDate(), dataFromForm.startTime)
          : null,
      onlyChannel: this.onlyChannel,
      onlyStart: this.onlyStart,
      live: this.live,
    });
    return data;
  }

  onActionPrimary(action: DialogAction | ActionKey | false) {
    const actionKey =
      typeof action === "string" ? action : typeof action === "boolean" ? "" : action.key;

    const actionAdd = actionKey === ActionKey.ADD;
    const actionApply = actionKey === ActionKey.APPLY;
    const actionAddOrApply = actionAdd || actionApply;

    const data: TelevisionDialogReturnData = {
      television: this.getAllData(),
      actionKey,
      actionAdd,
      actionApply,
      actionAddOrApply,
    };

    this.dialogRef.close(data);
  }

  onActionDelete() {
    const data: TelevisionDialogReturnData = {
      television: this.getAllData(),
      actionKey: ActionKey.DELETE,
      actionDelete: true,
    };

    this.dialogRef.close(data);
  }

  onActionClick(action: DialogAction) {
    const data: TelevisionDialogReturnData = {
      television: this.getAllData(),
      actionKey: action.key ?? action.text,
      actionDelete: action.key === ActionKey.DELETE,
    };

    this.dialogRef.close(data);
  }

  onEnter() {
    if (!this.isAllowedSubmit) return;

    this.onActionPrimary(this.actionPrimary);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onTimeClicked(weekdayIndex: number, time: TimeRange, locale: string) {
    const closestDate = DateFns.getClosestDateInCurrentWeek(
      this.formGroup.controls.date.value?.toDate() ?? new Date(),
      weekdayIndex,
      locale
    );

    const nextDayByNewWeekday = DateFns.setTimeRangeToDate(
      closestDate,
      time.start.hours,
      time.start.minutes
    );

    this.formGroup.controls.date.patchValue(moment(nextDayByNewWeekday));

    this.formGroup.patchValue({
      startTime: DateFns.formatDateAsTimeString(nextDayByNewWeekday, locale),
      date: moment(nextDayByNewWeekday),
    });
  }

  onDayClicked(weekdayIndex: number, locale: string) {
    const events = this.formGroup.controls.events.value;
    if (events && events.length) {
      if (events[weekdayIndex].length) {
        const newTime = events[weekdayIndex][0];
        this.onTimeClicked(weekdayIndex, newTime, locale);
      }
    }
  }

  timeValueChanged(timeString: string, weekdayIndex: number) {
    const events = this.formGroup.controls.events.value ?? [[], [], [], [], [], [], []];

    const newTime = DateFns.getTimeFromTimeString(timeString);
    const timesPerDay = events[weekdayIndex]!;

    if (
      timesPerDay.some(
        (time) => time.start.hours === newTime.hours && time.start.minutes === newTime.minutes
      )
    ) {
      this.notificationService.show(NotificationTemplateType.TIME_EXISTS_ALREADY);
      return;
    }

    timesPerDay.push({
      start: newTime,
      end: null,
    });

    timesPerDay.sort((time1, time2) => compareTimes(time1.start, time2.start));

    events[weekdayIndex] = timesPerDay;

    this.formGroup.controls.events.patchValue(events);
  }

  onEventMenuItemClicked(
    value: any,
    weekdayIndex: number,
    timeIndex: number,
    timeRange: TimeRange,
    locale: string
  ) {
    const events = this.formGroup.controls.events.value;

    switch (value) {
      case "delete":
        if (events) {
          const timesPerDay = events[weekdayIndex];
          events[weekdayIndex] = timesPerDay.filter((_, index) => index !== timeIndex);

          this.formGroup.controls.events.setValue(events, { emitEvent: true });
        }
        break;

      case "select":
        this.onTimeClicked(weekdayIndex, timeRange, locale);
        break;

      case "edit":
        const data: DialogData = {
          title: "TIME.S_EDIT",
          timeInputs: [
            {
              placeholder: "TIME.START",
              time: DateFns.formatTimeAsTimeString(timeRange.start, locale),
              minutesSteps: 5,
            },
            {
              placeholder: "TIME.END",
              time: timeRange.end ? DateFns.formatTimeAsTimeString(timeRange.end, locale) : null,
              minutesSteps: 5,
            },
          ],
          icons: ["time"],
          actions: [
            {
              key: "delete-end-time",
              text: "TIME.END_DELETE",
              icon: "time",
              color: "warn",
              buttonIconDirective: this.isSmallScreen.matches
                ? ButtonIconDirective.ALWAYS_ICON
                : ButtonIconDirective.NORMAL,
            },
          ],
          actionPrimary: ActionKey.APPLY,
          actionDelete: true,
          actionDeleteIconDirective: this.isSmallScreen.matches
            ? ButtonIconDirective.ALWAYS_ICON
            : ButtonIconDirective.NORMAL,
          actionCancel: true,
        };

        this.dialogService.open(data).subscribe((result) => {
          const events = this.formGroup.controls.events.value;

          if (result?.actionApply && events) {
            events[weekdayIndex][timeIndex] = {
              start: DateFns.getTimeFromTimeString(result.timeInputs[0]!),
              end: result.timeInputs[1]
                ? DateFns.getTimeFromTimeString(result.timeInputs[1])
                : null,
            };

            events[weekdayIndex] = events[weekdayIndex].sort((time1, time2) =>
              compareTimes(time1.start, time2.start)
            );
          } else if (result?.actionDelete && events) {
            events[weekdayIndex].splice(timeIndex, 1);
          } else if (result?.actionKey === "delete-end-time" && events) {
            events[weekdayIndex][timeIndex] = {
              start: events[weekdayIndex][timeIndex].start,
              end: null,
            };
          }

          this.formGroup.controls.events.patchValue(events);
        });
        break;

      case "delete-all":
        if (events) {
          const daysWhereTimeDeleted: number[] = [];
          events.forEach((range, index) => {
            if (
              range.some(
                (time) =>
                  time.start.hours === timeRange.start.hours &&
                  time.start.minutes === timeRange.start.minutes &&
                  ((time.end && timeRange.end) || (!time.end && !timeRange.end)) &&
                  time.end?.hours === timeRange.end?.hours &&
                  time.end?.minutes === timeRange.end?.minutes
              )
            ) {
              daysWhereTimeDeleted.push(index);
            }

            events[index] = range.filter(
              (time) =>
                !(
                  time.start.hours === timeRange.start.hours &&
                  time.start.minutes === timeRange.start.minutes &&
                  ((time.end && timeRange.end) || (!time.end && !timeRange.end)) &&
                  time.end?.hours === timeRange.end?.hours &&
                  time.end?.minutes === timeRange.end?.minutes
                )
            );
          });

          this.formGroup.controls.events.patchValue(events);

          this.notificationService.show(NotificationTemplateType.TIME_DELETED_FROM_DAYS, {
            messageReplace: DateFns.formatWeekdayRangesAsString(
              daysWhereTimeDeleted,
              locale,
              this.translateService.instant("AND")
            ),
          });
        }
        break;

      case "add-to-all":
        if (events) {
          const dayIndexesAlreadyHadTime: number[] = [];
          events.map((range, index) => {
            if (
              !range.some(
                (time) =>
                  time.start.hours === timeRange.start.hours &&
                  time.start.minutes === timeRange.start.minutes
              )
            ) {
              dayIndexesAlreadyHadTime.push(index);
              range.push(timeRange);
              range.sort((time1, time2) => compareTimes(time1.start, time2.start));
            }
          });

          this.formGroup.controls.events.patchValue(events);

          this.notificationService.show(NotificationTemplateType.TIME_ADDED_TO_DAYS, {
            messageReplace: DateFns.formatWeekdayRangesAsString(
              dayIndexesAlreadyHadTime,
              locale,
              this.translateService.instant("AND")
            ),
          });
        }
        break;

      default:
        break;
    }
  }

  onOnlyChannelChange() {
    if (!this.onlyChannel) {
      if (
        !this.formGroup.controls.events.value ||
        this.formGroup.controls.events.value.length < 7
      ) {
        this.formGroup.controls.events.patchValue([[], [], [], [], [], [], []]);
      }

      this.formGroup.addValidators(this.eventsValidator());
    } else {
      this.formGroup.clearValidators();
    }
  }

  onEditChannel() {
    const id = this.formGroup.controls.channelId.value ?? null;
    this.onEditChannelById(id);
  }

  onAddChannel() {
    this.onEditChannelById("");
  }

  onEditChannelById(id: string | null) {
    if (id === null || id === CINEMA_ID || id === STREAM_ID) return;
    this.channelDialogsService.openEditOrAddChannel(id).subscribe((result) => {
      if (result?.actionDelete && this.formGroup.controls.channelId.value === id) {
        this.formGroup.controls.channelId.patchValue("none");
      }
      // Setzen von neuem, gerade erstelltem, Sender funktioniert nicht!
    });
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeBrowserTabClose(event: any) {
    preventBrowserTabClosing(event, true);
  }
}
