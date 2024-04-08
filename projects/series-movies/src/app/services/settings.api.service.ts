import { Injectable } from "@angular/core";
import { collection, doc, Firestore, getDocs, setDoc } from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";
import { Language } from "shared/models/enum/language.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { MediaDialogService } from "../dialogs/media-dialog/media-dialog.service";
import { Settings } from "../models/settings.class";
import { MediaApiService } from "./media.api.service";
import { MediaImportService } from "./media.import.service";

export const INITIAL_SETTINGS: Settings = {
  id: "",
  language: Language.GERMAN,
};

@Injectable({
  providedIn: "root",
})
export class SettingsApiService {
  private readonly COLLECTION_SETTINGS = "settings";

  private settingsSubject = new BehaviorSubject<Settings>(INITIAL_SETTINGS);
  settings$ = this.settingsSubject.asObservable();

  get settingsSnapshot() {
    return this.settingsSubject.value;
  }

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private mediaApiService: MediaApiService,
    private mediaImportService: MediaImportService,
    private mediaDialogService: MediaDialogService
  ) {}

  getSettings() {
    const db = collection(this.firestore, this.COLLECTION_SETTINGS);
    getDocs(db).then((data) => {
      this.settingsSubject.next(
        data.docs.map((item) => {
          return new Settings({ ...(item.data() as Settings), id: item.id });
        })[0] // Nur ein Eintrag
      );
    });
  }

  async addOrUpdateSettings(settings: Settings) {
    const data = this.convertSettingsToDTO(settings);
    await setDoc(doc(this.firestore, this.COLLECTION_SETTINGS, settings.id), data);
  }

  saveAndReloadSettings(settings: Settings) {
    this.addOrUpdateSettings(settings)
      .then(() => {
        this.getSettings();
        this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
          messageReplace: "SETTINGS.",
          icon: "settings",
        });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  convertSettingsToDTO(settings: Settings) {
    return {
      ...settings,
    };
  }

  async performDBChange() {
    console.log("performDBChange");
  }

  performDBChangeImportSeries(text: string) {
    return this.mediaImportService.readInSeries(text);
  }

  performDBChangeImportSeriesAndSave(text: string) {
    const media = this.mediaImportService.readInSeries(text);
    if (!media) return;
    this.mediaApiService.saveAndReloadMedia(media, { withOutNotification: true }).then(() => {
      this.mediaDialogService.openAndReloadData(media, { triggerQuickAdd: true });
    });
    return media;
  }

  performDBChangeImportMovie(text: string) {
    return this.mediaImportService.readInMovie(text);
  }

  performDBChangeImportMovieAndSave(text: string) {
    const media = this.mediaImportService.readInMovie(text);
    if (!media) return;
    this.mediaApiService.saveAndReloadMedia(media, { withOutNotification: true }).then(() => {
      this.mediaDialogService.openAndReloadData(media, { triggerQuickAdd: true });
    });
    return media;
  }
}
