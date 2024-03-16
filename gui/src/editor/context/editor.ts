import { Editor } from "@tiptap/react";
import { createContext } from "react";

export const EditorContext = createContext<Editor | null>(null);
