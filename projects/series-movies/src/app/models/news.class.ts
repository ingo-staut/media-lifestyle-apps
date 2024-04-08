import { Language } from "shared/models/enum/language.enum";
import { MediaEnum } from "shared/models/enum/media.enum";
import { NewsCategoryType } from "./enum/news-category.enum";
import { NewsSourceType } from "./enum/news-source.enum";

export class News {
  title: string;
  text: string;
  author: string;
  authorUrl: string;
  url: string;
  date: Date;
  category: NewsCategoryType;
  categorySub: string;
  id: string;
  source: NewsSourceType;
  sourceUrl: string;
  image: string;
  mediaIds: string[];
  channelIds: string[];
  mediaSuggestions: { name: string; type: MediaEnum }[];
  hideActions: boolean;
  language: Language;

  constructor(news: {
    title: string;
    text: string;
    author?: string;
    authorUrl?: string;
    url: string;
    date: Date;
    category?: NewsCategoryType;
    categorySub?: string;
    id: string;
    source: NewsSourceType;
    sourceUrl: string;
    image?: string;
    mediaIds?: string[];
    channelIds?: string[];
    mediaSuggestions?: { name: string; type: MediaEnum }[];
    hideActions?: boolean;
    language: Language;
  }) {
    this.title = news.title;
    this.text = news.text;
    this.author = news.author ?? "";
    this.authorUrl = news.authorUrl ?? "";
    this.url = news.url;
    this.date = news.date;
    this.category = news.category ?? NewsCategoryType.NEWS;
    this.categorySub = news.categorySub ?? "";
    this.id = news.id;
    this.source = news.source;
    this.sourceUrl = news.sourceUrl;
    this.image = news.image ?? "";
    this.mediaIds = news.mediaIds ?? [];
    this.channelIds = news.channelIds ?? [];
    this.mediaSuggestions = news.mediaSuggestions ?? [];
    this.hideActions = news.hideActions ?? false;
    this.language = news.language;
  }
}
