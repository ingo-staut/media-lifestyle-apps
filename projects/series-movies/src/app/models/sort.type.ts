import { SortKey, SortType } from "./enum/sort.enum";

export type Sort = {
  type: SortType;
  text: string;
  key: SortKey;
  icon: string;
  extraIcon?: string;
  sortDirection?: boolean;
};
