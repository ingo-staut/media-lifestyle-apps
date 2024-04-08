import { Observable } from "rxjs";
import { DropdownData } from "shared/models/dropdown.type";

export type Tab<DataType = any, SearchKeyType = any> = {
  name: string;
  icon: string;
  data?: Observable<DataType[]>;
  showInSearch?: SearchKeyType;
};

export function transformTabToDropdown(array: Tab[]): DropdownData<number, null>[] {
  return array.map((tab, index) => {
    return {
      key: index,
      name: tab.name,
      icon: tab.icon,
    };
  });
}
