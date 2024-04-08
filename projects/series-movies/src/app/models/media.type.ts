import { MediaEnum } from "../../../../../shared/models/enum/media.enum";
import { DEFAULT_KEY } from "./filter-select.type";

export type MediaType = {
  type: MediaEnum | typeof DEFAULT_KEY;
  icon: string;
  name: string;
  color: string;
  colorHEX: string;
};
