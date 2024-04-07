import { expect, test } from "vitest";
import { md } from "mdts";

import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { LmScript } from "@lmscript/client";
test("client/quickstart", async () => {
  md`
    ---
    sidebar_position: -1
    ---

    # Quick Start

    Get started with the LmScript client.

    ## Installation

    Install from [NPM](https://www.npmjs.com/package/@lmscript/client)

    ~~~shell
    npm i @lmscript/client
    ~~~

    ## Usage

    ### Import

    ~~~ts
    import { LmScript } from "@lmscript/client";
    import { SGLangBackend } from "@lmscript/client/backends/sglang";
    ~~~
  `;

  md`
    ### Instantiate Client
  `;
  const backend = new SGLangBackend({
    url: `http://localhost:30000`,
    template: "mistral",
  });
  const model = new LmScript(backend, { temperature: 0.0 });
  md`
    ### Use
  `;
  const out = await model
    .user((m) => m.push("Tell me a joke."))
    .assistant((m) => m.gen("joke", { maxTokens: 128 }))
    // Shortcut to push a single string inside a chat role
    .user("Tell me another joke.")
    .assistant((m) => m.gen("joke2", { maxTokens: 128 }))
    .run();
  md`
    The captured text is available in the \`captured\` object.
  `;

  const {
    captured: { joke, joke2 },
  } = out;
  expect(joke).toMatchInlineSnapshot(`
    " Why don't scientists trust atoms?

    Because they make up everything!"
  `);
  expect(joke2).toMatchInlineSnapshot(`
    " Why did the scarecrow win an award?

    Because he was outstanding in his field!"
  `);

  md`
    #### Debugging

    The raw text is available in the \`rawText\` variable.
  `;

  expect(out.rawText).toMatchInlineSnapshot(`
    "<s>[INST] Tell me a joke. [/INST] Why don't scientists trust atoms?

    Because they make up everything!</s>[INST] Tell me another joke. [/INST] Why did the scarecrow win an award?

    Because he was outstanding in his field!"
  `);
});
