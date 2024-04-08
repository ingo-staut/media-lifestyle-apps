import { Injectable } from "@angular/core";
import { Firestore, collection, doc, getDocs, setDoc } from "@angular/fire/firestore";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { joinTextWithComma } from "shared/utils/string";
import { environment } from "../../environments/environment";

export enum Collection {
  COLLECTION_PROD_NEWS = "news",
  COLLECTION_DEV_NEWS = "news-dev",
}

@Injectable({
  providedIn: "root",
})
export class NewsSettingsApiService {
  private readonly COLLECTION_NEWS = environment.production
    ? Collection.COLLECTION_PROD_NEWS
    : Collection.COLLECTION_DEV_NEWS;
  private readonly ID_NEWS = "news";

  private readNewsSubject = new BehaviorSubject<string[]>([]);
  readNews$ = this.readNewsSubject.asObservable();

  private termsHideNewsSubject = new BehaviorSubject<string[]>([]);
  termsHideNews$ = this.termsHideNewsSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {}

  async getNewsSettings() {
    const db = collection(this.firestore, this.COLLECTION_NEWS);

    return getDocs(db).then((data) => {
      const news = data.docs.map((item) => {
        const news = item.data() as { hide: string[]; read: string[] };
        return news;
      })[0];

      this.readNewsSubject.next(news.read);
      this.termsHideNewsSubject.next(news.hide);
    });
  }

  read(id: string[]) {
    const old = this.readNewsSubject.value;
    const readNews = [...this.readNewsSubject.value];

    readNews.push(...id);

    this.readNewsSubject.next(readNews);
    this.addOrUpdateReadNews(readNews).then(() => {
      this.notificationService.show(NotificationTemplateType.READ_NEWS)?.subscribe(() => {
        this.readNewsSubject.next(old);
        this.addOrUpdateReadNews(old);
      });
    });
  }

  hideTerms(terms: string[]) {
    const old = this.termsHideNewsSubject.value;
    const termsNews = [...this.termsHideNewsSubject.value];

    termsNews.push(...terms);

    this.termsHideNewsSubject.next(termsNews);
    this.addOrUpdateHideTermsNews(termsNews).then(() => {
      this.notificationService
        .show(NotificationTemplateType.HIDE_TERMS_NEWS, {
          messageReplace: joinTextWithComma(terms, this.translateService.instant("AND"), true),
        })
        ?.subscribe(() => {
          this.termsHideNewsSubject.next(old);
          this.addOrUpdateHideTermsNews(old);
        });
    });
  }

  private async addOrUpdateReadNews(newsIds: string[]) {
    const data = {
      ["read"]: newsIds,
      ["hide"]: this.termsHideNewsSubject.value,
    };

    await setDoc(doc(this.firestore, this.COLLECTION_NEWS, this.ID_NEWS), data);
  }

  private async addOrUpdateHideTermsNews(terms: string[]) {
    const data = {
      ["read"]: this.readNewsSubject.value,
      ["hide"]: terms,
    };

    await setDoc(doc(this.firestore, this.COLLECTION_NEWS, this.ID_NEWS), data);
  }
}
