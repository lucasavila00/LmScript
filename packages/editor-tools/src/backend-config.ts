import { ChatTemplate } from "@lmscript/client/chat-template";

export const ALL_BACKENDS_TAGS: BackendTag[] = [
  "sglang",
  "runpod-serverless-sglang",
  "vllm-openai",
];

export const BackendLabels: Record<BackendTag, string> = {
  "runpod-serverless-sglang": "Runpod Serverless SGLang",
  "vllm-openai": "vLLM OpenAI Compatible",
  sglang: "SGLang",
};

export type SGLangBackend = {
  tag: "sglang";
  url: string;
  token: string;
  template: ChatTemplate;
};

export type RunpodServerlessSGLangBackend = {
  tag: "runpod-serverless-sglang";
  url: string;
  token: string;
  template: ChatTemplate;
};

export type RunpodServerlessVLLMBackend = {
  tag: "vllm-openai";
  url: string;
  token: string;
  model: string;
  template: ChatTemplate;
};

export type Backend = SGLangBackend | RunpodServerlessSGLangBackend | RunpodServerlessVLLMBackend;

export type BackendTag = Backend["tag"];
