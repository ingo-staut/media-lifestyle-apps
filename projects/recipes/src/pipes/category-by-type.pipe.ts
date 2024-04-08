import { Pipe, PipeTransform } from "@angular/core";
import { Entry } from "shared/models/type-entry.type";
import { CategoryType, findCategoryByType } from "../app/models/enum/category.enum";

@Pipe({
  name: "categoryByType",
})
export class CategoryByTypePipe implements PipeTransform {
  transform(type: CategoryType): Entry<CategoryType> {
    return findCategoryByType(type);
  }
}
