import { isEmpty } from "lodash";

export function isValue(value: any): boolean {
  if (value === null) return false;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return !!value;
  } else if (Array.isArray(value)) {
    return !!value.length;
  } else if (typeof value === "undefined") {
    return false;
  }
  return isEmpty(value);
}

export function tranformParamValueToType(param: string) {
  if (param === "no" || param === "none") return param;
  return param.toUpperCase().replaceAll("-", "_");
}

export function transformTypeToParamValue(type: string) {
  return type.toLowerCase().replaceAll("_", "-");
}
