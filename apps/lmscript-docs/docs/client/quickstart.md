---
sidebar_position: -1
---

# Quick Start

Get started with the LmScript client.

## Installation

Install from [NPM](https://www.npmjs.com/package/@lmscript/client)

```shell
npm i @lmscript/client
```

## Usage

### Import

```ts
import { LmScript } from "@lmscript/client";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
```

### Instantiate Client

The client requires a backend.

This example uses the [SGLang backend](/docs/backends/sglang)
and the [SGLang Docker image](/docs/docker/sglang).

```ts
const backend = new SGLangBackend({
  url: `http://localhost:30000`,
  template: "mistral",
});

const model = new LmScript(backend, { temperature: 0 });
```

### Use

```ts
const out = await model
  .user((m) => m.push("Tell me a joke."))
  .assistant((m) => m.gen("joke", { maxTokens: 128 }))
  // Shortcut to push a single string inside a chat role
  .user("Tell me another joke.")
  .assistant((m) => m.gen("joke2", { maxTokens: 128 }))
  .run();
```

The captured text is available in the `captured` object.

```ts
const {
  captured: { joke, joke2 },
} = out;

console.log(joke);
```

```
` Why don't scientists trust atoms?

Because they make up everything!`
```

```ts
console.log(joke2);
```

```
` Why did the scarecrow win an award?

Because he was outstanding in his field!`
```

#### Debugging

The raw text is available in the `rawText` variable.

```ts
console.log(out.rawText);
```

```
`<s>[INST] Tell me a joke. [/INST] Why don't scientists trust atoms?

Because they make up everything!</s>[INST] Tell me another joke. [/INST] Why did the scarecrow win an award?

Because he was outstanding in his field!`
```
