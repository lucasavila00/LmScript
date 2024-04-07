import { expect, test } from "vitest";
import { md } from "mdts";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { LmScript } from "@lmscript/client";
test(
  "client/roles",
  async () => {
    md`
      ---
      sidebar_position: 3
      ---

      # Chat Roles

      Use \`.system\`, \`.user\`, and \`.assistant\` to define conversation roles.
    `;

    md`
      ## Usage

      ~~~ts
      model
        .system("Some system text...")
        .user("Some user text...")
        .assistant("Some assistant text...")
        .run();
      ~~~
    `;

    md`
      ## Callbacks

      Use the callback function to perform additional operations.

      The callback function receives the model instance as an argument.

      The model instance is supports all methods of the LmScript class.
    `;

    const model = new LmScript(
      new SGLangBackend({
        url: `http://localhost:30000`,
        template: "mistral",
      }),
      { temperature: 0.0 }
    );
    const { rawText } = await model
      .user((m) => m.push("Tell me a joke."))
      .assistant((m) => m.push("Sure.").gen("response", { maxTokens: 128 }))
      .run();

    expect(rawText).toMatchInlineSnapshot(`
    "<s>[INST] Tell me a joke. [/INST]Sure. Here's a classic one for you:

    Why did the tomato turn red?

    Because it saw the salad dressing!

    I hope that brought a smile to your face! Do you have any other requests or questions? I'm here to help."
  `);
  },
  {
    timeout: 60_000,
  }
);
