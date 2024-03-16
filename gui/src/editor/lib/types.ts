import { z } from "zod";
import { JSONContent } from "@tiptap/react";
export type NamedVariable = {
  name: string;
  value: string;
};
export const SamplingParams = z.object({
  temperature: z.number(),
  top_p: z.number().optional().nullable(),
  top_k: z.number().optional().nullable(),
  frequency_penalty: z.number().optional().nullable(),
  presence_penalty: z.number().optional().nullable(),
});

export type SamplingParams = z.infer<typeof SamplingParams>;

export type EditorState = {
  doc: JSONContent;
  variables: NamedVariable[];
  samplingParams: SamplingParams;
};

export const AUTHOR_OPTIONS = ["system", "user", "assistant"] as const;

export type Author = (typeof AUTHOR_OPTIONS)[number];
