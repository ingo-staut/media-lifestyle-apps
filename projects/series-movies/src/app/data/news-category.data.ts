import { rx_wordBeginning, rx_wordEndnding } from "shared/utils/regexp";
import { escapeRegExp } from "shared/utils/string";
import { NewsCategoryType } from "../models/enum/news-category.enum";
import { NewsCategory } from "../models/news-category.type";

/**
 * ! Reihenfolge wie in News-Komponente `dataList`
 */
export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    name: "HIDE",
    type: NewsCategoryType.HIDE,
    terms: ["aeos", "zahlenzentrale", "sportsupdate", "quoten", "us-quoten"],
    icon: "",
  },
  {
    name: "NEWS.MEDIA",
    type: NewsCategoryType.MEDIA,
    terms: [],
    icon: "news",
  },
  {
    name: "NEW_THIS_WEEK",
    type: NewsCategoryType.NEW_THIS_WEEK,
    terms: ["rundfunkrat"],
    icon: "season-new",
  },
  {
    name: "URL.TYPE.CRITIC_REVIEW",
    type: NewsCategoryType.CRITIC_REVIEW,
    terms: ["meinungen", "kritik", "review"],
    icon: "critic-review",
  },
  {
    name: "REPORTAGE_MAGAZINE",
    type: NewsCategoryType.REPORTAGE_MAGAZINE,
    terms: ["reportagen", "magazin", "telegeschichten", "interviews", "nahaufnahme"],
    icon: "genre-talkshow",
  },
  // {
  //   name: "STREAM.",
  //   type: NewsCategoryType.STREAMING,
  //   terms: ["dvd & blu-ray", "neu bei", "im stream", "heute bei", "heute abend bei"],
  //   icon: "stream",
  // },

  {
    name: "NEWS.S",
    type: NewsCategoryType.NEWS,
    terms: ["nachrichten", "serien im tv"],
    icon: "news",
  },
  {
    name: "INTERNATIONAL.",
    type: NewsCategoryType.INTERNATIONAL,
    terms: ["ukupdate", "austriaupdate"],
    icon: "globe",
  },
  {
    name: "URL.TYPE.TRAILER",
    type: NewsCategoryType.VIDEOS_TRAILER,
    terms: ["videos", "trailer", "teaser"],
    icon: "trailer",
  },
  {
    name: "CINEMA.IN",
    type: NewsCategoryType.CINEMA,
    terms: ["im kino"],
    icon: "cinema",
  },
  {
    name: "START_OF_SERIES",
    type: NewsCategoryType.START_OF_SERIES,
    terms: [
      "serienstart",
      "serienstarts",
      "starttermin",
      "startet im",
      "serienpremiere",
      "zeigt ab",
    ],
    icon: "season-new",
  },
  {
    name: "START_OF_SEASON",
    type: NewsCategoryType.START_OF_SEASON,
    terms: ["start der"],
    icon: "season-new",
  },
  {
    name: "TELEVISION.",
    type: NewsCategoryType.TELEVISION,
    terms: [
      "tv-tipps",
      "im tv",
      "im free-tv",
      "heute im fernsehen",
      "serien im tv",
      "free-tv-premiere",
    ],
    icon: "television",
  },
  {
    name: "FUTURE.IN",
    type: NewsCategoryType.FUTURE,
    terms: ["in produktion", "kommende serien", "wann kommt"],
    icon: "calendar-future",
  },
  {
    name: "LIST.S",
    type: NewsCategoryType.LISTS,
    terms: [],
    icon: "details",
  },
];

export const NEWS_CATEGORIES_TO_DISPLAY = NEWS_CATEGORIES.slice(1);

export function findNewsCategoryByText(text: string): NewsCategoryType {
  if (!text) return NewsCategoryType.NEWS;

  return (
    NEWS_CATEGORIES.find((c) => c.terms.includes(text.trim().toLowerCase()))?.type ??
    NewsCategoryType.NEWS
  );
}

export function findNewsCategoryByLongText(text: string): NewsCategoryType {
  if (!text) return NewsCategoryType.NEWS;

  return (
    NEWS_CATEGORIES.filter((c) => c.terms.length).find((c) => {
      const termsEscaped = c.terms.map((term) => escapeRegExp(term)).join("|");
      const regex = RegExp(`${rx_wordBeginning}(${termsEscaped})${rx_wordEndnding}`, "i");
      return !!text.match(regex);
    })?.type ?? NewsCategoryType.NEWS
  );
}

export function newsCategoryById(id: NewsCategoryType): NewsCategory {
  return NEWS_CATEGORIES.find((c) => c.type === id)!;
}

export function newsCategoryIconById(id: NewsCategoryType): string {
  return NEWS_CATEGORIES.find((c) => c.type === id)!.icon;
}
