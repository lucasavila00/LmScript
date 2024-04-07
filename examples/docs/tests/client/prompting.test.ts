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
test("client/prompting", async () => {
  md`
    ---
    sidebar_position: 0
    ---

    # Prompting

    Add texts to the conversation.
  `;
  md`
    ## No chat role
  `;
  const { rawText } = await model
    .push("Some text...\n")
    .push("And more text")
    .run();
  md`
    The raw text is available in the \`rawText\` variable.
  `;
  expect(rawText).toMatchInlineSnapshot(`
    "Some text...
    And more text"
  `);
  md`
    ## With chat role
  `;
  const { rawText: rawTextChat } = await model
    .user((m) => m.push("Some text...\n"))
    // Shortcut to push a single string inside a chat role
    .assistant("And more text")
    .run();
  md`
    The raw text is available in the \`rawText\` variable.
  `;
  expect(rawTextChat).toMatchInlineSnapshot(`
    "<s>[INST] Some text...
     [/INST]And more text"
  `);
}, 60_000);
