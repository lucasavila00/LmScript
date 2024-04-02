import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { AbstractBackend } from "@lmscript/client/backends/abstract";
import { VllmBackend } from "@lmscript/client/backends/vllm";
import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";
import { assertIsNever } from "./utils";
import { Backend } from "./backend-config";

export type GetBackendInstance = (backend: Backend) => AbstractBackend;

export const getBackendInstance = (backend: Backend): AbstractBackend => {
  switch (backend.tag) {
    case "runpod-serverless-sglang": {
      return new RunpodServerlessBackend(backend.url, backend.token);
    }
    case "vllm-openai": {
      return new VllmBackend({
        url: backend.url,
        auth: backend.token,
        model: backend.model,
      });
    }
    case "sglang": {
      return new SGLangBackend(backend.url);
    }
    default: {
      return assertIsNever(backend);
    }
  }
};
