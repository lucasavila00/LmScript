import { LmScript } from "@lmscript/client";
import { kitchenSink } from "./tasks/kitchen-sink";
import { RtBackend } from "@lmscript/client/backends/rt";

const bench = async () => {
  let promptTokens = 0;
  let completionTokens = 0;
  const backend = new RtBackend({
    url: `http://localhost:1234`,
    model: "TheBloke/Mistral-7B-Instruct-v0.2-AWQ",
    reportUsage: ({ promptTokens: pt, completionTokens: ct }) => {
      promptTokens += pt;
      completionTokens += ct;
    },
    template: "mistral",
  });
  const model = new LmScript(backend, {
    temperature: 0.1,
  });
  // const { captured } = await model
  //   .user((c) => c.push("What is 1+1"))
  //   .assistant(
  //     (c) => c.gen("answer"),
  //   ).run();
  // console.log(captured);
  // throw new Error("not implemented");
  const batch = Array.from({ length: 1 }, (_, _i) =>
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
