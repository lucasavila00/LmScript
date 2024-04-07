---
sidebar_position: 2
---

# Selection

Let the language model choose an option from a list of choices.

:::note

The SGLang backend is is implemented by computing the normalized
log probabilities of all choices and selecting the one with the highest probability.

The vLLM backend is implemented through autoregressive decoding with logit bias masking,
according to the constraints set by the regex.

This means that SGLang is slower but produces better results.
:::

## Usage

```ts
const {
  captured: { bestLanguage },
} = await model
  .push("The best programming language is ")
  .select("bestLanguage", {
    choices: ["Python", "JavaScript", "Java", "C++", "C#"],
  })
  .run();
```

The captured text is available in the `captured` object.

```ts
console.log(bestLanguage);
```

```
`C++`
```

## Selecting without a name

```ts
const { captured, rawText } = await model
  .push("The best programming language is ")
  .select({
    choices: ["Python", "JavaScript", "Java", "C++", "C#"],
  })
  .run();

console.log(captured);
```

```json
{}
```

```ts
console.log(rawText);
```

```
`The best programming language is C++`
```

## Using regex for selection

Use to make the SGLang backend work like the vLLM backend.

```ts
const {
  captured: { jsOrTs },
} = await model
  .push("The best programming language is ")
  .gen("jsOrTs", {
    regex: "(JavaScript|TypeScript)",
  })
  .run();

console.log(jsOrTs);
```

```
`JavaScript`
```
