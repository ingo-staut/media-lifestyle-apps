import { roundToNextNumber } from "./number";

export function getSliderSettings(amount: number) {
  const show = !(amount % 1) || !(amount % 0.5) || !(amount % 0.25) || !(amount % 0.125);
  const step = getStep(amount);
  const max = getMax(amount);

  return { max, step, show };
}

function getStep(amount: number): number {
  if (!(amount % 1000) && amount > 1000) {
    return 1000;
  } else if (amount === 1000) {
    return 100;
  } else if (!(amount % 500) && amount > 500) {
    return 500;
  } else if (amount === 500) {
    return 100;
  } else if (!(amount % 100) && amount > 100) {
    return 100;
  } else if (amount === 100) {
    return 10;
  } else if (!(amount % 50) && amount > 50) {
    return 50;
  } else if (amount === 50) {
    return 10;
  } else if (!(amount % 10) && amount > 10) {
    return 10;
  } else if (!(amount % 1)) {
    return 1;
  }

  // Kommazahl
  else if (!(amount % 0.5) && amount <= 5) {
    return 0.5;
  } else if (!(amount % 0.25) && amount <= 3) {
    return 0.25;
  } else if (!(amount % 0.125) && amount <= 1) {
    return 0.125;
  } else {
    return 1;
  }
}

function getMax(amount: number): number {
  // Kommazahl
  if (!(amount % 0.5) && amount % 1 && amount <= 5) {
    return 10;
  } else if (!(amount % 0.25) && amount % 1 && amount <= 3) {
    return 5;
  } else if (!(amount % 0.125) && amount % 1 && amount <= 1) {
    return 1;
  }

  // Normale Zahlen
  else if (amount < 10) {
    return 10;
  } else if (amount === 10) {
    return 20;
  } else if (amount < 25) {
    return 50;
  } else if (amount < 50) {
    return 100;
  } else if (amount < 100) {
    return 100;
  } else if (amount === 100) {
    return 200;
  } else if (amount < 500) {
    return 500;
  } else if (amount === 500) {
    return 1000;
  } else if (amount < 1000) {
    return 1500;
  } else if (amount < 1500) {
    return 2000;
  } else if (amount < 2500) {
    return 5000;
  } else {
    return roundToNextNumber(amount, 100);
  }
}
