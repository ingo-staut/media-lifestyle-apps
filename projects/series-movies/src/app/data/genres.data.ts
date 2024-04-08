import { QuickAddDropdownFilterFromSearch } from "shared/models/search-filter.type";
import { Entry } from "shared/models/type-entry.type";
import { Group } from "shared/models/type-group.type";
import { FilterKey } from "../../../../../shared/models/enum/filter-keys.enum";
import { getAllSearchTerms } from "../../utils/translation";
import { GenreType } from "../models/enum/genre.enum";
import { Genre } from "../models/genre.class";

export const GENRES: Genre[] = [
  {
    id: 1,
    type: GenreType.ADVENTURE,
    name: "GENRE.ADVENTURE",
    color: "#af5a00",
    alternativeNames: [...getAllSearchTerms("GENRE.ADVENTURE"), "adventure"],
    icon: "genre-adventure",
  },
  {
    id: 2,
    type: GenreType.ACTION,
    name: "GENRE.ACTION",
    color: "#b40000",
    alternativeNames: [...getAllSearchTerms("GENRE.ACTION")],
    icon: "genre-action",
  },
  {
    id: 3,
    type: GenreType.ANIMATION,
    name: "GENRE.ANIMATION",
    color: "#d7c116",
    alternativeNames: [...getAllSearchTerms("GENRE.ANIMATION")],
    icon: "genre-animation",
  },
  {
    id: 4,
    type: GenreType.COMEDY,
    name: "GENRE.COMEDY",
    color: "#ffa500",
    alternativeNames: [...getAllSearchTerms("GENRE.COMEDY"), "komödie", "sitcom"],
    icon: "genre-comedy",
  },
  {
    id: 5,
    type: GenreType.CRIME,
    name: "GENRE.CRIME",
    color: "#000087",
    alternativeNames: [...getAllSearchTerms("GENRE.CRIME"), "krimi"],
    icon: "genre-crime",
  },
  {
    id: 6,
    type: GenreType.DOCUMENTARY,
    name: "GENRE.DOCUMENTARY",
    color: "#64af00",
    alternativeNames: [...getAllSearchTerms("GENRE.DOCUMENTARY"), "documentary", "doku"],
    icon: "genre-documentary",
  },
  {
    id: 7,
    type: GenreType.DRAMA,
    name: "GENRE.DRAMA",
    color: "#5f208d",
    alternativeNames: [...getAllSearchTerms("GENRE.DRAMA")],
    icon: "genre-drama",
  },
  {
    id: 8,
    type: GenreType.FANTASY,
    name: "GENRE.FANTASY",
    color: "#b464ff",
    alternativeNames: [...getAllSearchTerms("GENRE.FANTASY")],
    icon: "genre-fantasy",
  },
  {
    id: 9,
    type: GenreType.HORROR,
    name: "GENRE.HORROR",
    color: "#000050",
    alternativeNames: [...getAllSearchTerms("GENRE.HORROR")],
    icon: "genre-horror",
  },
  {
    id: 10,
    type: GenreType.COOKING_SHOW,
    name: "GENRE.COOKING_SHOW",
    color: "#855723",
    alternativeNames: [...getAllSearchTerms("GENRE.COOKING_SHOW"), "backen", "koch", "kochen"],
    icon: "genre-cooking-show",
  },
  {
    id: 11,
    type: GenreType.LGBTQ,
    name: "GENRE.LGBTQ",
    color: "#b9007f",
    alternativeNames: [
      ...getAllSearchTerms("GENRE.LGBTQ"),
      "gay",
      "gays",
      "lgbt",
      "lgbtq+",
      "lgbtqi",
      "lgbtqi+",
      "queer",
      "schwul",
      "lesbian",
      "lesbians",
      "coming out",
      "boys love",
      "bl",
      "yaoi",
      "gay kiss",
      "gay man",
      "homossexual",
      "gay couple",
      "gay relationship",
    ],
    icon: "genre-lgbtq",
  },
  {
    id: 12,
    type: GenreType.ANIME,
    name: "GENRE.ANIME",
    color: "#B98500",
    alternativeNames: ["anime", "manga", "anime animation"],
    icon: "genre-anime",
  },
  {
    id: 13,
    type: GenreType.MYSTERY,
    name: "GENRE.MYSTERY",
    color: "#1e3200",
    alternativeNames: [...getAllSearchTerms("GENRE.MYSTERY")],
    icon: "genre-mystery",
  },
  {
    id: 14,
    type: GenreType.PODCAST,
    name: "GENRE.PODCAST",
    color: "#afc800",
    alternativeNames: [...getAllSearchTerms("GENRE.PODCAST")],
    icon: "genre-podcast",
  },
  {
    id: 15,
    type: GenreType.QUIZ,
    name: "GENRE.QUIZ",
    color: "#ff64ff",
    alternativeNames: [...getAllSearchTerms("GENRE.QUIZ")],
    icon: "genre-quiz",
  },
  {
    id: 16,
    type: GenreType.ROMANCE,
    name: "GENRE.ROMANCE",
    color: "#ff007f",
    alternativeNames: [
      ...getAllSearchTerms("GENRE.ROMANCE"),
      "liebe",
      "liebesfilm",
      "romance",
      "love",
    ],
    icon: "genre-romance",
  },
  {
    id: 17,
    type: GenreType.SCIENCE_FICTION,
    name: "GENRE.SCIENCE_FICTION",
    color: "#008cff",
    alternativeNames: [
      ...getAllSearchTerms("GENRE.SCIENCE_FICTION"),
      "scifi",
      "science fiction",
      "science-fiction",
    ],
    icon: "genre-scifi",
  },
  {
    id: 19,
    type: GenreType.SPORT,
    name: "GENRE.SPORT",
    color: "#327d00",
    alternativeNames: [...getAllSearchTerms("GENRE.SPORT")],
    icon: "genre-sport",
  },
  {
    id: 20,
    type: GenreType.THRILLER,
    name: "GENRE.THRILLER",
    color: "#0078a0",
    alternativeNames: [...getAllSearchTerms("GENRE.THRILLER")],
    icon: "genre-thriller",
  },
  {
    id: 21,
    type: GenreType.TV_SHOW,
    name: "GENRE.TV_SHOW",
    color: "#ff6e00",
    alternativeNames: [...getAllSearchTerms("GENRE.TV_SHOW")],
    icon: "genre-tv-show",
  },
  {
    id: 23,
    type: GenreType.TALKSHOW,
    name: "GENRE.TALKSHOW",
    color: "#00c8ff",
    alternativeNames: [...getAllSearchTerms("GENRE.TALKSHOW"), "talk"],
    icon: "genre-talkshow",
  },
  {
    id: 24,
    type: GenreType.GAMING,
    name: "GENRE.GAMING",
    color: "#7832ff",
    alternativeNames: [...getAllSearchTerms("GENRE.GAMING"), "game", "spiel"],
    icon: "genre-gaming",
  },
  {
    id: 25,
    type: GenreType.TEENIE,
    name: "GENRE.TEENIE",
    color: "#ff009b",
    alternativeNames: [...getAllSearchTerms("GENRE.TEENIE"), "jugendlich", "young adult"],
    icon: "genre-teenie",
  },
  {
    id: 27,
    type: GenreType.POLITICS,
    name: "GENRE.POLITICS",
    color: "#9696ff",
    alternativeNames: [...getAllSearchTerms("GENRE.POLITICS"), "politic"],
    icon: "genre-politics",
  },
  {
    id: 28,
    type: GenreType.NEWS,
    name: "GENRE.NEWS",
    color: "#5500ff",
    alternativeNames: [...getAllSearchTerms("GENRE.NEWS"), "news"],
    icon: "genre-news",
  },
  {
    id: 29,
    type: GenreType.SPY,
    name: "GENRE.SPY",
    color: "#0000b4",
    alternativeNames: [...getAllSearchTerms("GENRE.SPY"), "espionage", "spy"],
    icon: "genre-spy",
  },
].sort((a, b) => a.name?.localeCompare(b.name));

