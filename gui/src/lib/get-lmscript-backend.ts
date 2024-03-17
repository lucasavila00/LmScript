import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { AbstractBackend } from "@lmscript/client/backends/abstract";
import { VllmBackend } from "@lmscript/client/backends/vllm";
import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";
import { Backend } from "../editor/hooks/useBackendConfig";
import { assertIsNever } from "./utils";

export type GetBackendInstance = (backend: Backend) => AbstractBackend;

// MAKE SURE ELECTRON COPY MATCHES
export const getBackendInstance = (backend: Backend): AbstractBackend => {
  switch (backend.tag) {
    case "runpod-serverless-sglang": {
      return new RunpodServerlessBackend(backend.url, backend.token);
    }
    case "runpod-serverless-vllm": {
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
export type { AbstractBackend };
