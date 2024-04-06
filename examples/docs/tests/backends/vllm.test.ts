import { test, expect } from "vitest";
import { md } from "mdts";
import { VllmBackend } from "@lmscript/client/backends/vllm";
import { LmScript } from "@lmscript/client";
import { ReportUsage } from "@lmscript/client/backends/abstract";

test("backends/vllm", async () => {
  md`
    # vLLM Backend

    Connects to a local or remote vLLM backend.

    Uses the OpenAI compatible API.

    ~~~ts
    import { LmScript } from "@lmscript/client";
    import { VllmBackend } from "@lmscript/client/backends/vllm";
    ~~~
  `;
  let promptTokens = 0;
  let completionTokens = 0;
  const reportUsage: ReportUsage = (usage) => {
    promptTokens += usage.promptTokens;
    completionTokens += usage.completionTokens;
  };
  const backend = new VllmBackend({
    url: `http://localhost:8000`,
    template: "mistral",
    reportUsage, // Optional
    model: "TheBloke/Mistral-7B-Instruct-v0.2-AWQ",
    auth: "YOUR_API_KEY", // Can be undefined if running the backend locally
  });
  const model = new LmScript(backend, { temperature: 0.0 });
  const { captured, rawText } = await model
    .user("Tell me a joke.")
    .assistant((m) => m.gen("joke", { maxTokens: 128 }))
    .run();

  expect(captured.joke).toMatchInlineSnapshot(`
    " Why don't scientists trust atoms?

    Because they make up everything!"
  `);

  expect(rawText).toMatchInlineSnapshot(`
    "<s>[INST] Tell me a joke. [/INST] Why don't scientists trust atoms?

    Because they make up everything!"
  `);

  expect(promptTokens).toMatchInlineSnapshot(`14`);
  expect(completionTokens).toMatchInlineSnapshot(`17`);
});
