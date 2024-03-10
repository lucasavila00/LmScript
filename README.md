# Work in progress.

## TODO

- [ ] handling meta_info
- [ ] handling regex

# LmScript

LmScript: Fast and Controllable Language Model Interactions in Typescript - Open
Source and Powered by [SGLang](https://github.com/sgl-project/sglang).

- LMScript: a suite of tools for easy, fast, and controllable interactions with
  language models in Typescript.
- Open models and open source.
- Powered by SGLang.

## What the code looks like?

```ts
const { captured: { language } } = await client
  .push("The best programming language is ")
  .select("language", { choices: ["javascript", "typescript"] })
  .run();

console.log(language);
```

There are more complete examples in the
[client's examples folder](https://github.com/lucasavila00/LmScript/tree/main/client/examples).

## Projects

| Project                                                                                                | Description                                                                                                          |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| [Typescript Client](https://github.com/lucasavila00/LmScript/tree/main/client)                         | Dependency-free client that can communicate with different [SGLang](https://github.com/sgl-project/sglang) backends. |
| [Runpod Serverless Docker Image](https://github.com/lucasavila00/LmScript/tree/main/runpod-serverless) | Docker image that runs SGLang on [Runpod Serverless](https://www.runpod.io/serverless-gpu).                          |
