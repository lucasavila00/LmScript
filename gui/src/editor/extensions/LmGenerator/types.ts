export type StoredChoice =
  | {
      tag: "variable";
      value: string;
    }
  | {
      tag: "typed";
      value: string;
    };
export const ALL_GENERATION_NODE_TYPES = [
  "generation",
  "selection",
  "regex",
] as const;

export type GenerationNodeType = (typeof ALL_GENERATION_NODE_TYPES)[number];

export const GenerationNodeTypeLabels: Record<GenerationNodeType, string> = {
  generation: "Until",
  selection: "One of",
  regex: "Regex",
};

export type GenerationNodeAttrs = {
  choices: StoredChoice[];
  type: GenerationNodeType;
  name: string;
  max_tokens: number;
  stop: string[];
};
