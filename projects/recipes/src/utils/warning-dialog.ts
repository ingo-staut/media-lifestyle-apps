import { environment } from "../environments/environment";

export function preventBrowserTabClosing(
  event: any,
  show: boolean,
  onlyInProd: boolean = true
): void {
  if (((onlyInProd && environment.production) || (!onlyInProd && !environment.production)) && show)
    event.returnValue = "";
}
