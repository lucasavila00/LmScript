# LmScript

Easy, fast and controllable interactions with Language Models in Typescript.

LmScript is a suite of tools that allow usage of constrained generation in Typescript.

## Example

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
