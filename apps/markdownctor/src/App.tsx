import { FC, useState } from "react";
import { DEFAULT_PROMPT_EXAMPLE } from "./lib/constants";
import { Button } from "./components/ui/button";
import { PromptEditor } from "./components/prompt-editor";
import { InputMdEditor } from "./components/input-editor";
import { INITIAL_MARKDOWN } from "./lib/init-md";
import { cn } from "./lib/utils";
import { GenerationInput } from "./lib/types";

const Generator: FC<{ input: GenerationInput }> = ({ input }) => {
  return <pre>{JSON.stringify(input, null, 2)}</pre>;
};

export default function App() {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT_EXAMPLE.value);
  const [inputMd, setInputMd] = useState<string>(INITIAL_MARKDOWN);
  const [committed, setCommitted] = useState<GenerationInput | null>(null);

  const onGenerateClick = () => {
    setCommitted({ md: inputMd, prompt });
  };
  return (
    <div className="flex h-screen max-h-screen">
      <div className="w-1/2 overflow-hidden border-r-2">
        <InputMdEditor value={inputMd} setValue={setInputMd} />
      </div>
      <div className={cn("w-1/2 p-2")}>
        <PromptEditor prompt={prompt} setPrompt={setPrompt} />
        <Button className="mt-2 w-full" onClick={onGenerateClick}>
          Generate
        </Button>
        {committed != null ? <Generator input={committed} /> : <></>}
      </div>
    </div>
  );
}
