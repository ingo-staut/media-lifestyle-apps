import { Pipe, PipeTransform } from "@angular/core";
import { DropdownData } from "../models/dropdown.type";

@Pipe({
  name: "dropdownDataSelected",
})
export class DropdownDataSelectedPipe implements PipeTransform {
  transform<KeyType, ValueType>(
    value: KeyType,
    data: DropdownData<KeyType, ValueType>[]
  ): DropdownData<KeyType, ValueType> {
    return data.find((data) => data.key === value) ?? data[0];
  }
}

@Pipe({
  name: "dropdownDataSelectedIndex",
})
export class DropdownDataSelectedIndexPipe implements PipeTransform {
  transform<KeyType, ValueType>(value: KeyType, data: DropdownData<KeyType, ValueType>[]): number {
    return data.findIndex((data) => data.key === value) ?? 0;
  }
}
