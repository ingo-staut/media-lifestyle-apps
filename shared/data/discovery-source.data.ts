import { CompleterEntry } from "shared/models/completer-entry.type";
import { DropdownData } from "shared/models/dropdown.type";
import { DiscoverySource } from "shared/models/enum/discovery-source.enum";
import { joinTextWithComma } from "shared/utils/string";

export const DISCOVERY_SOURCES: DropdownData<DiscoverySource, string>[] = [
  {
    key: DiscoverySource.REDDIT,
    name: "Reddit",
    icon: "reddit",
    alternativeSearchTerms: [DiscoverySource.REDDIT, "reddit"],
  },
  {
    key: DiscoverySource.GOOGLE,
    name: "Google",
    icon: "google",
    alternativeSearchTerms: [DiscoverySource.GOOGLE],
  },
  {
    key: DiscoverySource.YOUTUBE,
    name: "Youtube",
    icon: "youtube",
    alternativeSearchTerms: [DiscoverySource.YOUTUBE],
  },
  {
    key: DiscoverySource.CSB,
    name: "Cinema Strikes Back",
    icon: "csb",
    alternativeSearchTerms: [DiscoverySource.CSB, "csb", "cinema strikes back"],
  },
  {
    key: DiscoverySource.KINO_PLUS,
    name: "Kino+",
    icon: "kino-plus",
    alternativeSearchTerms: [DiscoverySource.KINO_PLUS, "kino+", "kino plus"],
  },
  {
    key: DiscoverySource.DWDL,
    name: "DWDL",
    icon: "dwdl",
    alternativeSearchTerms: [DiscoverySource.DWDL],
  },
  {
    key: DiscoverySource.TASTE_IO,
    name: "taste.io",
    icon: "taste-io",
    alternativeSearchTerms: [DiscoverySource.TASTE_IO, "taste.io"],
  },
  {
    key: DiscoverySource.TIKTOK,
    name: "TikTok",
    icon: "tiktok",
    alternativeSearchTerms: [DiscoverySource.TIKTOK],
  },
  {
    key: DiscoverySource.FILMPALAVER,
    name: "Filmpalaver",
    icon: "filmpalaver",
    alternativeSearchTerms: [DiscoverySource.FILMPALAVER, "filmpalaver"],
  },
  {
    key: DiscoverySource.FRED_CARPET,
    name: "FredCarpet",
    icon: "fred-carpet",
    alternativeSearchTerms: [DiscoverySource.FRED_CARPET, "fred carpet", "fredcarpet"],
  },
  {
    key: DiscoverySource.DLF_KULTUR,
    name: "DLF Kultur",
    icon: "dlf-kultur",
    alternativeSearchTerms: [DiscoverySource.DLF_KULTUR, "dlf kultur", "dlfkultur"],
  },
];

export const SOURCES_COMPLETER_ENTRIES = DISCOVERY_SOURCES.map((source) => {
  const sourceEntry: CompleterEntry = {
    text: source.name,
    alternativeNames: source.alternativeSearchTerms,
    icons: [source.icon],
  };

  return sourceEntry;
});

export function getSourceByKey(key: DiscoverySource) {
  return DISCOVERY_SOURCES.find((data) => data.key === key);
}

export function getSourceIconByKey(key: DiscoverySource, iconForNone: boolean): string | null {
  if (!iconForNone && key === undefined) return null;

  return getSourceByKey(key)?.icon ?? null;
}

export function findSourceByText(text: string): DropdownData<DiscoverySource, string> | null {
  return (
    DISCOVERY_SOURCES.find((data) => data.alternativeSearchTerms?.includes(text.toLowerCase())) ??
    null
  );
}

export function findSourceKeyByText(text: string, textIfNotFound: boolean): string {
  return (
    DISCOVERY_SOURCES.find((data) => data.alternativeSearchTerms?.includes(text.toLowerCase()))
      ?.key ?? (textIfNotFound ? text : "")
  );
}

export function getAllSourceIconAndTooltips(
  sources: string[],
  andText: string,
  textIfNotFound = true
) {
  const icons = sources
    .map((source) => findSourceByText(source)?.icon ?? "")
    .filter((icon) => !!icon);

  const tooltip =
    sources.length === 0
      ? textIfNotFound
        ? "DISCOVERY_SOURCE.NOT"
        : ""
      : joinTextWithComma(
          sources
            .map((source) => findSourceByText(source)?.name ?? source)
            .filter((name) => !!name),
          andText
        );

  const moreCount = sources.length - icons.length;
  return { icons, tooltip, moreCount };
}
