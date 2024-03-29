import { useState } from "react";
import { SamplingParams } from "@lmscript/editor-tools/types";

export const useSamplingParams = (initialState: SamplingParams) => {
  const [samplingParams, setSamplingParams] = useState<SamplingParams>(initialState);
  return {
    samplingParams,
    setSamplingParams,
  };
};
