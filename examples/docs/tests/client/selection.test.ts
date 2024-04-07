import { expect, test } from "vitest";
import { md } from "mdts";

import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { LmScript } from "@lmscript/client";
const model = new LmScript(
  new SGLangBackend({
    url: `http://localhost:30000`,
    template: "mistral",
  }),
  { temperature: 0.0 }
);
test(
  "client/selection",
  async () => {
    md`
      ---
      sidebar_position: 2
      ---

      # Selection

      Let the language model choose an option from a list of choices.

      :::note

      The SGLang backend is is implemented by computing the normalized
      log probabilities of all choices and selecting the one with the highest probability.

      The vLLM backend is implemented through autoregressive decoding with logit bias masking,
      according to the constraints set by the regex.

      This means that SGLang is slower but produces better results.
      :::
    `;
    md`
      ## Usage
    `;
    const {
      captured: { bestLanguage },
    } = await model
      .push("The best programming language is ")
      .select("bestLanguage", {
        choices: ["Python", "JavaScript", "Java", "C++", "C#"],
      })
      .run();
    md`
      The captured text is available in the \`captured\` object.
    `;
    expect(bestLanguage).toMatchInlineSnapshot(`"C++"`);

    md`
      ## Selecting without a name
    `;
    const { captured, rawText } = await model
      .push("The best programming language is ")
      .select({
        choices: ["Python", "JavaScript", "Java", "C++", "C#"],
      })
      .run();

    expect(captured).toMatchInlineSnapshot(`{}`);
    expect(rawText).toMatchInlineSnapshot(
      `"The best programming language is C++"`
    );

    md`
      ## Using regex for selection

      Use to make the SGLang backend work like the vLLM backend.
    `;
    const {
      captured: { jsOrTs },
    } = await model
      .push("The best programming language is ")
      .gen("jsOrTs", {
        regex: "(JavaScript|TypeScript)",
      })
      .run();

    expect(jsOrTs).toMatchInlineSnapshot(`"JavaScript"`);
  },
  {
    timeout: 60_000,
  }
);
