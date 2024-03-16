import { useState } from "react";
import { z } from "zod";

export const SamplingParams = z.object({
  temperature: z.number(),
  top_p: z.number().optional().nullable(),
  top_k: z.number().optional().nullable(),
  frequency_penalty: z.number().optional().nullable(),
  presence_penalty: z.number().optional().nullable(),
});

export type SamplingParams = z.infer<typeof SamplingParams>;

export const useSamplingParams = (initialState: SamplingParams) => {
  const [samplingParams, setSamplingParams] =
    useState<SamplingParams>(initialState);
  return {
    samplingParams,
    setSamplingParams,
  };
};
