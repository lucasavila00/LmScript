import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { FC, useState } from "react";
import {
  DEFAULT_PROMPT_EXAMPLE,
  INITIAL_MARKDOWN,
  PROMPT_EXAMPLES,
  PromptExample,
} from "./lib/constants";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

const InputMdEditor: FC<{
  value: string;
  setValue: (value: string) => void;
}> = ({ value, setValue }) => (
  <CodeMirror
    value={value}
    onChange={setValue}
    extensions={[markdown({ base: markdownLanguage })]}
  />
);

const Generator: FC<{ inputMd: string }> = () => {
  return <>todo...</>;
};

const PromptField: FC<{
  onExampleSelected: (value: PromptExample) => void;
}> = ({ onExampleSelected }) => {
  return (
    <div className="grid w-full gap-1.5">
      <div className="flex justify-between items-center">
        <Label htmlFor="prompt">Prompt</Label>
        <Select
          onValueChange={(id) => {
            const example = PROMPT_EXAMPLES.find((e) => e.id === id);
            if (example != null) {
              onExampleSelected(example);
            }
          }}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select an example" />
          </SelectTrigger>
          <SelectContent>
            {PROMPT_EXAMPLES.map((example) => (
              <SelectItem value={example.id}>{example.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        defaultValue={DEFAULT_PROMPT_EXAMPLE.value}
        placeholder="Type your prompt here."
        id="prompt"
      />
      {/* <p className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p> */}
    </div>
  );
};

const HALF_CN = "w-1/2 p-2";

export default function App() {
  const [inputMd, setInputMd] = useState<string>(INITIAL_MARKDOWN);
  const [committedMd, setCommittedMd] = useState<string | null>(null);

  const onGenerateClick = () => setCommittedMd(inputMd);
  const onExampleSelected = (example: PromptExample) => setInputMd(example.value);
  return (
    <div className="flex">
      <div className={HALF_CN}>
        <InputMdEditor value={inputMd} setValue={setInputMd} />
      </div>
      <div className={HALF_CN}>
        <PromptField
          onExampleSelected={(value) => {
            onExampleSelected(value);
          }}
        />
        <Button className="mt-2 w-full" onClick={onGenerateClick}>
          Generate
        </Button>
        {committedMd != null ? <Generator inputMd={committedMd} /> : <></>}
      </div>
    </div>
  );
}
