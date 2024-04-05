import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { FC } from "react";

export const InputMdEditor: FC<{
  value: string;
  setValue: (value: string) => void;
}> = ({ value, setValue }) => (
  <CodeMirror
    placeholder={"Type your markdown here."}
    value={value}
    onChange={setValue}
    height="100vh"
    maxHeight="100vh"
    extensions={[markdown({ base: markdownLanguage }), EditorView.lineWrapping]}
  />
);
