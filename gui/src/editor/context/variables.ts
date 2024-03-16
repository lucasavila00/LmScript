import { createContext } from "react";
import { NamedVariable } from "../lib/types";

export const VariablesContext = createContext<NamedVariable[]>([]);