export function findGenreByName(name: string): Genre | null {
  name = name.toLowerCase();

  return GENRES.find((genre) => genre.alternativeNames.includes(name)) ?? null;
}

export function findGenreById(id: number): Genre | null {
  return GENRES.find((genre) => genre.id === id) ?? null;
}

export function findAllGenreIdsByNames(list: string[]): number[] {
  return list
    .map((genre: string) => findGenreByName(genre)?.id ?? -1)
    .filter((genre: number) => genre !== -1);
}

export const GENRES_GROUPS: ReadonlyArray<Group<string>> = [
  {
    name: "GENRE.S",
    icon: "tag",
    entries: GENRES.map((entry) => {
      const { name, icon, color, type } = entry;
      const data: Entry<string> = {
        name,
        icon,
        color,
        type,
        additionalSearchTerms: entry.alternativeNames,
      };

      return data;
    }),
  },
];

export const getQuickAddDropdownFilterFromSearch = (groups: Entry<string>[], key: string) => {
  return groups.map((entry) => {
    const data: QuickAddDropdownFilterFromSearch<string> = {
      text: entry.name,
      icon: entry.icon,
      key,
      types: entry.type ? [entry.type] : [],
      searchTerms: [...getAllSearchTerms(entry.name), ...(entry.additionalSearchTerms ?? [])],
    };
    return data;
  });
};

export const GENRES_QUICK_ADD_DROPDOWN_FILTER_FROM_SEARCH: ReadonlyArray<
  QuickAddDropdownFilterFromSearch<string>
> = getQuickAddDropdownFilterFromSearch(GENRES_GROUPS[0].entries, FilterKey.GENRES);
