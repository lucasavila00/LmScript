import { LmScript } from "../src/mod.ts";
import { kitchenSink } from "./kitchen-sink.ts";
import { VllmBackend } from "../src/backends/vllm.ts";

const bench = async () => {
  let promptTokens = 0;
  let completionTokens = 0;
  const backend = new VllmBackend(
    {
      url: `http://localhost:8000`,
      model: "TheBloke/Mistral-7B-Instruct-v0.2-GPTQ",
      reportUsage: ({ promptTokens: pt, completionTokens: ct }) => {
        promptTokens += pt;
        completionTokens += ct;
      },
    },
  );
  const model = new LmScript(
    backend,
    {
      template: "llama-2-chat",
      temperature: 0.1,
    },
  );
  // const { captured } = await model
  //   .user((c) => c.push("What is 1+1"))
  //   .assistant(
  //     (c) => c.gen("answer"),
  //   ).run();
  // console.log(captured);
  // throw new Error("not implemented");
  const batch = Array.from(
    { length: 1 },
    (_, _i) =>
      kitchenSink(model).catch((e) => {
        console.error(e);
      }),
  );

  const start = Date.now();
  await Promise.all(batch);
  const duration = Date.now() - start;
  console.log(`Duration: ${duration}ms`);
  console.log(`Prompt tokens: ${promptTokens}`);
  console.log(`Completion tokens: ${completionTokens}`);
};

bench().catch(console.error);
