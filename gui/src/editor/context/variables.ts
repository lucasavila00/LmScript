import { createContext } from "react";

export type VariablesContextValue = string[];
export const VariablesContext = createContext<VariablesContextValue>([]);
