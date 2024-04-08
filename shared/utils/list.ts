export function getRandomElementsFromList<Type>(list: Type[], count: number): Type[] {
  return [...list].sort(() => Math.random() - 0.5).slice(0, count);
}

// Define a type guard for checking if it's a list of strings
export function isListOfStrings(input: any[]): input is string[] {
  return input.every((item) => typeof item === "string");
}

// Define a type guard for checking if it's a list of objects
export function isListOfObjects(input: any[]): input is any[] {
  return input.every((item) => typeof item === "object");
}

export function findMostCommonItemInList<T>(items: T[]): T | undefined {
  if (!items.length) return undefined;

  const occurrencesMap: Map<T, number> = new Map();

  for (const item of items) {
    occurrencesMap.set(item, (occurrencesMap.get(item) || 0) + 1);
  }

  let mostCommon: T | undefined;
  let maxOccurrences = 0;

  for (const [item, occurrences] of occurrencesMap) {
    if (occurrences > maxOccurrences) {
      maxOccurrences = occurrences;
      mostCommon = item;
    }
  }

  return mostCommon;
}

export const sortListIfValueTrueToFront = (a: boolean, b: boolean) => (b ? 1 : 0) - (a ? 1 : 0);
