/**
 * Daten aus den Settings
 */
export class UtensilObject {
  id: string;
  id_tmp: number;
  name: string;
  alternativeNames: string[];
  searchNames: string[];
  icon: string;
  effort: number;

  constructor(utensilObject: {
    id_tmp: number;
    id: string;
    name?: string;
    alternativeNames?: string[];
    searchNames?: string[];
    icon?: string;
    effort?: number;
  }) {
    this.id = utensilObject.id;
    this.name = utensilObject.name ?? "";
    this.alternativeNames = utensilObject.alternativeNames ?? [];
    this.searchNames = utensilObject.searchNames ?? [];
    this.icon = utensilObject.icon ?? "";
    this.effort = utensilObject.effort ?? 1;
    this.id_tmp = utensilObject.id_tmp;
  }
}

export const findObjectById = (name: string, objects: UtensilObject[]): UtensilObject | null => {
  if (!name) return null;
  return (
    objects.find(
      (object) =>
        object.name.toLowerCase() === name.toLowerCase() ||
        object.alternativeNames.find(
          (alternative) => alternative.toLowerCase() === name.toLowerCase()
        )
    ) ?? null
  );
};
