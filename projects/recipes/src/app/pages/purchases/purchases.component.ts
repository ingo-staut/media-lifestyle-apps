import { AfterViewInit, Component, OnDestroy } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Observable, Subject, combineLatest, map, take, takeUntil } from "rxjs";
import {
  MEDIA_QUERY_MOBILE_SCREEN,
  MEDIA_QUERY_SMALL_SCREEN,
} from "shared/styles/data/media-queries";
import { stickyPinned } from "shared/utils/css-sticky-pinned";
import { DateFns } from "shared/utils/date-fns";
import { ITEM_DATA } from "../../data/item.data";
import { DialogService } from "../../dialogs/dialog/dialog.service";
import { PurchaseToAdditionalIngredientsDialogService } from "../../dialogs/purchase-to-additional-ingredients-dialog/purchase-to-additional-ingredients-dialog.service";
import { ItemType } from "../../models/enum/item.enum";
import { Item } from "../../models/item.class";
import { Purchase } from "../../models/purchase.class";
import { CompleterService } from "../../services/completer.service";
import { IngredientConversionCompleterService } from "../../services/ingredient/ingredient-conversion.completer.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { PurchaseApiService } from "../../services/purchase/purchase.api.service";
import { PurchaseCompleterService } from "../../services/purchase/purchase.completer.service";
import { PurchaseDialogsService } from "../../services/purchase/purchase.dialogs.service";
import { StoreApiService } from "../../services/store/store.api.service";

@Component({
  selector: "app-purchases",
  templateUrl: "./purchases.component.html",
  styleUrls: ["./purchases.component.scss"],
})
export class PurchasesComponent implements OnDestroy, AfterViewInit {
  ITEM_DATA = ITEM_DATA;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  ItemType = ItemType;

  private readonly destroySubject = new Subject<void>();

  selectedItemTypeSubject = new BehaviorSubject<ItemType>(
    this.localStorageService.getPurchasesFilterType()
  );

  selectedIndex$ = this.selectedItemTypeSubject.pipe(
    takeUntil(this.destroySubject),
    map((item) => this.ITEM_TYPES.indexOf(item))
  );

  purchasesFood$ = this.purchaseApiService.purchases$.pipe(
    takeUntil(this.destroySubject),
    map((purchases) => purchases.filter((purchase) => purchase.type === ItemType.FOOD))
  );

  purchasesThing$ = this.purchaseApiService.purchases$.pipe(
    takeUntil(this.destroySubject),
    map((purchases) => purchases.filter((purchase) => purchase.type === ItemType.THING))
  );

  completerList$ = combineLatest([
    this.storeApiService.completerListStores$,
    this.completerService.completerListDates$,
    this.ingredientService.completerListIngredientsConversionNames$,
    this.purchaseCompleterService.completerListItemTypes$,
  ]).pipe(
    takeUntil(this.destroySubject),
    map(([shops, dates, ingredientsConversion, itemTypes]) =>
      shops.concat(dates).concat(ingredientsConversion).concat(itemTypes)
    )
  );

  readonly ITEM_TYPES = [ItemType.FOOD, ItemType.THING];
  readonly TABS: {
    icon: string;
    text: string;
    purchases$: Observable<Purchase[]>;
    type: ItemType;
    tags: string[];
  }[] = [
    {
      icon: "ingredient",
      text: "FOOD",
      purchases$: this.purchasesFood$,
      type: ItemType.FOOD,
      tags: [],
    },
    {
      icon: "thing",
      text: "THINGS",
      purchases$: this.purchasesThing$,
      type: ItemType.THING,
      tags: [],
    },
  ];

  tags: string[] = [];
  expandedIds: string[] = [];

  isInputOpen = false;

  constructor(
    private dialogService: DialogService,
    protected purchaseCompleterService: PurchaseCompleterService,
    private purchaseApiService: PurchaseApiService,
    protected storeApiService: StoreApiService,
    private completerService: CompleterService,
    protected ingredientApiService: IngredientApiService,
    private ingredientService: IngredientConversionCompleterService,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService,
    private purchaseDialogsService: PurchaseDialogsService,
    private purchaseToAdditionalIngredientsDialogService: PurchaseToAdditionalIngredientsDialogService
  ) {}

  ngAfterViewInit(): void {
    stickyPinned();
  }

  ngOnDestroy(): void {
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  onAdd(value: string) {
    value = value.trim();

    const purchase = Purchase.parse(
      value,
      this.storeApiService.storeNamesSnapshot,
      this.ingredientApiService.ingredientsConversionSubject.value,
      this.selectedItemTypeSubject.value,
      this.translateService
    );
    purchase._lastAdded = new Date();
    this.selectedItemTypeSubject.next(purchase.type);
    this.purchaseApiService.saveAndReloadPurchase(purchase);
  }

  onDelete(purchase: Purchase) {
    this.dialogService
      .open({
        title: "PURCHASE.DELETE_ACTION.TITLE",
        text: "PURCHASE.DELETE_ACTION.TEXT",
        icons: ["delete"],
        actionPrimary: false,
        actionDelete: true,
        actionCancel: true,
      })
      .subscribe((result) => {
        if (result) {
          this.purchaseApiService.deletePurchaseById(purchase);
        }
      });
  }

  onEdit(purchase: Purchase, index: number) {
    this.purchaseApiService.deletePurchaseById(purchase);

    const tags: string[] = [];
    tags.push(purchase.type);
    tags.push(purchase.store);
    tags.push(DateFns.formatDateShort(purchase.date, this.translateService.currentLang));
    tags.push(purchase.price.toString() + " €");
    purchase.items.map((item) => tags.push(new Item(item).getItemString()));
    this.TABS[index].tags = tags;
  }

  tabIndexChanged(index: number) {
    this.selectedItemTypeSubject.next(this.ITEM_TYPES[index]);
    this.localStorageService.setPurchasesFilterType(this.ITEM_TYPES[index]);
  }

  onNextTab() {
    this.selectedItemTypeSubject.next(ItemType.THING);
  }

  onPreviousTab() {
    this.selectedItemTypeSubject.next(ItemType.FOOD);
  }

  onOpenDialog() {
    combineLatest([
      this.ingredientApiService.ingredientsConversion$,
      this.purchaseCompleterService.completerListItems$,
      this.storeApiService.completerListStores$,
    ])
      .pipe(take(1), takeUntil(this.destroySubject))
      .subscribe(([ingredientsConversion, completerList, completerListStores]) => {
        this.purchaseDialogsService
          .openAddOrEditPurchaseDialog({
            ingredientsConversion,
            completerListStores,
            completerList,
            defaultType: this.selectedItemTypeSubject.value,
          })
          .subscribe();
      });
  }

  expandedPanel(expanded: boolean, purchase: Purchase) {
    if (expanded) {
      this.expandedIds.push(purchase.id);
    } else {
      this.expandedIds.filter((expanded) => expanded !== purchase.id);
    }
  }
}
