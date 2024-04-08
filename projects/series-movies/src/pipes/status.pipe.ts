import { Pipe, PipeTransform } from "@angular/core";
import { findStatusByType } from "../app/data/status.data";
import { StatusType } from "../app/models/enum/status.enum";

@Pipe({
  name: "status",
})
export class StatusPipe implements PipeTransform {
  transform(type: StatusType) {
    return findStatusByType(type);
  }
}

@Pipe({
  name: "statusIcon",
})
export class StatusIconPipe implements PipeTransform {
  transform(type: StatusType) {
    return findStatusByType(type)?.icon ?? undefined;
  }
}
