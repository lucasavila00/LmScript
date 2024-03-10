# LmScript

LmScript: Fast and Controllable Language Model Interactions in Typescript - Open Source and Powered by SGLang

- LMScript: a suite of tools for easy, fast, and controllable interactions with language models in Typescript.
- Open models and open source.
- Powered by SGLang.

## How the code looks like?

```ts
const toolUse = async (model: InitClient, question: string) => {
  const [captured, thread] = await model
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
```

## Usage

### todo

- [ ] install client dependency
- [ ] start a server, sglang raw or runpod
