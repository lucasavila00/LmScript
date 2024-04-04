import { FC, useState } from "react";
import { DEFAULT_PROMPT_EXAMPLE, INITIAL_MARKDOWN } from "./lib/constants";
import { Button } from "./components/ui/button";
import { PromptEditor } from "./components/prompt-editor";
import { InputMdEditor } from "./components/input-editor";

type GenerationInput = {
  md: string;
  prompt: string;
};

const Generator: FC<{ input: GenerationInput }> = ({ input }) => {
  return <pre>{JSON.stringify(input, null, 2)}</pre>;
};

const HALF_CN = "w-1/2 p-2";

export default function App() {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT_EXAMPLE.value);
  const [inputMd, setInputMd] = useState<string>(INITIAL_MARKDOWN);
  const [committed, setCommitted] = useState<GenerationInput | null>(null);

  const onGenerateClick = () => {
    setCommitted({ md: inputMd, prompt });
  };
  return (
    <div className="flex">
      <div className={HALF_CN}>
        <InputMdEditor value={inputMd} setValue={setInputMd} />
      </div>
      <div className={HALF_CN}>
        <PromptEditor prompt={prompt} setPrompt={setPrompt} />
        <Button className="mt-2 w-full" onClick={onGenerateClick}>
          Generate
        </Button>
        {committed != null ? <Generator input={committed} /> : <></>}
      </div>
    </div>
  );
}
