import { test, expect } from "vitest";
import { md } from "mdts";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { LmScript } from "@lmscript/client";
import { ReportUsage } from "@lmscript/client/backends/abstract";

test("backends/sglang", async () => {
  md`
    # SGLang Backend

    Connects to a local SGLang backend.

    Can be used with the provided [SGLang Docker image](https://github.com/lucasavila00/LmScript/tree/main/docker/sglang-docker).

    ## Import

    ~~~ts
    import { LmScript } from "@lmscript/client";
    import { SGLangBackend } from "@lmscript/client/backends/sglang";
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
  const backend = new SGLangBackend({
    url: `http://localhost:30000`,
    template: "mistral",
    reportUsage, // Optional
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
