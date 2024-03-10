import { SglClient } from "../src/mod.ts";
import { RunpodFetcher } from "../src/runpod-serverless-fetcher.ts";
import { kitchenSink } from "./kitchen-sink.ts";

const getEnvVarOrThrow = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} not set`);
  }
  return value;
};
const bench = async () => {
  const model = new SglClient(
    new RunpodFetcher(
      getEnvVarOrThrow("RUNPOD_URL"),
      getEnvVarOrThrow("RUNPOD_TOKEN")
    ),
    {
      template: "llama-2-chat",
      temperature: 0.1,
    }
  );
  const MAX_JOBS = 1;
  const batch = Array.from({ length: MAX_JOBS }, (_, _i) =>
    kitchenSink(model).catch((e) => {
      console.error(e);
    })
  );

  const start = Date.now();
  await Promise.all(batch);
  const duration = Date.now() - start;
  console.log(`Duration: ${duration}ms`);
};

bench().catch(console.error);
