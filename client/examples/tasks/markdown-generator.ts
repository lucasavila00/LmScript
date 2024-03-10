import { InitClient } from "../../src/mod.ts";

class MarkdownList {
  readonly #client: InitClient;
  #ai: InitClient;
  constructor(client: InitClient) {
    this.#client = client;
    this.#ai = this.#client;
  }

  listItemOrStop(ai: InitClient) {
    return ai
      .select("list_item", {
        choices: ["\n- ", "</s>"],
      })
      .match("list_item")({
      "\n- ": (c) =>
        c.gen("list_item_content", { maxTokens: 256, stop: ["\n"] }),
      "</s>": (c) => c.castGenerated("list_item_content"),
    });
  }

  async generateList(content: string) {
    let base = this.#ai
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
      const [{ list_item, list_item_content }, ai] = await this.listItemOrStop(
        base
      ).run();
      if (list_item === "</s>") {
        break;
      }
      console.log(`- ${list_item_content.trim()}`);
      base = ai;
      acc.push(list_item_content.trim());
    }

    return acc;
  }
}

const generateHeading = (client: InitClient, content: string) => {
  return client
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
};

export const generateMarkdown = async (client: InitClient, content: string) => {
  // const client = new LmScript(`http://localhost:30004`, {
  //   template: "llama-2-chat",
  //   temperature: 0.01,
  // });

  const [{ heading }] = await generateHeading(client, content).run();
  console.log(`${heading.trim()}\n`);

  const items = await new MarkdownList(client).generateList(content);

  const out = items.map((item) => `- ${item}`).join("\n");

  return `${heading.trim()}

${out}`;
};
