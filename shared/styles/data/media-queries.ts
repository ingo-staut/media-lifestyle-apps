export const MEDIA_QUERY_BIG_SCREEN_PX = 1800; // Großer Bildschirm (3-Spalten-Layout)
export const MEDIA_QUERY_NORMAL_SCREEN_PX = 1200; // Normaler Bildschirm
export const MEDIA_QUERY_MOBILE_SCREEN_PX = 900; // Mobile Ansicht (BottomNavBar, ...)
export const MEDIA_QUERY_SMALL_SCREEN_PX = 600; // Schmaler Bildschirm (1-Spalten-Layout)

export const MEDIA_QUERY_BIG_SCREEN_STRING = `(min-width: ${MEDIA_QUERY_BIG_SCREEN_PX}px)`;
export const MEDIA_QUERY_NORMAL_SCREEN_STRING = `(min-width: ${MEDIA_QUERY_NORMAL_SCREEN_PX}px)`;
export const MEDIA_QUERY_NORMAL_SCREEN_MAX_STRING = `(max-width: ${MEDIA_QUERY_NORMAL_SCREEN_PX}px)`;
export const MEDIA_QUERY_MOBILE_SCREEN_STRING = `(max-width: ${MEDIA_QUERY_MOBILE_SCREEN_PX}px)`;
export const MEDIA_QUERY_SMALL_SCREEN_STRING = `(max-width: ${MEDIA_QUERY_SMALL_SCREEN_PX}px)`;

export const MEDIA_QUERY_BIG_SCREEN = window.matchMedia(MEDIA_QUERY_BIG_SCREEN_STRING);
export const MEDIA_QUERY_NORMAL_SCREEN = window.matchMedia(MEDIA_QUERY_NORMAL_SCREEN_STRING);
export const MEDIA_QUERY_NORMAL_SCREEN_MAX = window.matchMedia(
  MEDIA_QUERY_NORMAL_SCREEN_MAX_STRING
);
export const MEDIA_QUERY_MOBILE_SCREEN = window.matchMedia(MEDIA_QUERY_MOBILE_SCREEN_STRING);
export const MEDIA_QUERY_SMALL_SCREEN = window.matchMedia(MEDIA_QUERY_SMALL_SCREEN_STRING);
