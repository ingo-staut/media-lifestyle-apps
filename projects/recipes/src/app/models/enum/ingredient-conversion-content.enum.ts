export enum IngredientConversionContentState {
  NO = "NO",
  WITHOUT = "WITHOUT",
  PARTIALLY = "PARTIALLY",
  WITH = "WITH",
}

export enum IngredientConversionContentType {
  NO = "NO",
  EGG = "EGG",
  MILK = "MILK",
  ALCOHOL = "ALCOHOL",
  ALCOHOL_NOT = "ALCOHOL_NOT",
  SUGAR = "SUGAR",
  SUGAR_NOT = "SUGAR_NOT",
  LACTOSE = "LACTOSE",
  LACTOSE_NOT = "LACTOSE_NOT",
  FRUCTOSE = "FRUCTOSE",
  FRUCTOSE_NOT = "FRUCTOSE_NOT",
  GLUTEN = "GLUTEN",
  GLUTEN_NOT = "GLUTEN_NOT",
  MEAT = "MEAT",
  FISH = "FISH",

  // Berechnet
  VEGAN = "VEGAN",
  VEGAN_NOT = "VEGAN_NOT",
  VEGETARIAN = "VEGETARIAN",
  VEGETARIAN_NOT = "VEGETARIAN_NOT",
}

export const IngredientConversionContentTypeList = [
  IngredientConversionContentType.NO,
  IngredientConversionContentType.EGG,
  IngredientConversionContentType.ALCOHOL,
  IngredientConversionContentType.SUGAR,
  IngredientConversionContentType.LACTOSE,
  IngredientConversionContentType.FRUCTOSE,
  IngredientConversionContentType.GLUTEN,
  IngredientConversionContentType.MEAT,
  IngredientConversionContentType.FISH,
];
