import { ChatTemplate } from "@lmscript/client/chat-template";
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
  tag: "runpod-serverless-vllm";
  url: string;
  token: string;
  model: string;
  template: ChatTemplate;
};

export type Backend =
  | SGLangBackend
  | RunpodServerlessSGLangBackend
  | RunpodServerlessVLLMBackend;

export type BackendTag = Backend["tag"];

const useLocalStorageState = <T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  const setLocalStorageState = (value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [state, setLocalStorageState];
};

export const useBackendConfig = () => {
  const [backend, setBackend] = useLocalStorageState<Backend | null>(
    "backend-config-v1",
    null,
  );
  return {
    backend,
    setBackend,
  };
};
