# vLLM Backend

Connects to a local or remote vLLM backend.

Uses the OpenAI compatible API.

```ts
import { LmScript } from "@lmscript/client";
import { VllmBackend } from "@lmscript/client/backends/vllm";
```

```ts
let promptTokens = 0;

let completionTokens = 0;

const reportUsage: ReportUsage = (usage) => {
  promptTokens += usage.promptTokens;
  completionTokens += usage.completionTokens;
};

const backend = new VllmBackend({
  url: `http://localhost:8000`,
  template: "mistral",
  reportUsage, // Optional
  model: "TheBloke/Mistral-7B-Instruct-v0.2-AWQ",
  auth: "YOUR_API_KEY", // Can be undefined if running the backend locally
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
