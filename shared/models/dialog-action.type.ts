import { ButtonIconDirective } from "../directives/button-icon.directive";

export type DialogAction = {
  /**
   * Wenn kein `key` gesetzt wird, dann wird der `text` als `key` verwendet.
   */
  key: string;
  text: string;
  subText?: string;
  subImage?: string;
  icon: string;
  color?: string;
  autoFocus?: boolean;
  buttonIconDirective?: ButtonIconDirective;
  value?: string;
};
