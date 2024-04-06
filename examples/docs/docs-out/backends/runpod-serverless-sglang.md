# Runpod Serverless SGLang Backend

Connects to SGLang backend running on Runpod Serverless.

This backend minimizes the number of requests to the server.
A list of Tasks is sent to the server and the server processes them in a batch.
This guarantees a higher chance of hitting the SGLang's cache.

```ts
import { LmScript } from "@lmscript/client";
import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";
```

```ts
let promptTokens = 0;

let completionTokens = 0;

const reportUsage: ReportUsage = (usage) => {
  promptTokens += usage.promptTokens;
  completionTokens += usage.completionTokens;
};

const backend = new RunpodServerlessBackend({
  url: `http://localhost:8000`,
  template: "mistral",
  reportUsage, // Optional
  apiToken: "YOUR_API_TOKEN", // Can be undefined if running the backend locally
});

const model = new LmScript(backend, { temperature: 0 });

const { captured, rawText } = await model
  .user("Tell me a joke.")
  .assistant((m) => m.gen("joke", { maxTokens: 128 }))
  .run();

console.log(captured.joke);
```

```js
" Why don't scientists trust atoms?

Because they make up everything!"
```

```ts
console.log(rawText);
```

```js
"<s>[INST] Tell me a joke. [/INST] Why don't scientists trust atoms?

Because they make up everything!"
```

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
