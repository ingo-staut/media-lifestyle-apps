import { Injectable } from "@angular/core";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  DocumentData,
  Firestore,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  updateDoc,
  where,
} from "@angular/fire/firestore";
import { cloneDeep } from "lodash";
import { BehaviorSubject, map } from "rxjs";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { DateFns } from "shared/utils/date-fns";
import { getNewUUID } from "shared/utils/uuid";
import { environment } from "../../../environments/environment";
import { Item } from "../../models/item.class";
import { Purchase } from "../../models/purchase.class";

@Injectable({
  providedIn: "root",
})
export class PurchaseApiService {
  private readonly COLLECTION_PURCHASES = environment.production ? "purchases" : "purchases-dev";

  purchasesSubject = new BehaviorSubject<Purchase[]>([]);
  // Einkäufe, sortiert von neu nach alt
  purchases$ = this.purchasesSubject
    .asObservable()
    .pipe(map((purchases) => purchases.sort((a, b) => b.date.getTime() - a.date.getTime())));

  constructor(private firestore: Firestore, private notificationService: NotificationService) {}

  async getPurchases(parameters?: { all?: boolean; lastMonths?: number }) {
    const { all, lastMonths } = parameters ?? { all: false, lastMonths: 2 };
    const db = collection(this.firestore, this.COLLECTION_PURCHASES);

    // Filter: Die letzten x Monate
    const q = all
      ? query(db)
      : query(
          db,
          where("date", ">", DateFns.addMonthsToDate(new Date(), -(lastMonths ?? 2))),
          orderBy("date")
        );

    return getDocs(q).then((data) => {
      this.then(data);
    });
  }

  /**
   * @returns Alle Einkäufe, ohne sie direkt dem Observable laden
   */
  async getAllPurchases() {
    const db = collection(this.firestore, this.COLLECTION_PURCHASES);

    return getDocs(db).then((data) => {
      const purchases = data.docs.map((item) => {
        const purchase = this.convertPurchaseToVM(item.data());
        return new Purchase({ ...purchase, id: item.id });
      });
      return purchases;
    });
  }

  private then(data: QuerySnapshot<DocumentData>) {
    const purchases = data.docs.map((item) => {
      const purchase = this.convertPurchaseToVM(item.data());
      return new Purchase({ ...purchase, id: item.id });
    });
    this.purchasesSubject.next(purchases);
  }

  private convertPurchaseToVM(data: any): Purchase {
    const purchase = new Purchase({ ...data });
    purchase.date = new Date(data.date.seconds * 1000);
    purchase.items = purchase.items.map((item) => new Item(item));
    return purchase;
  }

  private convertPurchaseToDTO(purchase: Purchase) {
    const tmp = purchase as any;
    delete tmp["_lastAdded"];
    return {
      ...{ ...tmp },
      items:
        purchase.items.map((item) => {
          return this.convertItemToDTO(item);
        }) ?? [],
    };
  }

  async addOrUpdatePurchase(purchase: Purchase) {
    if (!purchase.id) purchase.id = getNewUUID();

    const data = this.convertPurchaseToDTO(purchase);

    await setDoc(doc(this.firestore, this.COLLECTION_PURCHASES, purchase.id), data);
  }

  async addOrUpdatePurchases(purchases: Purchase[]) {
    for (const purchase of purchases) {
      await this.addOrUpdatePurchase(purchase);
    }
  }

  async saveAndReloadPurchase(purchase: Purchase, withNotification = true) {
    await this.addOrUpdatePurchase(cloneDeep(purchase))
      .then(() => {
        var newPurchase = true;
        const purchasesWithReplacement = this.purchasesSubject.value.map((item) => {
          if (item.id === purchase.id) {
            item = purchase;
            newPurchase = false;
          }
          return item;
        });

        if (newPurchase) purchasesWithReplacement.push(purchase);

        this.purchasesSubject.next([...purchasesWithReplacement]);

        if (withNotification)
          this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
            messageReplace: "PURCHASE.",
            icon: "shopping-cart",
          });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  async saveAndReloadPurchases(purchases: Purchase[], withNotification = true) {
    this.addOrUpdatePurchases(cloneDeep(purchases)).then(() => {
      var newPurchase = true;

      let list = this.purchasesSubject.value;
      purchases.forEach((purchase) => {
        const purchasesWithReplacement = list.map((item) => {
          if (item.id === purchase.id) {
            item = purchase;
            newPurchase = false;
          }
          return item;
        });

        if (newPurchase) purchasesWithReplacement.push(purchase);

        list = purchasesWithReplacement;
      });

      this.purchasesSubject.next(list);

      if (withNotification)
        this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
          messageReplace: "PURCHASE.",
          icon: "shopping-cart",
        });
    });
  }

  private async deletePurchase(id: string) {
    await deleteDoc(doc(this.firestore, this.COLLECTION_PURCHASES, id));
  }

  deletePurchaseById(purchase: Purchase, withNotification = true) {
    this.deletePurchase(purchase.id)
      .then(() => {
        this.purchasesSubject.next([
          ...this.purchasesSubject.value.filter((item) => item.id !== purchase.id),
        ]);
        if (withNotification) {
          this.notificationService
            .show(NotificationTemplateType.DELETE_SUCCESS, {
              messageReplace: "PURCHASE.",
              icon: "shopping-cart",
            })
            ?.subscribe(() => {
              this.saveAndReloadPurchase(purchase, withNotification);
            });
        }
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.DELETE_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  convertItemToDTO(item: Item) {
    const i = item as any;
    return { ...i };
  }

  /**
   * Entfernt komplettes Datenfeld aus allen Einkäufen
   */
  removeDatafieldFromPurchase(datafield: string) {
    this.purchasesSubject.value.forEach((purchase) => {
      updateDoc(doc(this.firestore, this.COLLECTION_PURCHASES, purchase.id), {
        [datafield]: deleteField(),
      });
    });
  }

  /**
   * Erstellt komplett neues Datenfeld in allen Einkäufen
   */
  addDatafieldToPurchase(datafield: string, value: any) {
    const db = collection(this.firestore, this.COLLECTION_PURCHASES);
    getDocs(db).then((data) => {
      const purchases = data.docs.map((item) => {
        const purchase = this.convertPurchaseToVM(item.data());
        return new Purchase({ ...purchase, id: item.id });
      });

      purchases.forEach((purchase) => {
        updateDoc(doc(this.firestore, this.COLLECTION_PURCHASES, purchase.id), {
          [datafield]: value,
        });
      });
    });
  }
}
