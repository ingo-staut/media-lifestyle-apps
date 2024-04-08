export enum PreparationHistoryType {
  PREPARED = "PREPARED",
  PLANNED = "PLANNED",
  PREPARE_UNTIL = "PREPARE_UNTIL",
}

export enum PreparationHistoryTimeType {
  MORNING = "MORNING",
  FORNOON = "FORNOON",
  NOON = "NOON",
  AFTERNOON = "AFTERNOON",
  EVENING = "EVENING",
  NIGHT = "NIGHT",
}

export function getPreparationHistoryTimeTypeByIndex(
  typeIndex: number
): PreparationHistoryTimeType {
  if (typeIndex < 0 || typeIndex > 5) console.error("Falscher Index für Zeittyp");
  return Object.values(PreparationHistoryTimeType)[typeIndex];
}
