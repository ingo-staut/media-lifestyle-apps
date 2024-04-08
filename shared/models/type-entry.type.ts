export type Entry<Type> = {
  name: string;
  type?: Type;
  additionalSearchTerms?: string[];
  icon: string;
  image?: string;
  matchWeight?: number;
  defaultValues?: string[];
  defaultPortion?: number;
  negation?: boolean;
  color?: string;
};

export type EntryVM<Type> = {
  name: string;
  type: number | Type;
  icon: string;
  image?: string;
  isGroup?: boolean;
  color?: string;
};
