import { ButtonTristate } from "./enum/button-tristate.enum";

export type CheckButton<Type> = {
  type: Type;
  state: ButtonTristate;
  texts?: string[];
  tooltips?: string[];
  icons: string[];
  colors?: string[];
};
