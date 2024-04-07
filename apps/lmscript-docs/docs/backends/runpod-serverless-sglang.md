# Runpod Serverless SGLang Backend

Connects to [LmScript adapter of SGLang backend running on Runpod Serverless](/docs/docker/runpod-serverless-sglang).

This backend minimizes the number of requests to the server.

A list of Tasks is sent to the server and the server processes them in a batch.

This guarantees a higher chance of hitting SGLang's cache.

## Import

```ts
import { LmScript } from "@lmscript/client";
import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";
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
const backend = new RunpodServerlessBackend({
  url: `http://localhost:8000`,
  template: "mistral",
  reportUsage, // Optional
  apiToken: "YOUR_API_TOKEN", // Can be undefined if running the backend locally
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
