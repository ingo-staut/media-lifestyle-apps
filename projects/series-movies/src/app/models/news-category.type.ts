import { NewsCategoryType } from "./enum/news-category.enum";

export type NewsCategory = {
  name: string;
  type: NewsCategoryType;
  terms: string[];
  icon: string;
};
