export type DropdownData<KeyType, ValueType> = {
  key: KeyType;
  name: string;
  tooltip?: string;
  icon: string;
  image?: string;
  value?: ValueType;
  color?: string;
  alternativeSearchTerms?: string[];
  groupKey?: string;
};
