---
sidebar_position: 0
---

# Prompting

Add texts to the conversation.

## No chat role

```ts
const { rawText } = await model
  .push("Some text...\n")
  .push("And more text")
  .run();
```

The raw text is available in the `rawText` variable.

```ts
console.log(rawText);
```

```
`Some text...
And more text`
```

## With chat role

```ts
const { rawText: rawTextChat } = await model
  .user((m) => m.push("Some text...\n"))
  // Shortcut to push a single string inside a chat role
  .assistant("And more text")
  .run();
```

The raw text is available in the `rawText` variable.

```ts
console.log(rawTextChat);
```

```
`<s>[INST] Some text...
 [/INST]And more text`
```
