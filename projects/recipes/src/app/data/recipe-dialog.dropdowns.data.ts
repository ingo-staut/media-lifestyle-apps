export enum RecipeFilterDropdown {
  LINKED = "linked",
  SIMILAR = "similar",
}

export const RECIPE_DROPDOWN = [
  {
    key: RecipeFilterDropdown.LINKED,
    name: "LINK.LINKED_RECIPES",
    icon: "link",
  },
  {
    key: RecipeFilterDropdown.SIMILAR,
    name: "RECIPE.SIMILAR",
    icon: "recipe",
  },
];
