import { ParsedBlock } from "./parse-markdown";

export type GenerationInput = {
  md: string;
  parsedMd: ParsedBlock[];
  prompt: string;
};
