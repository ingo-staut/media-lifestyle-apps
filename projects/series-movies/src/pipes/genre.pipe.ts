import { Pipe, PipeTransform } from "@angular/core";
import { Genre } from "../app/models/genre.class";

@Pipe({
  name: "genre",
})
export class GenrePipe implements PipeTransform {
  transform(genreId: number): Genre | undefined {
    return Genre.findGenreById(genreId);
  }
}
