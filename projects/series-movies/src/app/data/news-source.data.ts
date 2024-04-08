import { NewsSourceType } from "../models/enum/news-source.enum";

export const NEWS_SOURCES = [
  {
    name: "DWDL",
    type: NewsSourceType.DWDL,
    terms: ["dwdl"],
    color: "#339933",
    icon: "dwdl",
    website: "https://www.dwdl.de/",
  },
  {
    name: "DLF Kultur",
    type: NewsSourceType.DLF_KULTUR,
    terms: ["deutschlandfunk kultur"],
    color: "#FF6400",
    icon: "dlf-kultur",
    website: "https://www.deutschlandfunkkultur.de/",
  },
  {
    name: "Filmstarts",
    type: NewsSourceType.FILMSTARTS,
    terms: ["filmstarts"],
    color: "#446eff",
    icon: "filmstarts",
    website: "https://www.filmstarts.de/news/",
  },
  {
    name: "Moviepilot",
    type: NewsSourceType.MOVIEPILOT,
    terms: ["moviepilot"],
    color: "#F4645A",
    icon: "moviepilot",
    website: "https://www.moviepilot.de/news",
  },
  {
    name: "Kino.de",
    type: NewsSourceType.KINO_DE,
    terms: ["kino.de"],
    color: "#039CFD",
    icon: "kino-de",
    website: "https://www.kino.de/news/",
  },
  {
    name: "Serienjunkies",
    type: NewsSourceType.SERIENJUNKIES,
    terms: ["serienjunkies"],
    color: "#0665C6",
    icon: "serienjunkies",
    website: "https://www.serienjunkies.de/news/",
  },
  {
    name: "Collider",
    type: NewsSourceType.COLLIDER,
    terms: ["collider"],
    color: "#4ABF3B",
    icon: "collider",
    website: "https://collider.com/",
  },
];

export function findNewsSourceByText(text: string): NewsSourceType | undefined {
  if (!text) return;

  return NEWS_SOURCES.find((c) => c.terms.includes(text.trim().toLowerCase()))?.type;
}

export function newsSourceById(id: NewsSourceType) {
  return NEWS_SOURCES.find((c) => c.type === id)!;
}

export function newsSourceIconById(id: NewsSourceType): string {
  return NEWS_SOURCES.find((c) => c.type === id)!.icon;
}
