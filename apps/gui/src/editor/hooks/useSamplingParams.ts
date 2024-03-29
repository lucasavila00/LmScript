import { useState } from "react";
import { SamplingParams } from "../lib/types";

export const useSamplingParams = (initialState: SamplingParams) => {
  const [samplingParams, setSamplingParams] = useState<SamplingParams>(initialState);
  return {
    samplingParams,
    setSamplingParams,
  };
};
