import { THEMES } from "../data/theme.data";

export type Theme = {
  name: string;
  emoji: string;
  icon?: string;
  startDay: number;
  startMonth: number;
  endDay: number;
  endMonth: number;
};

export function getCurrentTheme(today: Date) {
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  return THEMES.find(
    (theme) =>
      // Daten richtig gesetzt
      (theme.startMonth < theme.endMonth ||
        (theme.startMonth === theme.endMonth && theme.startDay <= theme.endDay)) &&
      // Heute im Zeitraum
      (theme.startMonth < todayMonth ||
        (theme.startMonth === todayMonth && theme.startDay <= todayDay)) &&
      (theme.endMonth > todayMonth || (theme.endMonth === todayMonth && theme.endDay >= todayDay))
  );
}
