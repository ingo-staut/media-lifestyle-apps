import { Injectable } from "@angular/core";
import { collection, doc, Firestore, getDocs, limit, query, setDoc } from "@angular/fire/firestore";
import { cloneDeep } from "lodash";
import { BehaviorSubject } from "rxjs";
import { getNewUUID } from "shared/utils/uuid";
import { environment } from "../../../environments/environment";
import { delimiter_lvl2, delimiter_lvl3 } from "../../data/settings-delimiter.data";
import { UtensilObject } from "../../models/utensil-object.class";

@Injectable({
  providedIn: "root",
})
export class UtensilObjectApiService {
  private readonly COLLECTION_UTENSILOBJECTS = "utensils";

  private utensilObjectsSubject = new BehaviorSubject<UtensilObject[]>([]);
  utensilObjects$ = this.utensilObjectsSubject.asObservable();

  get utensilObjectsSnapshot() {
    return this.utensilObjectsSubject.value;
  }

  constructor(private firestore: Firestore) {}

  getUtensils(loadAll?: boolean) {
    const db = collection(this.firestore, this.COLLECTION_UTENSILOBJECTS);

    let q;
    if (environment.production || loadAll) {
      q = query(db);
    } else {
      q = query(db, limit(10));
    }

    getDocs(q).then((data) => {
      this.utensilObjectsSubject.next(
        data.docs.map((item) => {
          return new UtensilObject({ ...item.data(), id: item.id, id_tmp: +item.data()["id_tmp"] });
        })
      );
    });
  }

  async saveUtensilObject(utensilObject: UtensilObject) {
    await setDoc(
      doc(this.firestore, this.COLLECTION_UTENSILOBJECTS, utensilObject.id),
      this.convertUtensilObjectToDTO(utensilObject)
    );
  }

  async updateUtensilObject(utensilObject: UtensilObject) {
    const utensilsObjects = this.utensilObjectsSubject.value.map((object) =>
      object.id === utensilObject.id ? utensilObject : object
    );

    this.utensilObjectsSubject.next(utensilsObjects);

    await setDoc(
      doc(this.firestore, this.COLLECTION_UTENSILOBJECTS, utensilObject.id),
      this.convertUtensilObjectToDTO(cloneDeep(utensilObject))
    );
  }

  convertUtensilObjectToDTO(utensilObject: UtensilObject) {
    const data = utensilObject as any;
    delete data["id"];
    delete data["fromWithInstruction"];
    return { ...data };
  }

  private readInUtensilObject(text: string) {
    const secondValue = text.split("\t");
    if (secondValue.length !== 2) {
      console.warn("Utensil: Wurde nicht eingelesen:", text);
      return;
    }

    const item = secondValue[1].split(delimiter_lvl2);
    if (item.length === 5) {
      const id = getNewUUID();
      const names = item[1].split(delimiter_lvl3);
      const icon = item[2].replace(".png", "");
      const effort = +item[3];
      const searchNames = item[4].split(delimiter_lvl3).filter((item) => item !== "");

      return new UtensilObject({
        id,
        id_tmp: +item[0],
        name: names[0],
        icon,
        effort,
        searchNames,
        alternativeNames: names.slice(1),
      });
    } else {
      console.error("error beim einlesen der Küchenutensilien", item);
      return;
    }
  }

  readAndSaveUtensilObjects(texts: string[]) {
    texts.forEach((text) => {
      const utensil = this.readInUtensilObject(text);
      if (utensil) this.saveUtensilObject(utensil);
    });
  }
}
