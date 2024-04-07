import { test } from "vitest";
import { md } from "mdts";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { LmScript } from "@lmscript/client";

const backend = new SGLangBackend({
  url: `http://localhost:30000`,
  template: "mistral",
});

test("client/sampling-params", async () => {
  md`
    ---
    sidebar_position: 5
    ---

    # Sampling Parameters
  `;

  md`
    ## Instance Parameters

    Set default sampling parameters for the model when creating an instance.
  `;

  const model = new LmScript(backend, {
    temperature: 0.0, // required
    top_p: 0.3, // optional
    top_k: 20, // optional
    frequency_penalty: 0.0, // optional
    presence_penalty: 0.0, // optional
  });

  md`
    ## Execution Parameters

    Override the default sampling parameters for a specific execution.
  `;

  await model
    .user("Tell me a joke.")
    .assistant((m) =>
      m.gen("joke", {
        maxTokens: 128,
      })
    )
    .run({
      temperature: 0.0, // optional
      top_p: 0.3, // optional
      top_k: 20, // optional
      frequency_penalty: 0.0, // optional
      presence_penalty: 0.0, // optional
    });
});
