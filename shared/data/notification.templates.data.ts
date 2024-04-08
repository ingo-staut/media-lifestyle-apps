import { NotificationStyleType } from "shared/models/enum/notification-style.enum";
import { NotificationTemplateType } from "shared/models/enum/notification.template.enum";
import { NotificationTemplate } from "shared/models/notification.template.type";

export const NOTIFICATON_TEMPLATES: Record<NotificationTemplateType, NotificationTemplate> = {
  SAVED_TO_CLIPBOARD: {
    message: "NOTIFICATION.SAVED_TO_CLIPBOARD",
    style: NotificationStyleType.INFO,
    icon: "clipboard",
  },
  URL_SAVED_TO_CLIPBOARD: {
    message: "NOTIFICATION.URL_SAVED_TO_CLIPBOARD_VALUE",
    style: NotificationStyleType.INFO,
    icon: "clipboard",
  },
  SAVING_SUCCESS: {
    message: "NOTIFICATION.SAVING_SUCCESS_VALUE",
    style: NotificationStyleType.SUCCESS,
  },
  DELETE_SUCCESS: {
    message: "NOTIFICATION.DELETE_SUCCESS_VALUE",
    style: NotificationStyleType.SUCCESS,
    action: { name: "NOTIFICATION.ACTION.UNDO", icon: "reset" },
    duration: 5,
    icon: "delete",
  },
  SAVING_ERROR: {
    message: "NOTIFICATION.SAVING_ERROR",
    style: NotificationStyleType.ERROR,
    action: { name: "", icon: "clear" },
  },
  DELETE_ERROR: {
    message: "NOTIFICATION.DELETE_ERROR",
    style: NotificationStyleType.ERROR,
    action: { name: "", icon: "clear" },
  },
  DELETE_ALL_ENTRIES: {
    message: "NOTIFICATION.DELETE_ALL_ENTRIES",
    style: NotificationStyleType.INFO,
    action: { name: "NOTIFICATION.ACTION.UNDO", icon: "reset" },
    duration: 5,
    icon: "delete",
  },
  RECIPE_WAS_CHANGED: {
    message: "NOTIFICATION.RECIPE_WAS_CHANGED",
    style: NotificationStyleType.INFO,
    action: { name: "NOTIFICATION.ACTION.LOAD_NEW_DATA", icon: "reload" },
    duration: 5,
    icon: "recipe",
  },
  RECIPE_NOT_FOUND: {
    message: "NOTIFICATION.RECIPE_NOT_FOUND",
    style: NotificationStyleType.WARNING,
    icon: "recipe",
  },
  RECIPE_ALREADY_LINKED: {
    message: "NOTIFICATION.RECIPE_ALREADY_LINKED",
    style: NotificationStyleType.WARNING,
    icon: "link",
  },
  MEDIA_WAS_CHANGED: {
    message: "NOTIFICATION.MEDIA_WAS_CHANGED",
    style: NotificationStyleType.INFO,
    action: { name: "NOTIFICATION.ACTION.LOAD_NEW_DATA", icon: "reload" },
    duration: 5,
    icon: "media",
  },
  MEDIA_NOT_FOUND: {
    message: "NOTIFICATION.MEDIA_NOT_FOUND",
    style: NotificationStyleType.WARNING,
    icon: "media",
  },
  MEDIA_ALREADY_LINKED: {
    message: "NOTIFICATION.MEDIA_ALREADY_LINKED",
    style: NotificationStyleType.WARNING,
    icon: "link",
  },
  MEDIA_ALREADY_EXISTS_VALUE: {
    message: "NOTIFICATION.MEDIA_ALREADY_EXISTS_VALUE",
    style: NotificationStyleType.WARNING,
    action: { name: "MEDIA.OPEN", icon: "open" },
    actionCancel: true,
    icon: "error",
  },
  NO_BACK_LOCATION_FOUND: {
    message: "NOTIFICATION.NO_BACK_LOCATION_FOUND",
    style: NotificationStyleType.INFO,
    icon: "arrow-left",
  },
  VERSION_READY: {
    message: "NOTIFICATION.VERSION_READY",
    style: NotificationStyleType.INFO,
    action: { name: "NOTIFICATION.ACTION.RELOAD", icon: "reload" },
    icon: "settings",
  },
  TEST_CLOSEABLE: {
    message: "Test message",
    style: NotificationStyleType.INFO,
    action: { name: "", icon: "clear" },
  },
  TEST_DURATION: {
    message: "Test message with duration 5s",
    style: NotificationStyleType.INFO,
    duration: 5,
  },
  QUICKADD_NOTHING_FOUND: {
    message: "NOTIFICATION.QUICKADD_NOTHING_FOUND",
    style: NotificationStyleType.WARNING,
  },
  NO_URL_FOUND: {
    message: "NOTIFICATION.NO_URL_FOUND",
    style: NotificationStyleType.ERROR,
    icon: "url",
  },
  INGREDIENTS_OF_RECIPES_NOT_REMOVED: {
    message: "NOTIFICATION.INGREDIENTS_OF_RECIPES_NOT_REMOVED",
    style: NotificationStyleType.INFO,
    action: { name: "RECIPE.REMOVE_ALL", icon: "delete" },
    icon: "recipe",
    duration: 5,
  },
  INGREDIENT_IS_ALREADY_AVAILABLE: {
    message: "NOTIFICATION.INGREDIENT_IS_ALREADY_AVAILABLE",
    style: NotificationStyleType.INFO,
    action: { name: "AVAILABLE.INGREDIENT_DELETE", icon: "delete" },
    actionCancel: true,
    icon: "available",
    duration: 5,
  },
  INGREDIENT_IS_ALREADY_AVAILABLE_EXACT_WAS_REPLACED: {
    message: "NOTIFICATION.INGREDIENT_IS_ALREADY_AVAILABLE_EXACT_WAS_REPLACED",
    style: NotificationStyleType.INFO,
    actionCancel: true,
    icon: "available",
  },
  INGREDIENT_IS_ALREADY_AVAILABLE_ADD_ANYWAYS: {
    message: "NOTIFICATION.INGREDIENT_IS_ALREADY_AVAILABLE_ADD_ANYWAYS",
    style: NotificationStyleType.INFO,
    action: { name: "AVAILABLE.INGREDIENTS_ADD", icon: "add" },
    actionCancel: true,
    icon: "available",
    duration: 5,
  },
  SAVING_NOT_ALLOWED: {
    message: "NOTIFICATION.SAVING_NOT_ALLOWED_WITH_VALUE",
    style: NotificationStyleType.WARNING,
    icon: "recipe",
    duration: 5,
  },
  SAVING_NOT_NEEDED: {
    message: "NOTIFICATION.SAVING_NOT_NEEDED_WITH_VALUE",
    style: NotificationStyleType.INFO,
    icon: "recipe",
  },
  CAN_NOT_EDIT_VALUE: {
    message: "NOTIFICATION.CAN_NOT_EDIT_VALUE",
    style: NotificationStyleType.WARNING,
    icon: "edit",
  },
  TIME_EXISTS_ALREADY: {
    message: "NOTIFICATION.TIME_EXISTS_ALREADY",
    style: NotificationStyleType.WARNING,
    icon: "time",
  },
  TIME_END_IS_BEFORE_START: {
    message: "NOTIFICATION.TIME_END_IS_BEFORE_START",
    style: NotificationStyleType.WARNING,
    icon: "time",
  },
  TIME_DELETED_FROM_DAYS: {
    message: "NOTIFICATION.TIME_DELETED_FROM_DAYS",
    style: NotificationStyleType.SUCCESS,
    icon: "delete",
  },
  TIME_ADDED_TO_DAYS: {
    message: "NOTIFICATION.TIME_ADDED_TO_DAYS",
    style: NotificationStyleType.SUCCESS,
    icon: "add-to-text",
  },
  NEXT_EPISODE_IN_TELEVISION: {
    message: "EPISODE.NEXT_EPISODE_IN_TELEVISION_VALUE",
    style: NotificationStyleType.SUCCESS,
    icon: "episode-in-television",
    action: { name: "EPISODE.RESET", icon: "reset" },
    duration: 7.5,
  },
  PREVIOUS_EPISODE_IN_TELEVISION: {
    message: "EPISODE.PREVIOUS_EPISODE_IN_TELEVISION_VALUE",
    style: NotificationStyleType.SUCCESS,
    icon: "episode-in-television",
    duration: 5,
  },
  WATCHED_VALUE_DELETE_TELEVISION: {
    message: "NOTIFICATION.WATCHED_VALUE_DELETE_TELEVISION",
    style: NotificationStyleType.SUCCESS,
    icon: "television",
    action: { name: "RESET", icon: "reset" },
    duration: 5,
  },
  WATCHED_VALUE_RESTORED_TELEVISION: {
    message: "NOTIFICATION.WATCHED_VALUE_RESTORED_TELEVISION",
    style: NotificationStyleType.SUCCESS,
    icon: "television",
  },
  SEASON_CONTAINS_EPISODES_WITH_DETAILS: {
    message: "SEASON.CONTAINS_EPISODE_DETAILS_VALUE",
    style: NotificationStyleType.WARNING,
    icon: "special",
    action: { name: "SEASON.DO_NOT_DELETE", icon: "delete-not" },
    duration: 7.5,
  },
  NO_NEXT_EVENT: {
    message: "NOTIFICATION.NO_EVENTS_SEASON_END",
    style: NotificationStyleType.SUCCESS,
    icon: "calendar-not",
    action: { name: "RESET", icon: "reset" },
    duration: 5,
  },
  MEDIA_TYPE_NOT_SAME: {
    message: "NOTIFICATION.MEDIA_TYPE_NOT_SAME",
    style: NotificationStyleType.WARNING,
    icon: "series",
    duration: 5,
  },
  READ_NEWS: {
    message: "NEWS.MARKED_READ",
    style: NotificationStyleType.SUCCESS,
    icon: "news",
    duration: 5,
    action: { name: "READ.NOT", icon: "hide" },
  },
  HIDE_TERMS_NEWS: {
    message: "NEWS.HIDE_TERMS_VALUE",
    style: NotificationStyleType.SUCCESS,
    icon: "hide",
    duration: 5,
    action: { name: "SHOW", icon: "show" },
  },
  FAVORITE_REMOVED: {
    message: "FAVORITE.REMOVED",
    style: NotificationStyleType.INFO,
    icon: "favorite-not",
    duration: 7.5,
    action: { name: "FAVORITE.ADD", icon: "favorite-filled" },
  },
};