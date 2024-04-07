---
sidebar_position: 5
---

# Sampling Parameters

## Instance Parameters

Set default sampling parameters for the model when creating an instance.

```ts
const model = new LmScript(backend, {
  temperature: 0, // required
  top_p: 0.3, // optional
  top_k: 20, // optional
  frequency_penalty: 0, // optional
  presence_penalty: 0, // optional
});
```

## Execution Parameters

Override the default sampling parameters for a specific execution.

```ts
await model
  .user("Tell me a joke.")
  .assistant((m) =>
    m.gen("joke", {
      maxTokens: 128,
    }),
  )
  .run({
    temperature: 0, // optional
    top_p: 0.3, // optional
    top_k: 20, // optional
    frequency_penalty: 0, // optional
    presence_penalty: 0, // optional
  });
```
