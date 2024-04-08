import { AVAILABLE_STATUS } from "../data/available.data";
import { AvailableType } from "./enum/available.enum";

export type Available = {
  type: AvailableType;
  text: string;
  icon: string;
};

export function available(available: number): Available {
  if (available < 0) return AVAILABLE_STATUS.AVAILABLE_UNDEFINED;
  else if (available > 0 && available < 1) return AVAILABLE_STATUS.AVAILABLE_HALF;
  else if (available >= 1) return AVAILABLE_STATUS.AVAILABLE;
  else return AVAILABLE_STATUS.AVAILABLE_NOT;
}
