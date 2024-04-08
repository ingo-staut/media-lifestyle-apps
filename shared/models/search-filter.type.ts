export type QuickAddFilterFromSearch = {
  key: string;
  text: string;
  icons: string[];
  image?: string;
  matchWeight?: number;
  addFilter?: boolean;
  removeFilter?: boolean;
  func: () => void;
};

export type QuickAddFilterButtonTristateFromSearch = {
  key: string;
  searchTerms: string[]; // Alle Sprachen, hier wird der Search Value drin gesucht
  texts: string[];
  icons: string[];
  suffixShort?: string;
  suffixLong?: string;
  max?: number;
};

export type QuickAddFilterButtonValueFromSearch = {
  key: string;
  searchTerms: string[]; // Alle Sprachen, hier wird der Search Value drin gesucht
  text: string;
  icon: string;
};

export type QuickAddDropdownFilterFromSearch<Type> = {
  key: string;
  searchTerms: string[]; // Alle Sprachen, hier wird der Search Value drin gesucht
  text: string;
  icon: string;
  types: Type[];
  negation?: boolean;
};

export type QuickAddFilterDatesFromSearch = {
  key: string;
  searchTerms: string[]; // Alle Sprachen, hier wird der Search Value drin gesucht
  searchTermsRequired: string[];
  text: string;
  icon: string;
  value: string;
  showDayInput?: boolean;
  showDateInputs?: boolean;
};

export type QuickAddFilterNumbersFromSearch = {
  key: string;
  searchTerms: string[]; // Alle Sprachen, hier wird der Search Value drin gesucht
  searchTermsRequired: string[];
  text: string;
  icon: string;
  value: string;
  showNumberInput?: boolean;
  showNumberInputs?: boolean;
};

export type QuickAddFilterSelectFromSearch = {
  key: string;
  searchTerms: string[]; // Alle Sprachen, hier wird der Search Value drin gesucht
  text: string;
  icon: string;
  value: string;
};
