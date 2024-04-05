export const INITIAL_MARKDOWN = `### Adding text to context

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
