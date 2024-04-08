import { ComponentType } from "@angular/cdk/portal";
import { Injectable } from "@angular/core";
import {
  MatSnackBar,
  MatSnackBarRef,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { Observable, take, tap } from "rxjs";
import { NOTIFICATON_TEMPLATES } from "shared/data/notification.templates.data";
import { NotificationStyleType } from "shared/models/enum/notification-style.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import {
  ActionOpen,
  NotificationAction,
  NotificationTemplate,
} from "shared/models/notification.template.type";
import { MEDIA_QUERY_SMALL_SCREEN } from "shared/styles/data/media-queries";
import { NOTIFICATON_ICONS } from "../data/notification.style-icons.data";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  readonly DURATION_IN_SECONDS = 3;
  readonly MIN_KEYBOARD_HEIGHT_PX = 300;
  component?: ComponentType<unknown> = undefined;

  isSmallScreen = MEDIA_QUERY_SMALL_SCREEN;
  isKeyboardOpen: boolean = false;
  ref: MatSnackBarRef<unknown> | null = null;

  constructor(private snackBar: MatSnackBar, private translateService: TranslateService) {
    window.visualViewport?.addEventListener("resize", this.keyboardListener);
  }

  keyboardListener = () => {
    if (window.visualViewport) {
      this.isKeyboardOpen =
        this.isSmallScreen.matches &&
        window.screen.height - this.MIN_KEYBOARD_HEIGHT_PX > window.visualViewport.height;
    } else {
      this.isKeyboardOpen = false;
    }
  };

  /**
   * Nachricht in Snackbar ausgeben
   * @param type Typ der Nachricht
   * @param messageReplace **🌐i18n** | Im Übersetzungstext sollen Platzhalter `{{ value }}` ersetzt werden
   * @param visibleBottomNavBar Wenn bspw. die Seite erst geladen werden muss, und es eine BottomNavBar geben wird, dann auf `true` setzen
   * @param additionalMessages Zusätzliche Details, z.B. Fehlermeldungen
   * @param extraAction Eine Aktion in der Benachrichtigung. **Beachte:** Es muss eine Zeit im Template oder eine `extraDuration` gesetzt sein
   * @param snackbarPosition Oben `top` oder unten `bottom`; `bottom` ist der Standard-Wert
   * @returns `Observable<void>`, auf das subscribed werden kann,
   * um auf den Klick auf die Snackbar-Aktion zu reagieren
   */
  show(
    type: NotificationTemplateType,
    options?: {
      /**
       * @param messageReplace **🌐i18n** | Im Übersetzungstext sollen Platzhalter `{{ value }}` ersetzt werden
       */
      messageReplace?: any;
      icon?: string;
      extraImage?: string;
      /**
       * @param visibleBottomNavBar Wenn bspw. die Seite erst geladen werden muss, und es eine BottomNavBar geben wird, dann auf `true` setzen
       */
      visibleBottomNavBar?: boolean;
      /**
       * @param additionalMessages Zusätzliche Details, z.B. Fehlermeldungen
       */
      additionalMessages?: string[];
      /**
       * @param extraAction Eine Aktion in der Benachrichtigung.
       * **Beachte:** Es muss eine Zeit im Template oder eine `extraDuration` gesetzt sein
       */
      extraAction?: NotificationAction;
      extraActionOpen?: ActionOpen;
      extraDuration?: number;
      snackbarPosition?: MatSnackBarVerticalPosition;
    }
  ): Observable<void> | undefined {
    if (!this.component) return;

    const {
      messageReplace,
      visibleBottomNavBar,
      additionalMessages,
      icon,
      snackbarPosition,
      extraAction,
      extraDuration,
      extraImage,
      extraActionOpen: actionOpen,
    } = options ?? {};
    const {
      message,
      style,
      action: actionFromTemplate,
      actionCancel,
      duration: durationFromTemplate,
      icon: iconFromTemplate,
    } = NOTIFICATON_TEMPLATES[type];

    this.consoleLog(message, style, additionalMessages, messageReplace);

    const action = actionFromTemplate ?? extraAction;

    const duration = // Automatisch ausblenden, wenn ...
      // ... die Nachricht keinen Button / Aktion hat
      !action ||
      // ... die Nachricht eine bestimmte Dauer hat
      durationFromTemplate
        ? (durationFromTemplate ?? this.DURATION_IN_SECONDS) * 1000
        : extraDuration
        ? extraDuration * 1000
        : undefined;

    const data: NotificationTemplate = {
      message,
      additionalMessage: additionalMessages?.join("; "),
      action,
      actionCancel,
      style,
      duration,
      messageReplace,
      icon: icon ?? iconFromTemplate ?? NOTIFICATON_ICONS[style],
      extraImage,
      actionOpen,
    };

    this.ref = this.snackBar.openFromComponent(this.component, {
      duration,
      data,
      panelClass: this.getPanelClass(style, visibleBottomNavBar),
      verticalPosition: snackbarPosition ?? this.isKeyboardOpen ? "top" : "bottom",
    });

    (navigator as any).setAppBadge(1);

    this.ref
      .afterDismissed()
      .pipe(take(1))
      .subscribe(() => {
        (navigator as any).clearAppBadge();
      });

    return this.ref.onAction().pipe(
      tap(() => this.consoleLog("Action clicked in snackbar!", style)),
      take(1)
    );
  }

  showNotificationText(text: string, style: NotificationStyleType = NotificationStyleType.INFO) {
    const data: NotificationTemplate = {
      message: text,
      action: {
        name: "Ok",
        icon: "check",
      },
      style,
    };

    if (!this.component) return;

    return this.snackBar
      .openFromComponent(this.component, {
        duration: 10 * 1000,
        data,
        panelClass: this.getPanelClass(style),
      })
      .onAction()
      .pipe(
        tap(() => this.consoleLog("Action clicked in snackbar!", style)),
        take(1)
      );
  }

  private getPanelClass(style: string, visibleBottomNavBar?: boolean): string[] {
    const panelClass = [`${style.toLowerCase()}-snackbar`];
    this.setBottomNavBarStyle(panelClass, visibleBottomNavBar);
    return panelClass;
  }

  private setBottomNavBarStyle(panelClass: string[], visibleBottomNavBar?: boolean): void {
    let aboveBottomNavBar = visibleBottomNavBar ?? false;
    const bottomNavBar = document.getElementById("bottom-nav-bar");
    // wenn die bottomnavbar von keinem element verdeckt wird, dann muss die snackbar höher sein
    if (bottomNavBar && !aboveBottomNavBar) {
      const rect = bottomNavBar.getBoundingClientRect();
      const x = rect.left;
      const y = rect.top;
      const topElement = document.elementFromPoint(x, y);
      aboveBottomNavBar = topElement?.classList.contains("bottom-nav-bar") ?? false;
    }

    if (aboveBottomNavBar) panelClass.push("with-bottom-nav-bar");
  }

  /**
   *  Nachricht in Konsole ausgeben
   */
  consoleLog(
    message: string,
    style: NotificationStyleType,
    data?: any,
    messageReplace?: any,
    ...additionalData: any[]
  ): void {
    const consoleMessage = `${style.toUpperCase()}: ${this.translateService.instant(
      message,
      typeof messageReplace === "string"
        ? {
            value: messageReplace ? this.translateService.instant(messageReplace) : messageReplace,
          }
        : messageReplace
    )}`;

    if (style === NotificationStyleType.SUCCESS || style === NotificationStyleType.INFO)
      console.log(consoleMessage, data ?? "", additionalData.length ? additionalData : "");
    else if (style === NotificationStyleType.ERROR)
      console.error(consoleMessage, data ?? "", additionalData.length ? additionalData : "");
    else if (style === NotificationStyleType.WARNING)
      console.warn(consoleMessage, data ?? "", additionalData.length ? additionalData : "");
    else console.log(consoleMessage, data ?? "", additionalData.length ? additionalData : "");
  }
}
