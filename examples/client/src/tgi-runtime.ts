import { LmScript } from "@lmscript/client";
import { kitchenSink } from "./tasks/kitchen-sink";
import { TgiBackend } from "@lmscript/client/backends/tgi";

const bench = async () => {
  let promptTokens = 0;
  let completionTokens = 0;
  const backend = new TgiBackend({
    url: `https://suh51yx1k8f3wgk3.eu-west-1.aws.endpoints.huggingface.cloud`,
    reportUsage: ({ promptTokens: pt, completionTokens: ct }) => {
      promptTokens += pt;
      completionTokens += ct;
    },
    template: "mistral",
  });
  const model = new LmScript(backend, {
    temperature: 0.1,
  });
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
