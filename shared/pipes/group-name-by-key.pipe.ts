import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "groupNameByKey",
})
export class GroupNameByKeyPipe implements PipeTransform {
  transform(groupKey: string, groupNames: Map<string, string>): string {
    return groupNames.get(groupKey) ?? "";
  }
}
