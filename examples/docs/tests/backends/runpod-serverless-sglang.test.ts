import { test, expect } from "vitest";
import { md } from "../../../../internal-packages/mdts/src";
import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";
import { LmScript } from "@lmscript/client";
import { ReportUsage } from "@lmscript/client/backends/abstract";

test("backends/runpod-serverless-sglang", async () => {
  md`
    # Runpod Serverless SGLang Backend

    Connects to [LmScript adapter of SGLang backend running on Runpod Serverless](https://github.com/lucasavila00/LmScript/tree/main/docker/runpod-serverless-sglang).

    This backend minimizes the number of requests to the server.

    A list of Tasks is sent to the server and the server processes them in a batch.

    This guarantees a higher chance of hitting SGLang's cache.

    ## Import

    ~~~ts
    import { LmScript } from "@lmscript/client";
    import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";
    ~~~
  `;
  md`
    ## Optionally setup usage tracking
  `;
  let promptTokens = 0;
  let completionTokens = 0;
  const reportUsage: ReportUsage = (usage) => {
    promptTokens += usage.promptTokens;
    completionTokens += usage.completionTokens;
  };
  md`
    ## Instantiate
  `;
  const backend = new RunpodServerlessBackend({
    url: `http://localhost:8000`,
    template: "mistral",
    reportUsage, // Optional
    apiToken: "YOUR_API_TOKEN", // Can be undefined if running the backend locally
  });
  md`
    ## Use
  `;
  const model = new LmScript(backend, { temperature: 0.0 });
  const { captured, rawText } = await model
    .user("Tell me a joke.")
    .assistant((m) => m.gen("joke", { maxTokens: 128 }))
    .run();

  md`
    The captured text is available in the \`captured\` object.
  `;

  expect(captured.joke).toMatchInlineSnapshot(`
    " Why don't scientists trust atoms?

    Because they make up everything!"
  `);

  md`
    The raw text is available in the \`rawText\` variable.
  `;

  expect(rawText).toMatchInlineSnapshot(`
    "<s>[INST] Tell me a joke. [/INST] Why don't scientists trust atoms?

    Because they make up everything!"
  `);

  md`
    The promptTokens and completionTokens have been updated by the \`reportUsage\` function.
  `;

  expect(promptTokens).toMatchInlineSnapshot(`14`);
  expect(completionTokens).toMatchInlineSnapshot(`17`);
});
