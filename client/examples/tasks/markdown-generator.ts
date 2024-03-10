import { InitClient } from "../../src/mod.ts";

const listItemOrStop = (ai: InitClient) =>
  ai
    .select("list_item", {
      choices: ["\n- ", ai.eos()],
    })
    .match("list_item")({
    "\n- ": (c) => c.gen("list_item_content", { maxTokens: 256, stop: ["\n"] }),
    [ai.eos()]: (c) => c.castGenerated("list_item_content"),
  });
const generateMarkdownList = async (client: InitClient, content: string) => {
  let state = client
    .user((c) =>
      c.push(
        `Generate a flat markdown list summarizing the following content.
A reminder: a markdown list is a list of items, each item starts with a hyphen and a space, followed by the content of the item. For example:

- This is the first item, it's a list of items.
- This is the second item.
- This is the third item.

## Notice

Do not make up any content, use the content provided below.

## Content
${content}
`
      )
    )
    .startRole("assistant")
    .push("Sure, here's a markdown list summarizing the content above:\n");

  const acc: string[] = [];

  while (true) {
    const {
      captured: { list_item, list_item_content },
      state: ai,
    } = await listItemOrStop(state).run();
    if (list_item === ai.eos()) {
      break;
    }
    state = ai;
    acc.push(list_item_content.trim());
  }

  return acc;
};

const generateHeading = (client: InitClient, content: string) =>
  client
    .user((c) =>
      c.push(
        `Generate a heading summarizing the following content.
        
## Content
${content}
`
      )
    )
    .assistant((c) =>
      c.push(`Heading: "`).gen("heading", { maxTokens: 256, stop: ['"'] })
    );

export const generateMarkdown = async (client: InitClient, content: string) => {
  const {
    captured: { heading },
  } = await generateHeading(client, content).run({
    temperature: 0.01,
  });

  const items = await generateMarkdownList(client, content);

  const out = items.map((item) => `- ${item}`).join("\n");

  return `${heading.trim()}

${out}`;
};
