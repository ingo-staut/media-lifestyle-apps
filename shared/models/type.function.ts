import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
// ! TODO: Lösung dafür finden!
import { getAllSearchTerms } from "../../projects/recipes/src/utils/translation";
import { QuickAddDropdownFilterFromSearch } from "./search-filter.type";

export function getShortName(name: string): string {
  const slashIndex = name.indexOf(" / ");
  if (slashIndex === -1) {
    return name;
  }
  return name.substring(0, slashIndex);
}

/**
 * Finden eines Eintrags in der Gruppe
 * @param type Type, zu dem Eintrag gefunden wird
 * @param groups Gruppe von Einträgen, in denen gesucht wird
 * @returns Gefundenen Eintrag
 */
export function findByType<EntryType>(
  type: EntryType,
  groups: ReadonlyArray<Group<EntryType>>,
  noneText: string,
  noText?: string,
  noneIcon?: string,
  noIcon?: string
): Entry<EntryType> {
  if (typeof type === "number") {
    if (type === 0)
      return {
        name: noneText,
        type: 0 as EntryType,
        icon: noneIcon ?? "none",
      };

    if (type === -1)
      return {
        name: noText ?? noneText,
        type: -1 as EntryType,
        icon: noIcon ?? "no",
      };

    return (
      groups
        .find((group) => group.entries.find((entry) => entry.type === type))
        ?.entries.find((entry) => entry.type === type) ?? {
        name: "Typ nicht gefunden: " + type,
        type: 0 as EntryType,
        icon: noneIcon ?? "none",
      }
    );
  } else if (typeof type === "string") {
    if (type === "none")
      return {
        name: noneText,
        type: "none" as EntryType,
        icon: noneIcon ?? "none",
      };

    if (type === "no")
      return {
        name: noText ?? noneText,
        type: "no" as EntryType,
        icon: noIcon ?? "no",
      };

    return (
      groups
        .find((group) => group.entries.find((entry) => entry.type === type))
        ?.entries.find((entry) => entry.type === type) ?? {
        name: "Typ nicht gefunden: " + type,
        type: "none" as EntryType,
        icon: noneIcon ?? "none",
      }
    );
  }

  return (
    groups
      .find((group) => group.entries.find((entry) => entry.type === type))
      ?.entries.find((entry) => entry.type === type) ?? {
      name: "Komplett falsch! Typ nicht gefunden: " + type,
      type: 0 as EntryType,
      icon: "none",
    }
  );
}

export function findByTypes<EntryType>(
  types: EntryType[],
  groups: ReadonlyArray<Group<EntryType>>,
  noneText: string,
  noText?: string,
  noneIcon?: string,
  noIcon?: string
): Entry<EntryType>[] {
  return types.map((type) =>
    findByType(type, groups, noneText, noText ?? noneText, noneIcon, noIcon)
  );
}

/**
 * @param text Suchtext
 * @param groups ReadonlyArray des Typs (z.B.: `CATEGORIES`)
 * @returns
 */
export function findByText<EntryType>(
  text: string,
  groups: ReadonlyArray<Group<EntryType>>
): Entry<EntryType> {
  const entries = groups.flatMap((group) => group.entries);
  let match = entries.find((entry) => {
    return getAllSearchTerms(entry.name)
      .concat(entry.additionalSearchTerms ?? [])
      .some((translation) => text.toLowerCase() === translation.toLowerCase());
  });

  let matchWeight = match ? 10 : 0;

  if (!match) {
    match = entries.find((entry) => {
      return getAllSearchTerms(entry.name)
        .concat(entry.additionalSearchTerms ?? [])
        .some((translation) => text.toLowerCase().includes(translation.toLowerCase()));
    });

    matchWeight = match ? 5 : 0;
  }

  if (match) {
    match.matchWeight = matchWeight;
    return match;
  }

  return {
    name: `Text not found: ${text}`,
    type: 0 as EntryType,
    icon: "none",
  };
}

export const getQuickAddDropdownMultipleSelectFilterFromSearch = <EntryType>(
  groups: ReadonlyArray<Group<EntryType>>,
  key: string
) => {
  return groups.map((group) => {
    const data: QuickAddDropdownFilterFromSearch<EntryType> = {
      text: group.name,
      icon: group.icon ?? "",
      searchTerms: getAllSearchTerms(group.name).concat(group.additionalSearchTerms ?? []) ?? [],
      key,
      types: group.entries.map((entry) => entry.type).filter((type): type is EntryType => !!type),
    };

    return data;
  });
};

export const getQuickAddDropdownOnlyEntriesFilterFromSearch = <EntryType>(
  groups: ReadonlyArray<Group<EntryType>>,
  key: string
) => {
  return groups
    .map((group) => {
      return group.entries.map((entry) => {
        return {
          text: entry.name,
          icon: entry.icon,
          searchTerms:
            getAllSearchTerms(entry.name).concat(entry.additionalSearchTerms ?? []) ?? [],
          key,
          types: [entry.type],
          negation: entry.negation,
        } as QuickAddDropdownFilterFromSearch<EntryType>;
      });
    })
    .flat();
};

export function findGroupByEntryType<EntryType>(
  categories: ReadonlyArray<Group<EntryType>>,
  entryType: EntryType
): Group<EntryType> | null {
  for (const group of categories) {
    for (const entry of group.entries) {
      if (entry.type === entryType) {
        return group;
      }
    }
  }
  return null; // Entry type not found
}
