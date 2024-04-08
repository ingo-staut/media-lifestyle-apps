import { getAllSourceIconAndTooltips } from "./discovery-source.data";

describe("Entdeckungsquellen", () => {
  it("Icons und Tooltips aller Quellen", () => {
    const iconsAndTooltips = getAllSourceIconAndTooltips(
      ["Reddit", "CSB", "Kino+", "Filmpalaver", "Fred Carpet"],
      "und"
    );

    expect(iconsAndTooltips.icons).toEqual([
      "reddit",
      "csb",
      "kino-plus",
      "filmpalaver",
      "fred-carpet",
    ]);

    expect(iconsAndTooltips.tooltip).toEqual(
      "Reddit, Cinema Strikes Back, Kino+, Filmpalaver und FredCarpet"
    );
  });

  it("Icons und Tooltips von bekannten und neuen Quellen", () => {
    const iconsAndTooltips = getAllSourceIconAndTooltips(["Test", "Reddit", "Mama"], "und");

    expect(iconsAndTooltips.icons).toEqual(["reddit"]);
    expect(iconsAndTooltips.tooltip).toEqual("Test, Reddit und Mama");
    expect(iconsAndTooltips.moreCount).toEqual(2);
  });
});
