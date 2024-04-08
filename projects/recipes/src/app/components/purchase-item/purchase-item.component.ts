import { Component, Inject, Input, OnInit } from "@angular/core";
import { DateAdapter, MAT_DATE_LOCALE } from "@angular/material/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { cloneDeep } from "lodash";
import { startWith } from "rxjs";
import { CompleterEntry } from "shared/models/completer-entry.type";
import { FormfieldType } from "shared/models/enum/formfield.enum";
import { LocaleService } from "shared/services/locale.service";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { ItemType } from "../../models/enum/item.enum";
import { IngredientConversion } from "../../models/ingredient-conversion.class";
import { Item } from "../../models/item.class";
import { Purchase } from "../../models/purchase.class";
import { Store } from "../../models/store.type";
import { IngredientConversionCompleterService } from "../../services/ingredient/ingredient-conversion.completer.service";
import { IngredientConversionDialogsService } from "../../services/ingredient/ingredient-conversion.dialogs.service";
import { IngredientApiService } from "../../services/ingredient/ingredient.api.service";
import { PurchaseDialogsService } from "../../services/purchase/purchase.dialogs.service";
import { StoreApiService } from "../../services/store/store.api.service";
import { StoreService } from "../../services/store/store.service";

@Component({
  selector: "app-purchase-item",
  templateUrl: "./purchase-item.component.html",
  styleUrls: ["./purchase-item.component.scss"],
})
export class PurchaseItemComponent implements OnInit {
  @Input() purchase: Purchase;
  @Input() blinking: boolean = false;
  @Input() itemType?: ItemType | null;
  @Input() ingredientsConversion?: IngredientConversion[] | null;
  @Input() completerListStores?: string[] | CompleterEntry[] | null;
  @Input() completerListItems?: string[] | CompleterEntry[] | null;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  FormfieldType = FormfieldType;
  ingredientsConversion$ = this.ingredientApiService.ingredientsConversion$;

  constructor(
    private adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private locale: string,
    protected translateService: TranslateService,
    protected storeApiService: StoreApiService,
    protected ingredientApiService: IngredientApiService,
    protected ingredientConversionCompleterService: IngredientConversionCompleterService,
    protected localeService: LocaleService,
    private storeService: StoreService,
    private purchaseDialogsService: PurchaseDialogsService,
    private ingredientConversionDialogsService: IngredientConversionDialogsService
  ) {}

  ngOnInit(): void {
    // Für später, wenn Settings
    // aus dem Rezepte-Dialog heraus geöffnet wird
    this.translateService.onLangChange
      .pipe(startWith({ lang: this.translateService.currentLang } as LangChangeEvent))
      .subscribe((e) => {
        this.locale = e.lang;
        this.adapter.setLocale(e.lang);
      });
  }

  onEdit(event: Event): void {
    event.stopPropagation();

    this.purchaseDialogsService
      .openAddOrEditPurchaseDialog({
        purchase: cloneDeep(this.purchase),
        ingredientsConversion: this.ingredientsConversion,
        completerListStores: this.completerListStores,
        completerList: this.completerListItems,
      })
      .subscribe();
  }

  onAddIngredientToConversion(item: Item): void {
    this.ingredientConversionDialogsService.openAddIngredientConversionDialog(
      item.name,
      this.itemType ?? ItemType.FOOD
    );
  }

  onEditOrAddStore(event: Event, store: Store, add?: boolean): void {
    event.stopPropagation();
    event.preventDefault();

    this.storeService.openAddOrEditDialog(store, add);
  }
}
