export function isWikiwandUrl(url: string): boolean {
  return url.includes("wikiwand.com");
}

export function transformWikiwandUrlToWikipediaUrl(wikiwandUrl: string) {
  if (!isWikiwandUrl(wikiwandUrl)) {
    return wikiwandUrl;
  }

  const languageMatch = wikiwandUrl.match(/\/(\w{2})\//);
  const languageCode = languageMatch ? languageMatch[1] : "en"; // Default to 'en' if no language code is found

  const pathAfterLastSlash = wikiwandUrl.substring(wikiwandUrl.lastIndexOf("/") + 1);
  const outgoingUrl = `https://${languageCode}.wikipedia.org/wiki/${pathAfterLastSlash}`;

  return outgoingUrl;
}
