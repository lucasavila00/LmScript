import { createContext } from "react";

export type NamedVariable = {
  name: string;
  value: string;
};
export const VariablesContext = createContext<NamedVariable[]>([]);
