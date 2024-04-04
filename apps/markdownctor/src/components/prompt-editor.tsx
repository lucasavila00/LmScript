import { PROMPT_EXAMPLES } from "@/lib/constants";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { FC } from "react";

export const PromptEditor: FC<{
  prompt: string;
  setPrompt: (value: string) => void;
}> = ({ prompt, setPrompt }) => {
  return (
    <div className="grid w-full gap-1.5">
      <div className="flex justify-between items-center">
        <Label htmlFor="prompt">Prompt</Label>
        <Select
          onValueChange={(id) => {
            const example = PROMPT_EXAMPLES.find((e) => e.id === id);
            if (example != null) {
              setPrompt(example.value);
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
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt here."
        id="prompt"
      />
      {/* <p className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p> */}
    </div>
  );
};
