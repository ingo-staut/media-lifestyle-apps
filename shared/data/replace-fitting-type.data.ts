import { DropdownData } from "shared/models/dropdown.type";
import { ReplaceInTitleType } from "shared/models/enum/replace-fitting-type.enum";

export const REPLACE_FITTING_TYPES: DropdownData<ReplaceInTitleType, string>[] = [
  {
    key: ReplaceInTitleType.REPLACE_ONLY_SPACE,
    name: "REPLACE.SPACES_ONLY",
    icon: "replace",
  },
  {
    key: ReplaceInTitleType.REPLACE_ALL,
    name: "REPLACE.ALL",
    icon: "replace",
  },
  {
    key: ReplaceInTitleType.REPLACE_SPACE_AND_LOWERCASE,
    name: "REPLACE.SPACES_AND_LOWERCASE",
    icon: "replace",
  },
];
