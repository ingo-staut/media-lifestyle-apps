import _ from "lodash";
import isEqual from "lodash.isequal";

export function isArrayEqual(value: any[], other: any[]) {
  return _(value).xorWith(other, isEqual).isEmpty();
}
