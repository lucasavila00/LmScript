import { useEffect, useState } from "react";
import { DEFAULT_PROMPT_EXAMPLE } from "./lib/constants";
import { Button } from "./components/ui/button";
import { PromptEditor } from "./components/prompt-editor";
import { InputMdEditor } from "./components/input-editor";
import { INITIAL_MARKDOWN } from "./lib/init-md";
import { cn } from "./lib/utils";
import { GenerationInput } from "./lib/types";
import { Generator } from "./components/generator";
import React from "react";
import { formatNoLineBreaks } from "./lib/prettier";
import { parseMarkdown } from "./lib/parse-markdown";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};
class ErrorBoundary extends React.Component<ErrorBoundaryProps, { theError: null | unknown }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { theError: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { theError: error };
  }

  render() {
    if (this.state.theError != null) {
      return <div>Error: {String(this.state.theError)}</div>;
    }

    return this.props.children;
  }
}

export default function App() {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT_EXAMPLE.value);
  const [inputMd, setInputMd] = useState<string>("");
  useEffect(() => {
    formatNoLineBreaks(INITIAL_MARKDOWN).then((md) => setInputMd(md));
  }, []);
  const [committed, setCommitted] = useState<GenerationInput | null>(null);

  const onGenerateClick = async () => {
    const formatted = await formatNoLineBreaks(inputMd);
    setInputMd(formatted);
    setCommitted({ md: formatted, prompt, parsedMd: parseMarkdown(formatted) });
  };
  return (
    <div className="flex h-screen max-h-screen">
      <div className="w-1/2 overflow-hidden border-r-2">
        <InputMdEditor value={inputMd} setValue={setInputMd} />
      </div>
      <div className={cn("w-1/2 p-2 flex flex-col")}>
        <PromptEditor prompt={prompt} setPrompt={setPrompt} />
        <Button className="mt-2 w-full" onClick={onGenerateClick}>
          Generate
        </Button>

        {committed != null ? (
          <ErrorBoundary>
            <Generator input={committed} />
          </ErrorBoundary>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
