import { GENRES } from "../data/genres.data";
import { GenreType } from "./enum/genre.enum";

export class Genre {
  id: number;
  type: GenreType;
  name: string;
  color: string;
  icon: string;
  alternativeNames: string[];

  constructor(genre: {
    id: number;
    type: GenreType;
    name?: string;
    color?: string;
    icon?: string;
    alternativeNames?: string[];
  }) {
    this.id = genre.id;
    this.type = genre.type;
    this.name = genre.name ?? "";
    this.color = genre.color ?? "";
    this.icon = genre.icon ?? "";
    this.alternativeNames = genre.alternativeNames ?? [];
  }

  static findGenreByName(genreName: string): Genre | undefined {
    return GENRES.find(
      (genre) =>
        genre.name.toLowerCase() === genreName.toLowerCase() ||
        genre.alternativeNames.includes(genreName.toLowerCase())
    );
  }

  static findGenreIdByName(genreName: string): number {
    return Genre.findGenreByName(genreName)?.id ?? -1;
  }

  static findGenreById(id: number): Genre | undefined {
    return GENRES.find((genre) => genre.id === id);
  }

  static findGenreNameById(id: number): string {
    return Genre.findGenreById(id)?.name ?? "";
  }
}
