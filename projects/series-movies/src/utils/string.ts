import { MediaEnum } from "shared/models/enum/media.enum";

export function isSeriesOrMovie(text: string): MediaEnum {
  const seriesTerms = [
    "series",
    "serie",
    "staffel",
    "staffelstart",
    "serienstart",
    "start der",
    "season",
    "seasons",
    "serien",
  ];
  const moviesTerms = ["filme", "film", "movie", "movies"];

  const seriesCount = countKeywords(text, seriesTerms);
  const moviesCount = countKeywords(text, moviesTerms);

  return seriesCount >= moviesCount ? MediaEnum.SERIES : MediaEnum.MOVIE;
}

function countKeywords(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  return keywords.reduce((count, keyword) => {
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, "gi");
    return count + (lowerText.match(keywordRegex) || []).length;
  }, 0);
}
