export function roundToNext(value: number): number {
  if (value <= 10) {
    return 10;
  } else if (value <= 50) {
    return 50;
  } else if (value <= 100) {
    return 100;
  } else if (value <= 250) {
    return 250;
  } else if (value <= 500) {
    return 500;
  } else {
    return 1000;
  }
}

export function roundToNearestNumber(value: number, roundTo: number): number {
  return Math.round(value / roundTo) * roundTo;
}

export function roundToNextNumber(value: number, roundTo: number): number {
  return Math.ceil(value / roundTo) * roundTo;
}

export function isSameButCanVaryByOne(num1: number, num2: number): boolean {
  return num1 === num2 || num1 - 1 === num2 || num1 === num2 - 1;
}

export function isSameButCanVaryBy(num1: number, num2: number, variation: number): boolean {
  return num1 === num2 || Math.abs(num1 - num2) === variation;
}

export function isNumberBetween(num: number, from: number, to: number): boolean {
  return from <= num && num <= to;
}

export function findMostFrequentNumber(numbers: number[]): number | null {
  if (numbers.length === 0) return null;

  const [mostFrequentNumber] = Object.entries(
    numbers.reduce(
      (count, num) => ((count[num] = (count[num] || 0) + 1), count),
      {} as { [key: number]: number }
    )
  ).reduce(
    ([maxNum, maxCount], [num, count]) =>
      count > maxCount ? [parseInt(num), count] : [maxNum, maxCount],
    [numbers[0], 0]
  );

  return mostFrequentNumber;
}
