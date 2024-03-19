import { LmScript } from "../src/mod.ts";
import { RunpodServerlessBackend } from "../src/backends/runpod-serverless-sglang.ts";
import { kitchenSink } from "./kitchen-sink.ts";
import { delay } from "../src/utils.ts";

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
  const model = new LmScript(
    new RunpodServerlessBackend(
      getEnvVarOrThrow("RUNPOD_URL"),
      getEnvVarOrThrow("RUNPOD_TOKEN"),
      {
        reportUsage: ({ promptTokens: pt, completionTokens: ct }) => {
          promptTokens += pt;
          completionTokens += ct;
        },
      }
    ),
    {
      template: "llama-2-chat",
      temperature: 0.1,
    }
  );
  let errors = 0;
  const MAX_JOBS = 1;
  const batch = Array.from({ length: MAX_JOBS }, async (_, _i) => {
    await delay(Math.random() * 1000);
    return kitchenSink(model).catch((e) => {
      errors++;
      console.error(e);
    });
  });

  const start = Date.now();
  await Promise.all(batch);
  const duration = Date.now() - start;
  console.log(`Duration: ${duration}ms`);
  console.log(`Prompt tokens: ${promptTokens}`);
  console.log(`Completion tokens: ${completionTokens}`);

  if (errors > 0) {
    console.error(`Errors: ${errors}`);
  }
};

bench().catch(console.error);
