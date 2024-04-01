import type { InitClient } from "@lmscript/client";
export default (client: InitClient, variable1: string) =>
  client
    .user((m) =>
      m
        .push(
          "# LmScript GUI Tutorial\n\nLmScript GUI allows you to create documents that will be completed by AI.\n\nThe editor allows you to create different formatting options, which are rendered as Markdown when sent to the AI.\n\nYou can create:\n\n# Heading 1\n\n## Heading 2\n\n### Heading 3\n\nYou can create a horizontal separator:\n\n\n\n----\n\nBullet list:\n\n- Item A\n- Item B\n\nAnd also a numbered list\n\n1. Item A\n2. Item B\n\nBesides the regular rich text editing, there are other features.\n\nYou can use a variable. Make sure to configure it on the right-side-bar.\n\n",
        )
        .push(variable1)
        .push("\n\nBefore we get to the AI parts, let's change the current message author."),
    )
    .assistant((m) =>
      m
        .push(
          "We can use AI to generate content, ending on a new line, or any stop pattern we'd like:\n\nWe can start the line and ",
        )
        .gen("generation2", { maxTokens: 16, stop: ["\n"] })
        .push('\n\nAnd we can choose among a set of options:\n\n"The best programming language is ')
        .select("select1", { choices: ["javascript", "typescript"] })
        .push(
          '"\n\nRemember: You can type / to open the suggestion menu, or click on the icons to the left of the paragraph!',
        ),
    );
