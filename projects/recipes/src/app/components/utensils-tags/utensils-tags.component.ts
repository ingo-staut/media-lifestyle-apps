import { Platform } from "@angular/cdk/platform";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationService } from "shared/services/notification.service";
import { MEDIA_QUERY_MOBILE_SCREEN } from "shared/styles/data/media-queries";
import { UTENSIL_SIZES } from "../../data/utensil-size.data";
import { UtensilObject, findObjectById } from "../../models/utensil-object.class";
import { Utensil } from "../../models/utensil.class";
import { UtensilObjectApiService } from "../../services/utensil-object/utensil-object.api.service";
import { UtensilObjectService } from "../../services/utensil-object/utensil-object.service";
import { UtensilDialogsService } from "../../services/utensil/utensil.dialogs.service";

@Component({
  selector: "app-utensils-tags",
  templateUrl: "./utensils-tags.component.html",
  styleUrls: ["./utensils-tags.component.scss"],
})
export class UtensilsTagsComponent {
  @Input() parentFormGroup: FormGroup = new FormGroup({});
  @Input() tags: Utensil[] = [];
  @Input() utensilObjects: UtensilObject[] | null = [];
  @Input() withPadding: boolean = true;
  @Input() withSpaceForScrollbar: boolean = true;
  @Input() editable: boolean = true;
  @Input() wrap: boolean = false;
  @Input() editInDialog: boolean | null = false;

  @Output() tagsChange = new EventEmitter<Utensil[]>();

  findObjectById = findObjectById;
  UTENSIL_SIZES = UTENSIL_SIZES;

  isMobileScreen = MEDIA_QUERY_MOBILE_SCREEN;
  isMobileDevice = this.platform.ANDROID || this.platform.IOS;

  objects: UtensilObject[] = [];
  addValue = "";

  constructor(
    private platform: Platform,
    private notificationService: NotificationService,
    protected utensilDialogsService: UtensilDialogsService,
    protected utensilObjectApiService: UtensilObjectApiService,
    protected utensilObjectService: UtensilObjectService,
    protected translateService: TranslateService
  ) {}

  edit(tag: Utensil, index: number, event?: Event) {
    event?.preventDefault();

    if (this.editInDialog) {
      this.utensilDialogsService
        .openAddOrEditUtensilDialogWithUtensilsList(this.tags, { utensil: tag, index })
        .subscribe((tags) => {
          this.tags = tags;
          this.tagsChange.emit(this.tags);
        });
    } else {
      this.remove(tag);
      this.addValue = tag.name;
    }
  }

  onOpenAddUtensilDialog() {
    this.utensilDialogsService
      .openAddOrEditUtensilDialogWithUtensilsList(this.tags)
      .subscribe((utensils) => {
        this.tags = utensils;
      });
  }

  add(value: string): void {
    const ingredients = Utensil.parseAll(value);
    if (!ingredients.length) return;
    this.tags = [...ingredients, ...this.tags];
    this.tagsChange.emit(this.tags);
  }

  remove(tag: Utensil): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }

    this.tagsChange.emit(this.tags);
  }

  onRemoveAll() {
    const tagsCopy = this.tags;
    this.tags = [];
    this.tagsChange.emit(this.tags);

    this.notificationService.show(NotificationTemplateType.DELETE_ALL_ENTRIES)?.subscribe(() => {
      this.tags = tagsCopy;
      this.tagsChange.emit(this.tags);
    });
  }
}
