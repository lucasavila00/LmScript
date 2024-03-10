import { LmScript } from "../src/mod.ts";
import { kitchenSink } from "./kitchen-sink.ts";

const bench = async () => {
  const model = new LmScript(`http://localhost:30004`, {
    template: "llama-2-chat",
    temperature: 0.1,
  });
  const batch = Array.from({ length: 1 }, (_, _i) =>
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
