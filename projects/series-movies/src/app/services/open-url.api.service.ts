import { Injectable } from "@angular/core";
import { Firestore, collection, doc, onSnapshot, setDoc } from "@angular/fire/firestore";
import isEqual from "lodash.isequal";
import { BehaviorSubject, distinctUntilChanged, skip, tap } from "rxjs";
import { UrlService } from "shared/services/url.service";
import { DateFns } from "shared/utils/date-fns";

@Injectable({
  providedIn: "root",
})
export class OpenUrlOnDeviceApiService {
  private readonly COLLECTION_OPEN_URL = "open-url";
  private readonly ID_OPEN_URL = "open-url";

  openUrlOnDeviceSubject = new BehaviorSubject<{ url: string; date: Date }>({
    url: "",
    date: new Date(),
  });
  openUrlOnDevice$ = this.openUrlOnDeviceSubject.asObservable().pipe(
    distinctUntilChanged((a, b) => isEqual(a, b)),
    // Skippt den leeren initialen Wert
    skip(1),
    tap((url) => {
      // Nur wenn URL gesetzt und die URL nicht älter als eine Minute ist
      if (url.url && DateFns.isAfter(url.date, DateFns.addMinutesToDate(new Date(), -1)))
        this.urlService.openOrCopyUrl({ url: url.url });
    })
  );

  get isOpenUrlOnDevice() {
    return localStorage.getItem("openUrl") === "true";
  }

  constructor(private firestore: Firestore, private urlService: UrlService) {}

  getOpenUrl() {
    console.log("Open URLs: Es wird auf öffnende URLs geschaut");

    const db = collection(this.firestore, this.COLLECTION_OPEN_URL);
    onSnapshot(db, { includeMetadataChanges: true }, (data) => {
      this.openUrlOnDeviceSubject.next(
        data.docs.map((item) => {
          const obj = item.data() as { url: string; date: Date };
          obj.date = new Date(item.data()["date"].seconds * 1000);
          return obj;
        })[0]
      );
    });
  }

  async openUrl(url: string) {
    // ! Das wird automatisch durch das `onSnapshot` abonniert
    // this.openUrlSubject.next(url);

    await setDoc(doc(this.firestore, this.COLLECTION_OPEN_URL, this.ID_OPEN_URL), {
      url,
      date: new Date(),
    });
  }
}
