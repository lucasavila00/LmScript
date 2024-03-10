# SGJS

JS/TS Client for SGLang.

SGLang is a structured generation language designed for large language models
(LLMs). It makes your interaction with models faster and more controllable.
Learn more at the [SGLang repository](https://github.com/sgl-project/sglang)

## Getting started

1. Start the SGLang server. Follow
   [SGLang instructions](https://github.com/sgl-project/sglang?tab=readme-ov-file#backend-sglang-runtime-srt)

2. Create a JS client instance

```ts
const client = new SglClient({
  url: `http://localhost:30005`,
});
```

3. Use the client to generate and capture texts

```ts
const [_, captured, conversation] = await model
  .push(`<s> [INST] What is the sum of 2 + 2? Answer shortly. [/INST] `)
  .gen("expression", { maxTokens: 512 })
  .run({ temperature: 0.1 });
console.log(conversation);
console.log(captured.expression);
```

## Examples

### Tool Use

The following examples makes use of the select feature.

```ts
const toolUse = async (client: InitClient, question: string) => {
  const [thread, captured] = await client
    .push(`To answer this question: ${question}. `)
    .push(`I need to use a `)
    .select("tool", {
      choices: ["calculator", "search engine"],
    })
    .push(`. `)
    .run();

  switch (captured.tool) {
    case "calculator":
      return thread.push(`The math expression is `).gen("expression").run();
    case "search engine":
      return thread.push(`The key word to search is `).gen("word").run();
    default:
      return assertIsNever(captured.tool);
  }
};

const [continuationThread, captured, conversation] = await toolUse(
  client,
  "What is 2 + 2?",
);
```

### Multi Turn Question

The following example makes use of the roles feature

```ts
const client = new SglClient({
  url: `http://localhost:30005`,
  template: "llama-2-chat", // This is required if using chat roles
});
const multiTurnQuestion = (
  client: InitClient,
  question1: string,
  question2: string,
) =>
  client
    .system((m) => m.push("You are a helpful assistant."))
    .user((m) => m.push(question1))
    .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
    .user((m) => m.push(question2))
    .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
    .run();

const [continuationThread, captured, conversation] = await multiTurnQuestion(
  client,
  "What is 2 + 2?",
  "What is 3 + 3?",
);
console.log(conversation);
console.log(captured);
```

### Character Generation

The following example makes use of the regex feature.

```ts
const characterRegex = `\\{
  "name": "[\\w\\d\\s]{1,16}",
  "house": "(Gryffindor|Slytherin|Ravenclaw|Hufflepuff)",
  "blood status": "(Pure-blood|Half-blood|Muggle-born)",
  "occupation": "(student|teacher|auror|ministry of magic|death eater|order of the phoenix)",
  "wand": \\{
    "wood": "[\\w\\d\\s]{1,16}",
    "core": "[\\w\\d\\s]{1,16}",
    "length": [0-9]{1,2}\\.[0-9]{0,2}
  \\},
  "patronus": "[\\w\\d\\s]{1,16}",
  "alive": "(Alive|Deceased)",
  "bogart": "[\\w\\d\\s]{1,16}"
\\}`;
const characterGen = (client: InitClient, name: string) =>
  client
    .push(
      `${name} is a character in Harry Potter. Please fill in the following information about this character.\n`,
    )
    .gen("json_output", { maxTokens: 256, regex: characterRegex });

const [threadContinuation, captured, conversation] = await characterGen(
  client,
  "Harry Potter",
).run({
  temperature: 0,
});

console.log(conversation);
console.log(cap);
```
