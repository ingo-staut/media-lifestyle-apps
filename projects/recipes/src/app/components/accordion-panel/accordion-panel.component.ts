import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { MatExpansionPanel } from "@angular/material/expansion";
import { MatMenuTrigger } from "@angular/material/menu";
import { Action } from "shared/models/action.type";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { Tab } from "../../../../../../shared/models/tab.type";
import { MenuBottomSheetService } from "../../bottom-sheets/menu-bottom-sheet/menu-bottom-sheet.service";
import { MENU_ACCORDION } from "../../data/menu-accordion.data";

@Component({
  selector: "app-accordion-panel",
  templateUrl: "./accordion-panel.component.html",
  styleUrls: ["./accordion-panel.component.scss"],
})
export class AccordionPanelComponent implements AfterViewInit {
  @Input() initiallyExpanded: boolean = true;
  @Input() amount: number = 0;
  @Input() name: string;
  @Input() note: string;
  @Input() icon: string;
  @Input() tabs: Tab[] = [];
  @Input() selectedTabIndex: number = 0;
  @Input() withBackground = false;
  @Input() actions?: Action[];
  @Input() withDragHandle = false;
  @Input() blinking = false;
  @Input() optional = false;

  @Output() accordionChange = new EventEmitter<boolean>();
  @Output() actionClicked = new EventEmitter<string>();
  @Output() selectedTabIndexChange = new EventEmitter<number>();

  @ViewChild(MatExpansionPanel) accordion: MatExpansionPanel;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  @ViewChild(MatExpansionPanel) panel: MatExpansionPanel;

  MENU_ACCORDION = MENU_ACCORDION;
  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;

  contextMenuPosition = { x: "0px", y: "0px" };

  afterViewInit = false;

  filterActionFunction = (action: Action) => {
    const expanded = this.panel ? this.panel.expanded : false;
    return (
      !action.hide &&
      (!(action.hideIfCollapsed && !expanded) || !action.hideIfCollapsed) &&
      (!(action.hideIfExpanded && expanded) || !action.hideIfExpanded)
    );
  };

  constructor(private menuBottomSheetService: MenuBottomSheetService) {}

  // ngOnInit(): void {
  //   this.afterViewInit = !this.afterViewInit;
  // }

  ngAfterViewInit(): void {
    this.afterViewInit = true;
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    if (this.isSmallScreen.matches) {
      this.menuBottomSheetService.open(MENU_ACCORDION).subscribe((result) => {
        if (result) {
          this.accordionChange.emit(result.value);
        }
      });
      return;
    }

    this.contextMenuPosition.x = event.offsetX + "px";
    this.contextMenuPosition.y = event.offsetY + "px";
    this.contextMenu.menu!.focusFirstItem("mouse");
    this.contextMenu.openMenu();
  }

  stopPropagation(event: any): void {
    event.stopPropagation();
  }

  onButtonClick(event: Event, id: string, stopPropagation: boolean) {
    if (stopPropagation) event.stopPropagation();

    this.actionClicked.emit(id);
  }

  onDragStarted(): void {
    this.accordion.close();
  }

  onTabChange(event: any): void {
    this.selectedTabIndexChange.emit(event.index);
  }
}
