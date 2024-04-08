import { Language } from "shared/models/enum/language.enum";

export class Settings {
  id: string;
  language: Language;

  constructor(data: Settings) {
    this.id = data.id;
    this.language = data.language;
  }
}
