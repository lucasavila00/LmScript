import { expect, test } from "vitest";
import { md } from "mdts";
import { ALL_CHAT_TEMPLATES } from "@lmscript/client/chat-template";

test("client/chat-templates", async () => {
  md`
    ---
    sidebar_position: 6
    ---

    # Chat Templates

    Use predefined chat templates to generate responses.

    Import the \`ALL_CHAT_TEMPLATES\` array to get a list of available templates.

    Please create an issue if you want to add a new template.

    ~~~ts
    import { ALL_CHAT_TEMPLATES } from "@lmscript/client/chat-template";
    ~~~
  `;

  expect(ALL_CHAT_TEMPLATES).toMatchInlineSnapshot(`
    [
      "mistral",
    ]
  `);
});
