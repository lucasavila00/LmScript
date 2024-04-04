import CodeMirror from "@uiw/react-codemirror";
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
    extensions={[markdown({ base: markdownLanguage })]}
  />
);
