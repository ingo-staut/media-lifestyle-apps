import { MediaEnum } from "./enum/media.enum";
import { NotificationStyleType } from "./enum/notification-style.enum";

export type NotificationAction = {
  name: string;
  icon?: string;
};

export type ActionOpen = {
  type?: MediaEnum;
  id: string;
};

export type NotificationTemplate = {
  message: string;
  messageReplace?: any;
  icon?: string;
  additionalMessage?: string;
  style: NotificationStyleType;
  action?: NotificationAction;
  actionCancel?: boolean;
  duration?: number;
  extraImage?: string;
  actionOpen?: ActionOpen;
};
