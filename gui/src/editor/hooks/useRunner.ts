import { useState } from "react";

export const ALL_BACKENDS_TAGS: BackendTag[] = [
  "sglang",
  "runpod-serverless-sglang",
  "runpod-serverless-vllm",
];

export const BackendLabels: Record<BackendTag, string> = {
  "runpod-serverless-sglang": "Runpod Serverless SGLang",
  "runpod-serverless-vllm": "Runpod Serverless vLLM",
  sglang: "SGLang",
};

export type SGLangBackend = {
  tag: "sglang";
};

export type RunpodServerlessSGLangBackend = {
  tag: "runpod-serverless-sglang";
  url: string;
  token: string;
};

export type RunpodServerlessVLLMBackend = {
  tag: "runpod-serverless-vllm";
};

export type Backend =
  | SGLangBackend
  | RunpodServerlessSGLangBackend
  | RunpodServerlessVLLMBackend;

export type BackendTag = Backend["tag"];

export const useRunner = () => {
  const [backend, setBackend] = useState<Backend | null>(null);
  return {
    backend,
    setBackend,
  };
};
