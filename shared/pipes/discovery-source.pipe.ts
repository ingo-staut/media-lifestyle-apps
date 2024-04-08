import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { getAllSourceIconAndTooltips } from "shared/data/discovery-source.data";

@Pipe({
  name: "allDiscoverySources",
})
export class AllDiscoverySourcesPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(
    sources: string[],
    locale: string
  ): { icons: string[]; tooltip: string; moreCount: number } {
    return getAllSourceIconAndTooltips(sources, this.translateService.instant("AND"));
  }
}

@Pipe({
  name: "firstDiscoverySourceAllTexts",
})
export class FirstDiscoverySourceAllTextsPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(sources: string[], locale: string): { icon: string; tooltip: string } | null {
    const { icons, tooltip } = getAllSourceIconAndTooltips(
      sources,
      this.translateService.instant("AND"),
      false
    );

    if (!tooltip && !icons.length) return null;

    return { icon: icons[0] ?? "explore", tooltip: tooltip };
  }
}
