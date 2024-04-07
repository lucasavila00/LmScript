import { test, expect } from "vitest";
import { md } from "mdts";
import { VllmBackend } from "@lmscript/client/backends/vllm";
import { LmScript } from "@lmscript/client";
import { ReportUsage } from "@lmscript/client/backends/abstract";

test("backends/vllm", async () => {
  md`
    # vLLM Backend

    Connects to a local vLLM or remote vLLM backend.

    It supports both Docker images:

    - [vLLM](https://github.com/lucasavila00/LmScript/tree/main/docker/vllm)
    - [Runpod Serverless vLLM](https://github.com/lucasavila00/LmScript/tree/main/docker/runpod-serverless-vllm)

    Uses the OpenAI compatible API.

    ## Import

    ~~~ts
    import { LmScript } from "@lmscript/client";
    import { VllmBackend } from "@lmscript/client/backends/vllm";
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
  const backend = new VllmBackend({
    url: `http://localhost:8000`,
    template: "mistral",
    reportUsage, // Optional
    model: "TheBloke/Mistral-7B-Instruct-v0.2-AWQ",
    auth: "YOUR_API_KEY", // Can be undefined if running the backend locally
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
