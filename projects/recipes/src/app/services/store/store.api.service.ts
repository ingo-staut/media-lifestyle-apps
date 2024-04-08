import { Injectable } from "@angular/core";
import { Firestore, collection, doc, getDocs, setDoc } from "@angular/fire/firestore";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { Store } from "../../models/store.type";
import { PurchaseApiService } from "../purchase/purchase.api.service";

@Injectable({
  providedIn: "root",
})
export class StoreApiService {
  private readonly COLLECTION_STORES = "stores";
  private readonly ID_STORES = "b7a81a1b-58d5-4639-bfa0-29e8796ddaea";

  private storesSubject = new BehaviorSubject<Store[]>([]);
  stores$ = this.storesSubject.asObservable();

  storeNames$ = this.stores$.pipe(map((stores) => stores.map((store) => store.name)));

  get storesSnapshot() {
    return this.storesSubject.value;
  }

  get storeNamesSnapshot() {
    return this.storesSnapshot.map((store) => store.name);
  }

  completerListStores$ = combineLatest([this.stores$, this.purchaseApiService.purchases$]).pipe(
    map(([stores, purchases]) => {
      const storeList = stores.map((store) => {
        const entry: CompleterEntry = {
          text: store.name,
          image: store.icon ? store.icon : undefined,
          icons: store.icon ? undefined : ["store"],
        };
        return entry;
      });
      const storeListFromPurchases = purchases.map((purchase) => {
        const entry: CompleterEntry = {
          text: purchase.store,
          icons: ["store"],
        };
        return entry;
      });

      // Beide Listen verbinden und die doppelten Einträge entfernen
      return storeList.concat(
        storeListFromPurchases.filter((item) => {
          return !storeList.find((store) => store.text === item.text);
        })
      );
    })
  );

  constructor(
    private firestore: Firestore,
    private purchaseApiService: PurchaseApiService,
    private notificationService: NotificationService
  ) {}

  getStores() {
    const db = collection(this.firestore, this.COLLECTION_STORES);
    getDocs(db).then((data) => {
      const store = data.docs.map((item) => {
        return (item.data() as { stores: Store[] }).stores;
      });
      this.storesSubject.next(store[0]);
    });
  }

  saveAndReloadStore(store: Store) {
    const stores = [...this.getNewStoresList(store)];
    this.addOrUpdateStores(stores)
      .then(() => {
        this.storesSubject.next(stores);

        this.notificationService.show(NotificationTemplateType.SAVING_SUCCESS, {
          messageReplace: "STORE.",
          icon: "store",
        });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.SAVING_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  deleteAndReloadStore(store: Store) {
    const stores = this.removeStoreFromStoreList(store.name);
    this.addOrUpdateStores(stores)
      .then(() => {
        this.storesSubject.next(stores);

        this.notificationService
          .show(NotificationTemplateType.DELETE_SUCCESS, {
            messageReplace: "STORE.",
            icon: "store",
          })
          ?.subscribe(() => {
            this.saveAndReloadStore(store);
          });
      })
      .catch((error) => {
        this.notificationService.show(NotificationTemplateType.DELETE_ERROR, {
          additionalMessages: [error],
        });
      });
  }

  private async addOrUpdateStores(stores: Store[]) {
    const data = this.convertStoresToDTO(stores);
    await setDoc(doc(this.firestore, this.COLLECTION_STORES, this.ID_STORES), data);
  }

  private convertStoreToDTO(store: Store) {
    return {
      ...store,
    };
  }

  private convertStoresToDTO(stores: Store[]) {
    return {
      ["stores"]: stores.map((item) => {
        return this.convertStoreToDTO(item);
      }),
    };
  }

  private getNewStoresList(store: Store) {
    var newStore = true;
    const storesWithReplacement = this.storesSubject.value.map((s) => {
      if (s.name === store.name) {
        s = store;
        newStore = false;
      }
      return s;
    });

    if (newStore) storesWithReplacement.push(store);

    return storesWithReplacement;
  }

  private removeStoreFromStoreList(id: string) {
    return this.storesSubject.value.filter((store) => store.name !== id);
  }
}
