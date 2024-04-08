import { Pipe, PipeTransform } from "@angular/core";
import { newsCategoryById, newsCategoryIconById } from "../app/data/news-category.data";
import { newsSourceById } from "../app/data/news-source.data";
import { NewsCategoryType } from "../app/models/enum/news-category.enum";
import { NewsSourceType } from "../app/models/enum/news-source.enum";
import { NewsCategory } from "../app/models/news-category.type";

@Pipe({
  name: "newsCategoryIconById",
})
export class NewsCategoryIconByIdPipe implements PipeTransform {
  transform(id: NewsCategoryType): string {
    return newsCategoryIconById(id);
  }
}

@Pipe({
  name: "newsCategoryById",
})
export class NewsCategoryByIdPipe implements PipeTransform {
  transform(id: NewsCategoryType): NewsCategory {
    return newsCategoryById(id);
  }
}

@Pipe({
  name: "newsSourceById",
})
export class NewsSourceByIdPipe implements PipeTransform {
  transform(id: NewsSourceType) {
    return newsSourceById(id);
  }
}
