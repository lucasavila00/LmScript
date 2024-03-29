import { createContext } from "react";
import { NamedVariable } from "@lmscript/editor-tools/types";

export const VariablesContext = createContext<NamedVariable[]>([]);
