import { LmScript } from "../src/mod.ts";
import { kitchenSink } from "./kitchen-sink.ts";
import { VllmBackend } from "../src/backends/vllm.ts";

const getEnvVarOrThrow = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} not set`);
  }
  return value;
};
const bench = async () => {
  let promptTokens = 0;
  let completionTokens = 0;
  const backend = new VllmBackend({
    url: getEnvVarOrThrow("RUNPOD_URL"),
    auth: getEnvVarOrThrow("RUNPOD_TOKEN"),
    model:
      "/runpod-volume/huggingface-cache/hub/models--mistralai--Mistral-7B-Instruct-v0.2/snapshots/cf47bb3e18fe41a5351bc36eef76e9c900847c89",
    reportUsage: ({ promptTokens: pt, completionTokens: ct }) => {
      promptTokens += pt;
      completionTokens += ct;
    },
  });
  const model = new LmScript(backend, {
    template: "llama-2-chat",
    temperature: 0.1,
  });
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
