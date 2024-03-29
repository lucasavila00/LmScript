# LmScript Client

Dependency-Free Typescript client for LmScript.

## Installation

Install from [NPM](https://www.npmjs.com/package/@lmscript/client)

```shell
npm i @lmscript/client
```

## Usage

TODO docs

There are more complete examples in the
[client's examples folder](https://github.com/lucasavila00/LmScript/tree/main/client/examples).

### Adding text to context

Use `.push` to add text to the context.

Use `.system`, `.user` and `.assistant` to create the messages with the required
formatting for them to be assigned to their roles.

The role functions can receive a single string that will be applied to `.push`,
or it receives a callback that passes the client object where you can call any
of the supported functions.

```ts
const { captured } = await client
  .system("You are a helpful assistant.")
  .user(question1)
  .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
  .run();
```

### Generation

Generates the text and captures it with a name.

```ts
const {
  captured: { language },
} = await client.push("The best programming language is ").gen("language").run();

console.log(language);
```

### Selection

Selects one of the choices.

```ts
const {
  captured: { language },
} = await client
  .push("The best programming language is ")
  .select("language", { choices: ["javascript", "typescript"] })
  .run();

console.log(language);
```

### Repeat

Repeats a previous capture.

```ts
const {
  captured: { language },
} = await client
  .push("The best programming language is")
  .gen("language")
  .push(". I think that ")
  .repeat("language")
  .push(" is the best language because")
  .gen("explanation", { maxTokens: 256 })
  .run();

console.log(language);
```

## Backends

### SGLang Backend

Use it with a regular
[SGLang server](https://github.com/sgl-project/sglang?tab=readme-ov-file#using-local-models).

```ts
import { LmScript } from "@lmscript/client";
import { SGLangBackend } from "@lmscript/client/backends/sglang";

const backend = new SGLangBackend(`http://localhost:30004`);
const client = new LmScript(backend, {
  template: "mistral",
  temperature: 0.1,
});
```

### Runpod Serverless Backend

Use it LmScript's
[Runpod Serverless Docker Image](https://github.com/lucasavila00/LmScript/tree/main/runpod-serverless-sglang).

```ts
import { LmScript } from "@lmscript/client";
import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";

const backend = new RunpodServerlessBackend(
  getEnvVarOrThrow("RUNPOD_URL"),
  getEnvVarOrThrow("RUNPOD_TOKEN"),
);
const client = new LmScript(backend);
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
