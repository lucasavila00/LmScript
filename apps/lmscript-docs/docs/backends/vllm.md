# vLLM Backend

Connects to a local vLLM or remote vLLM backend.

It supports both Docker images:

- [vLLM](/docs/docker/vllm)
- [Runpod Serverless vLLM](/docs/docker/runpod-serverless-vllm)

Uses the OpenAI compatible API.

## Import

```ts
import { LmScript } from "@lmscript/client";
import { VllmBackend } from "@lmscript/client/backends/vllm";
```

## Optionally setup usage tracking

```ts
let promptTokens = 0;

let completionTokens = 0;

const reportUsage: ReportUsage = (usage) => {
  promptTokens += usage.promptTokens;
  completionTokens += usage.completionTokens;
};
```

## Instantiate

```ts
const backend = new VllmBackend({
  url: `http://localhost:8000`,
  template: "mistral",
  reportUsage, // Optional
  model: "TheBloke/Mistral-7B-Instruct-v0.2-AWQ",
  auth: "YOUR_API_KEY", // Can be undefined if running the backend locally
});
```

## Use

```ts
const model = new LmScript(backend, { temperature: 0 });

const { captured, rawText } = await model
  .user("Tell me a joke.")
  .assistant((m) => m.gen("joke", { maxTokens: 128 }))
  .run();
```

The captured text is available in the `captured` object.

```ts
console.log(captured.joke);
```

```
` Why don't scientists trust atoms?

Because they make up everything!`
```

The raw text is available in the `rawText` variable.

```ts
console.log(rawText);
```

```
`<s>[INST] Tell me a joke. [/INST] Why don't scientists trust atoms?

Because they make up everything!`
```

The promptTokens and completionTokens have been updated by the `reportUsage` function.

```ts
console.log(promptTokens);
```

```json
14
```

```ts
console.log(completionTokens);
```

```json
17
```
