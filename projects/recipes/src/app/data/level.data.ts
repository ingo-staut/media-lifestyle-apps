import { DropdownData } from "shared/models/dropdown.type";

// !WARNING: Dieser Typ ist ein Duplikat
// !Nicht verwenden
enum _LevelType {
  LEVEL_NONE = "NONE",
  LEVEL_SL = "SL",
  LEVEL_1 = "LEVEL_1",
  LEVEL_2 = "LEVEL_2",
  LEVEL_3 = "LEVEL_3",
  LEVEL_4 = "LEVEL_4",
  LEVEL_5 = "LEVEL_5",
  LEVEL_6 = "LEVEL_6",
  LEVEL_7 = "LEVEL_7",
  LEVEL_8 = "LEVEL_8",
  LEVEL_9 = "LEVEL_9",
  LEVEL_10 = "LEVEL_10",
}

export const LEVELS: DropdownData<_LevelType, string>[] = [
  { name: "LEVEL_NONE", key: _LevelType.LEVEL_NONE, icon: "level-none" },
  { name: "SL", key: _LevelType.LEVEL_SL, icon: "level-sl" },
  { name: "1", key: _LevelType.LEVEL_1, icon: "level-low" },
  { name: "2", key: _LevelType.LEVEL_2, icon: "level-low" },
  { name: "3", key: _LevelType.LEVEL_3, icon: "level-low" },
  { name: "4", key: _LevelType.LEVEL_4, icon: "level-medium" },
  { name: "5", key: _LevelType.LEVEL_5, icon: "level-medium" },
  { name: "6", key: _LevelType.LEVEL_6, icon: "level-medium" },
  { name: "7", key: _LevelType.LEVEL_7, icon: "level-medium" },
  { name: "8", key: _LevelType.LEVEL_8, icon: "level-high" },
  { name: "9", key: _LevelType.LEVEL_9, icon: "level-high" },
  { name: "10", key: _LevelType.LEVEL_10, icon: "level-high" },
];
