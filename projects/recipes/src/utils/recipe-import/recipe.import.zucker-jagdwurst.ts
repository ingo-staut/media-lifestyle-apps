// Regular expression patterns to match ingredients and preparation steps
const ingredientPattern = /<h3 class="card-module--headline--X0z4Q">Zutaten<\/h3>(.*?)<\/ol>/gs;
const preparationPattern =
  /<h3 class="card-module--headline--X0z4Q">Zubereitung<\/h3>(.*?)<\/ol>/gs;

// Function to extract ingredients and preparation steps for each recipe
export function extractRecipeInfoFromZuckerJagdwurst(htmlContent: string) {
  const recipes: { ingredients: string[]; preparation: string[] }[] = [];

  // Match all recipe sections in the HTML content
  const recipeSections = htmlContent.match(
    /<section class="card-module--card--dCwUR">(.*?)<\/section>/gs
  );

  if (recipeSections) {
    for (const section of recipeSections) {
      const recipe: { ingredients: string[]; preparation: string[] } = {
        ingredients: [],
        preparation: [],
      };

      // Extract ingredients using the ingredient pattern
      const ingredientMatch = section.match(ingredientPattern);
      if (ingredientMatch) {
        // const ingredients = ingredientMatch[0].replace(/<[^>]*>?/gm, ''); // Remove HTML tags
        recipe.ingredients = ingredientMatch[0]
          .split(RegExp("\n|</li>|<li [^>]*>"))
          .filter((i) => i.trim() !== ""); // Split into array and remove empty lines

        if (recipe.ingredients[0].includes("<h3")) {
          recipe.ingredients = recipe.ingredients.slice(1);
        }
      }

      // Extract preparation steps using the preparation pattern
      const preparationMatch = section.match(preparationPattern);
      if (preparationMatch) {
        // const preparationSteps = preparationMatch[0].replace(/<[^>]*>?/gm, ''); // Remove HTML tags
        recipe.preparation = preparationMatch[0]
          .split(RegExp("\n|<p>|<li>|</p>|</li>|</ol>"))
          .filter((s) => s.trim() !== ""); // Split into array and remove empty lines

        if (recipe.preparation[0].includes("<h3")) {
          recipe.preparation = recipe.preparation.slice(1);
        }
      }

      recipes.push(recipe);
    }
  }

  return recipes;
}
