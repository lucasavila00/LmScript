import { expect, test } from "vitest";
import { parseMarkdownUnbound } from "../../src/lib/parse-markdown";
import dedent from "dedent";

const parseMarkdown = (text: string) =>
  parseMarkdownUnbound(text, {
    randomUUID: () => "uuid",
  });
test("parses heading", () => {
  const out = parseMarkdown(dedent`
    # Hello
    
    ## World

    ### third

    #### fourth

    ##### fifth

    ###### sixth
`);
  expect(out).toMatchInlineSnapshot(`
    [
      {
        "content": "Hello",
        "level": 1,
        "tag": "heading",
        "uuid": "uuid",
      },
      {
        "content": "World",
        "level": 2,
        "tag": "heading",
        "uuid": "uuid",
      },
      {
        "content": "third",
        "level": 3,
        "tag": "heading",
        "uuid": "uuid",
      },
      {
        "content": "fourth",
        "level": 4,
        "tag": "heading",
        "uuid": "uuid",
      },
      {
        "content": "fifth",
        "level": 5,
        "tag": "heading",
        "uuid": "uuid",
      },
      {
        "content": "sixth",
        "level": 6,
        "tag": "heading",
        "uuid": "uuid",
      },
    ]
  `);
});

test("parses heading and paragraph with a single line break", () => {
  const out = parseMarkdown(dedent`
    # Hello
    world
`);
  expect(out).toMatchInlineSnapshot(`
    [
      {
        "content": "Hello",
        "level": 1,
        "tag": "heading",
        "uuid": "uuid",
      },
      {
        "content": "world",
        "tag": "paragraph",
        "uuid": "uuid",
      },
    ]
  `);
});

test("parses unordered list", () => {
  const out = parseMarkdown(dedent`
    - Hello
    - world
`);
  expect(out).toMatchInlineSnapshot(`
    [
      {
        "items": [
          "Hello",
          "world",
        ],
        "ordered": false,
        "tag": "list",
        "uuid": "uuid",
      },
    ]
  `);
});

test("parses ordered list", () => {
  const out = parseMarkdown(dedent`
    1. Hello
    2. world
`);
  expect(out).toMatchInlineSnapshot(`
    [
      {
        "items": [
          "Hello",
          "world",
        ],
        "ordered": true,
        "tag": "list",
        "uuid": "uuid",
      },
    ]
  `);
});
const SAMPLE1 = `### Adding text to context

Use \`.push\` to add text to the context.

Use \`.system\`, \`.user\` and \`.assistant\` to create the messages with the required
formatting for them to be assigned to their roles.

The role functions can receive a single string that will be applied to \`.push\`,
or it receives a callback that passes the client object where you can call any
of the supported functions.

\`\`\`ts
const { captured } = await client
  .system("You are a helpful assistant.")
  .user(question1)
  .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
  .run();
\`\`\`

### Generation

Generates the text and captures it with a name.

\`\`\`ts
const {
  captured: { language },
} = await client.push("The best programming language is ").gen("language").run();

console.log(language);
\`\`\`

### Selection

Selects one of the choices.

\`\`\`ts
const {
  captured: { language },
} = await client
  .push("The best programming language is ")
  .select("language", { choices: ["javascript", "typescript"] })
  .run();

console.log(language);
\`\`\``;
test("parses ordered list", () => {
  const out = parseMarkdown(SAMPLE1);
  expect(out).toMatchSnapshot();
});
