---
sidebar_position: 1
---

# Generation

Let the language model generate text.

Optionally, constrain the output with a regex expression.

## Generating and Capturing

```ts
const {
  captured: { joke },
} = await model
  .user("Tell me a joke")
  .assistant((m) => m.gen("joke", { maxTokens: 128 }))
  .run();
```

The captured text is available in the `captured` object.

```ts
console.log(joke);
```

```
` Why don't scientists trust atoms?

Because they make up everything!`
```

## Stop sequence

```ts
const {
  captured: { oneLine },
} = await model
  .user(
    "Tell me a joke, answer with a single paragraph (line).",
  )
  .assistant((m) =>
    m.gen("oneLine", { maxTokens: 128, stop: "\n" }),
  )
  .run();

console.log(oneLine);
```

```
` Why did the tomato turn red? Because it saw the salad dressing!`
```

## Regex Constraint

```ts
import { BULLET_LIST_REGEX } from "@lmscript/client/regex";
```

```ts
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

```
`- Why did the tomato turn red? Because it saw the salad dressing!
- Why did the scarecrow win an award? Because he was outstanding in his field!
- Why don't scientists trust atoms? Because they make up everything!
- Why did the bicycle fall over? Because it was two-tired!
- Why did the chicken cross the playground? To get to the other slide!`
```

## Generate without a name

```ts
const { captured: noNameCaptured } = await model
  .user("Tell me a joke.")
  .assistant((m) => m.gen({ maxTokens: 128 }))
  .run();

console.log(noNameCaptured);
```

```json
{}
```

## Generating with prefix

Call the `.push` method before the `.gen` method to add a prefix to the generated text.

Note that none of the backends implement [token healing](https://towardsdatascience.com/the-art-of-prompt-design-prompt-boundaries-and-token-healing-3b2448b0be38) yet.

Therefore, you must be careful with prefixes. In general, being careful **not to terminate a prefix with space** should be enough.

```ts
const {
  captured: { sureJoke },
} = await model
  .user("Tell me a joke")
  .assistant((m) =>
    m.push("Sure.").gen("sureJoke", { maxTokens: 128 }),
  )
  .run();
```

The captured text is available in the `captured` object.

```ts
console.log(sureJoke);
```

```
` Here's a classic one for you:

Why did the tomato turn red?

Because it saw the salad dressing!

I hope that brought a smile to your face! Do you have any other requests or questions? I'm here to help.`
```

## Generating without chat template

This example does not use the chat template. The result is not good, but it is just an example.

The `.gen` method can be used without chat templates, or inside a chat template role function.

```ts
const {
  captured: { continuation },
} = await model
  .push("Here is a small joke, in a single line:")
  .gen("continuation", { maxTokens: 32 })
  .run();
```

The captured text is available in the `captured` object.

```ts
console.log(continuation);
```

```
`

Why did the tomato turn red?

Because it saw the salad dressing!

This is a classic example of a pun, which is`
```
