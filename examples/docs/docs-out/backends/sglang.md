# SGLang Backend

Connects to a local SGLang backend.

```ts
import { LmScript } from "@lmscript/client";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
```

```ts
let promptTokens = 0;

let completionTokens = 0;

const reportUsage: ReportUsage = (usage) => {
  promptTokens += usage.promptTokens;
  completionTokens += usage.completionTokens;
};

const backend = new SGLangBackend({
  url: `http://localhost:30000`,
  template: "mistral",
  reportUsage, // Optional
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
