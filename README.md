# LmScript

LmScript: Fast and Controllable Language Model Interactions

- LMScript: a suite of tools for easy, fast, and controllable interactions with
  language models.
- Open models and open source.
- Supports [SGLang](https://github.com/sgl-project/sglang/) and
  [vLLM](https://github.com/vllm-project/vllm)
  ([Outlines](https://github.com/outlines-dev/outlines)).

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

## Do you prefer a graphical interface?

[![screenshot of lmscript ui](./assets/app.png)](https://github.com/lucasavila00/LmScript/tree/main/egui)

## Projects

| Project                                                                                                 | Description                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Typescript Client](https://github.com/lucasavila00/LmScript/tree/main/client)                          | Dependency-free client that can communicate with different backends.                                                                                                                     |
| [GUI](https://github.com/lucasavila00/LmScript/tree/main/egui)                                          | Desktop Application that creates and executes LmScript programs.                                                                                                                         |
| [Runpod Serverless SGLang](https://github.com/lucasavila00/LmScript/tree/main/runpod-serverless-sglang) | Docker image that runs [SGLang](https://github.com/sgl-project/sglang/) on [Runpod Serverless](https://www.runpod.io/serverless-gpu).                                                    |
| [Runpod Serverless vLLM](https://github.com/lucasavila00/LmScript/tree/main/runpod-serverless-vllm)     | Docker image that runs [vLLM](https://github.com/vllm-project/vllm) ([Outlines](https://github.com/outlines-dev/outlines)) on [Runpod Serverless](https://www.runpod.io/serverless-gpu). |
