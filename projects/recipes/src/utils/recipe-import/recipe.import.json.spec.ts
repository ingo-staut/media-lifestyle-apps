import * as fs from "fs";
import { PreparationType } from "../../app/models/enum/preparation.enum";
import { getRecipe } from "./recipe.import.json";

describe("Import mit JSON-Struktur von Webseite", () => {
  it("Bianca Zapatka", () => {
    const data = fs.readFileSync(
      "projects/recipes/src/utils/recipe-import/test-data/bianca-zapatka.data.txt",
      "utf8"
    );

    const recipe = getRecipe(data, "", []);

    expect(recipe).toBeTruthy();

    if (!recipe) return;

    expect(recipe.images).toEqual([
      "https://biancazapatka.com/wp-content/uploads/2022/09/cookie-brownies.jpg",
    ]);

    expect(recipe.name).toEqual("Vegane Brookies");
    expect(recipe.cuisines).toEqual(["Amerikanisch"]);
    expect(recipe.ingredients.length).toEqual(16);
    expect(recipe.amountNumber).toEqual(15);
    expect(recipe.portions).toEqual(15);
    expect(recipe.category).toEqual(14);
    expect(recipe.instructions.length).toEqual(6);
    const expectedText =
      "Den Backofen auf 180 °C Ober-/Unterhitze vorheizen und eine 18x28 cm (oder quadratische 23x23 cm) Brownieform leicht einfetten und mit Backpapier auslegen.";
    expect(recipe.instructions[0].text).toEqual(expectedText);
    const expectedTags = [
      "Brookies",
      "Brownies",
      "Chocolate Chip Cookies",
      "Cookie Bars",
      "Cookies",
      "Kekse",
    ];
    expect(recipe.tags).toEqual(expectedTags);

    console.log(recipe);
  });

  it("Eatsmarter", () => {
    const data = fs.readFileSync(
      "projects/recipes/src/utils/recipe-import/test-data/eatsmarter.data.txt",
      "utf8"
    );
    const recipe = getRecipe(data, "", []);

    expect(recipe).toBeTruthy();

    if (!recipe) return;

    expect(recipe.images).toEqual([
      "https://images.eatsmarter.de/sites/default/files/styles/max_size/public/gegrillte-polentaschnitten-115997.jpg",
    ]);

    expect(recipe.name).toEqual("Gegrillte Polentaschnitten");
    expect(recipe.ingredients.length).toEqual(9);
    expect(recipe.amountNumber).toEqual(4);
    expect(recipe.portions).toEqual(4);
    expect(recipe.category).toEqual(3);
    expect(recipe.instructions.length).toEqual(5);
    const expectedText = "Tomaten hacken.";
    expect(recipe.instructions[0].text).toEqual(expectedText);
    expect(recipe.tags).toHaveLength(0);
    const nutritionDetails = [
      {
        servingSize: "",
        calories: 293,
        fat: 8,
        saturatedFat: 1.3,
        carbohydrate: 47,
        fiber: null,
        sugar: null,
        protein: 6,
        sodium: null,
        potassium: null,
        calcium: null,
        iron: null,
        cholesterol: null,
      },
    ];
    expect(recipe.nutritionDetails).toEqual(nutritionDetails);

    console.log(recipe);
  });

  it("ProVeg", () => {
    const data = fs.readFileSync(
      "projects/recipes/src/utils/recipe-import/test-data/proveg.data.txt",
      "utf8"
    );
    const recipe = getRecipe(data, "", []);

    expect(recipe).toBeTruthy();

    if (!recipe) return;

    expect(recipe.images).toEqual([
      "https://proveg.com/de/wp-content/uploads/sites/5/2021/03/loaf-2.jpg",
    ]);

    expect(recipe.name).toEqual("Veganer Tofu-Walnuss-Braten");
    expect(recipe.ingredients.length).toEqual(16);
    expect(recipe.amountNumber).toEqual(7);
    expect(recipe.portions).toEqual(7);
    expect(recipe.instructions.length).toEqual(7);
    const instruction1 =
      "Die Walnüsse in einer Küchenmaschine zu feinen Bröseln zerkleinern. Die Zwiebel schälen, vierteln, hinzufügen und weiterverarbeiten, bis eine Paste entsteht.";
    expect(recipe.instructions[0].text).toEqual(instruction1);
    const instruction2 =
      "Anschließend die Paprika, den Tofu, die Gewürze, den Hefeextrakt und das Gemüsebrühepulver hinzufügen und weiter zerkleinern. Die Seiten des Mixers zwischendurch mit einem Spatel abschaben, um sicherzustellen, dass alles zerkleinert wird. Gegebenenfalls etwas nachwürzen.";
    expect(recipe.instructions[1].text).toEqual(instruction2);
    expect(recipe.tags).toHaveLength(0);

    console.log(recipe);
  });

  it("SlowlyVeggie", () => {
    const data = fs.readFileSync(
      "projects/recipes/src/utils/recipe-import/test-data/slowly-veggie.data.txt",
      "utf8"
    );
    const recipe = getRecipe(data, "", []);

    expect(recipe).toBeTruthy();

    if (!recipe) return;

    expect(recipe.images).toEqual([
      "https://www.slowlyveggie.de/sites/slowlyveggie.de/files/styles/facebook/public/2020-12/vegane_kohlrabi_schnitzel_0136.jpg?h=88d78713&itok=ryvmO_xQ",
    ]);

    expect(recipe.name).toEqual("Vegane Kohlrabischnitzel");
    expect(recipe.ingredients.length).toEqual(9);
    expect(recipe.amountNumber).toEqual(10);
    expect(recipe.portions).toEqual(10);
    expect(recipe.instructions.length).toEqual(5);
    const instruction1 =
      "Wasser aufkochen und salzen. In der Zwischenzeit Kohlrabi schälen und in ungefähr 05 cm dicke gleich große Scheiben schneiden. Für 4-5 Minuten in kochendem Salzwasser garen. In ein Sieb abgießen und mit Küchenpapier trocken tupfen.";
    expect(recipe.instructions[0].text).toEqual(instruction1);
    expect(recipe.instructions[0].preparationType).toEqual(PreparationType.POT_COOK);
    expect(recipe.instructions[0].minTime).toEqual(4);
    expect(recipe.instructions[0].maxTime).toEqual(5);
    const instruction2 =
      "Petersilienblätter abzupfen und fein hacken. Hafermilch mit gehackter Petersilie Paprikapulver Salz und Pfeffer verrühren. Die gewürzte vegane Milch Mehl und Semmelbrösel in getrennte Schüsseln füllen.";
    expect(recipe.instructions[1].text).toEqual(instruction2);
    expect(recipe.instructions[1].minTime).toEqual(20);
    expect(recipe.instructions[1].maxTime).toBeNull();
    expect(recipe.tags).toHaveLength(4);

    console.log(recipe);
  });

  it("Eat This", () => {
    const data = fs.readFileSync(
      "projects/recipes/src/utils/recipe-import/test-data/eat-this.data.txt",
      "utf8"
    );
    const recipe = getRecipe(data, "", []);

    expect(recipe).toBeTruthy();

    if (!recipe) return;

    expect(recipe.images).toEqual([
      "https://www.eat-this.org/wp-content/uploads/2023/07/eat_this_koreanische_gemuese-pancakes_–_yachaejeon_004.jpg",
    ]);

    expect(recipe.name).toEqual("Koreanische Gemüse-Pancakes");
    expect(recipe.ingredients.length).toEqual(17);
    expect(recipe.amountNumber).toEqual(1);
    expect(recipe.portions).toEqual(1);
    expect(recipe.instructions.length).toEqual(6);
    const instruction1 =
      "Frühlingszwiebel, Zucchini, Zwiebel und Karotte in feine 8-10 cm lange Streifen schneiden. Pilze in dünne Scheiben schneiden. 4-5 Pilzscheiben beiseitelegen.";
    expect(recipe.instructions[0].text).toEqual(instruction1);
    expect(recipe.instructions[0].preparationType).toEqual(PreparationType.NONE);
    expect(recipe.instructions[0].minTime).toEqual(10);
    expect(recipe.instructions[0].maxTime).toBeNull();
    const instruction2 =
      "Doenjang, Wasser, Mehl, Kurkuma und Salz rasch mit dem Schneebesen zu einem glatten Teig verrühren. Gemüse unterrühren.";
    expect(recipe.instructions[1].text).toEqual(instruction2);
    expect(recipe.instructions[1].minTime).toEqual(5);
    expect(recipe.instructions[1].maxTime).toBeNull();
    expect(recipe.instructions[1].ingredients.length).toEqual(3);
    expect(recipe.tags).toHaveLength(2);
    expect(recipe.cuisines).toEqual(["Korea, Südkorea"]);

    console.log(recipe);
  });

  it("Veggie Einhorn", () => {
    const data = fs.readFileSync(
      "projects/recipes/src/utils/recipe-import/test-data/veggie-einhorn.data.txt",
      "utf8"
    );
    const recipe = getRecipe(data, "", []);

    expect(recipe).toBeTruthy();

    if (!recipe) return;

    expect(recipe.images).toEqual([
      "https://veggie-einhorn.de/wp-content/uploads/Vegane-Gemueselasagne-mit-Creme-fraiche.jpg",
    ]);

    expect(recipe.name).toEqual("Vegane Gemüselasagne");

    expect(recipe.ingredients.length).toEqual(13);
    expect(recipe.amountNumber).toEqual(4);
    expect(recipe.portions).toEqual(4);
    expect(recipe.instructions.length).toEqual(15);
    const instruction1 =
      "Würfeln:1 große Zwiebel (150 g)1 rote Paprika (150 g)1 Karotten (150 g)1 Zucchini (275 g)1 Stange Staudensellerie (60 g)";
    expect(recipe.instructions[0].text).toEqual(instruction1);
    expect(recipe.instructions[0].preparationType).toEqual(PreparationType.NONE);
    expect(recipe.instructions[0].minTime).toEqual(5);
    expect(recipe.instructions[0].maxTime).toBeNull();
    const instruction2 = "2 Zehen Knoblauch pressen.";
    expect(recipe.instructions[1].text).toEqual(instruction2);
    expect(recipe.instructions[1].minTime).toEqual(5);
    expect(recipe.instructions[1].maxTime).toBeNull();
    expect(recipe.instructions[1].ingredients.length).toEqual(1);
    expect(recipe.tags).toHaveLength(3);
    expect(recipe.cuisines).toEqual(["Italienisch"]);

    console.log(recipe);
  });

  it("Koch mit", () => {
    const data = fs.readFileSync(
      "projects/recipes/src/utils/recipe-import/test-data/koch-mit.data.txt",
      "utf8"
    );
    const recipe = getRecipe(data, "", []);

    expect(recipe).toBeTruthy();

    if (!recipe) return;

    expect(recipe.images).toEqual([
      "https://www.koch-mit.de/app/uploads/2023/04/yum-yum-salat1.jpeg",
    ]);

    expect(recipe.name).toEqual("Yum-Yum-Salat: Rezept mit Chinakohl");

    expect(recipe.ingredients.length).toEqual(12);
    expect(recipe.amountNumber).toEqual(1);
    expect(recipe.portions).toEqual(1);

    expect(recipe.instructions.length).toEqual(7);
    const instruction1 =
      "Zunächst bereitest du die Sauce für den Yum-Yum Salat zu. Dafür vermengst du in einer großen Schüssel Öl mit dem Sesamöl, Weißweinessig und Honig sowie der Gewürzmischung, die den Instant-Nudeln beiliegt.";
    expect(recipe.instructions[0].text).toEqual(instruction1);
    expect(recipe.instructions[0].preparationType).toEqual(PreparationType.NONE);
    expect(recipe.instructions[0].minTime).toBeNull();
    expect(recipe.instructions[0].maxTime).toBeNull();

    const instruction2 =
      "Dann zerbröselst du die trockenen Nudeln in die Schüssel und gibst einen Schluck kochendes Wasser dazu. Rühre alles einmal gut durch, decke die Schüssel zu und lass die Nudeln ca. 10-15 Minuten quellen.";
    expect(recipe.instructions[1].text).toEqual(instruction2);
    expect(recipe.instructions[1].preparationType).toEqual(PreparationType.POT_COOK);
    expect(recipe.instructions[1].minTime).toEqual(10);
    expect(recipe.instructions[1].maxTime).toEqual(15);
    expect(recipe.instructions[1].ingredients.length).toEqual(0);

    const instruction3 =
      "Damit der Tofu schön knusprig wird, ist es wichtig, ihm vor dem Anbraten möglichst viel Feuchtigkeit zu entziehen. Dafür kannst du den Tofu in ein sauberes Küchentuch einschlagen und mit einem Gegenstand beschweren. Wenn du ihn ca. 10 Minuten so liegen lässt, saugt das Küchentuch ein Großteil der Feuchtigkeit auf. Anschließend schneidest du den Tofu in ca. 1-2 cm große Würfel.";
    expect(recipe.instructions[2].text).toEqual(instruction3);
    expect(recipe.instructions[2].preparationType).toEqual(PreparationType.PAN_SAUTE);
    expect(recipe.instructions[2].minTime).toEqual(10);
    expect(recipe.instructions[2].maxTime).toBeNull();
    expect(recipe.instructions[2].ingredients.length).toEqual(1);

    expect(recipe.tags).toHaveLength(4);

    console.log(recipe);
  });
});
