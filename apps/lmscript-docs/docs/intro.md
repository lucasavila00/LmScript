---
sidebar_position: 1
---

# Introduction

## Quick Start

### Start the [vLLM](https://github.com/vllm-project/vllm) server.

Create a file called `docker-compose.yml`.

```yml
# Usage with CUDA, requires Nvidia GPU.
services:
  sv:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    image: vllm/vllm-openai:v0.4.0
    command: "--model TheBloke/Mistral-7B-Instruct-v0.2-AWQ --gpu-memory-utilization 0.8 --max-model-len 4096 --quantization awq"
    ports:
      - 8000:8000
    network_mode: host
    ipc: "host"
    volumes:
      - ~/.cache/huggingface:/root/.cache/huggingface
```

Start it with `docker-compose up`

:::note
Check [vLLM docs](https://docs.vllm.ai/) for more information or help on how to start the server.

vLLM 0.4.0 or newer is required
:::

### Install `@lmscript/client`

```
npm install @lmscript/client
```

### Create a script

Create a file called `main.ts`

```ts
import { LmScript } from "@lmscript/client";
import { VllmBackend } from "@lmscript/client/backends/vllm";
import { BULLET_LIST_REGEX } from "@lmscript/client/regex";

const backend = new VllmBackend({
  url: `http://localhost:8000`,
  template: "mistral",
  model: "TheBloke/Mistral-7B-Instruct-v0.2-AWQ",
});

const model = new LmScript(backend, { temperature: 0.0 });
const {
  captured: { mdList },
} = await model
  .user(
    "Tell me a list of 5 jokes. Answer with a markdown list, where each item of the list has a joke, in a single line.",
  )
  .assistant((m) =>
    m.gen("mdList", {
      maxTokens: 128,
      stop: "\n\n",
      regex: BULLET_LIST_REGEX,
    }),
  )
  .run();

console.log(mdList);
```

### Execute the file

Use your preferred runtime. `@lmscript/client` has no dependencies and runs everywhere.

For instance, to run using `tsx` and `node`: `npx tsx main.ts`

## UI Prompt Editor

TODO
