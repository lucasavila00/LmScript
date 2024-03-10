import { InitClient } from "../src/mod.ts";
import { assertIsNever } from "../src/utils.ts";
import { getIllustrationPrompt } from "./illustrator-agent.ts";
const toolUse = async (model: InitClient, question: string) => {
  const [captured, thread] = await model
    .push(`To answer this question: ${question}. `)
    .push(`I need to use a `)
    .select("tool", {
      choices: ["calculator", "search engine"],
    })
    .push(`. `)
    .run();

  switch (captured.tool) {
    case "calculator":
      return thread.push(`The math expression is `).gen("expression").run();
    case "search engine":
      return thread.push(`The key word to search is `).gen("word").run();
    default:
      return assertIsNever(captured.tool);
  }
};

const toolUseMatching = async (model: InitClient, question: string) => {
  return await model
    .push(`To answer this question: ${question}. `)
    .push(`I need to use a `)
    .select("tool", {
      choices: ["calculator", "search engine"],
    })
    .push(`. `)
    .match("tool")({
      calculator: (thread) =>
        thread.push(`The math expression is `).gen("tool_usage"),
      "search engine": (thread) =>
        thread.push(`The key word to search is `).gen("tool_usage"),
    })
    .run();
};

const multiTurnQuestion = (
  model: InitClient,
  question1: string,
  question2: string
) =>
  model
    .system((m) => m.push("You are a helpful assistant."))
    .user((m) => m.push(question1))
    .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
    .user((m) => m.push(question2))
    .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
    .run();

// const characterRegex = `\\{
//   "name": "[\\w\\d\\s]{1,16}",
//   "house": "(Gryffindor|Slytherin|Ravenclaw|Hufflepuff)",
//   "blood status": "(Pure-blood|Half-blood|Muggle-born)",
//   "occupation": "(student|teacher|auror|ministry of magic|death eater|order of the phoenix)",
//   "wand": \\{
//     "wood": "[\\w\\d\\s]{1,16}",
//     "core": "[\\w\\d\\s]{1,16}",
//     "length": [0-9]{1,2}\\.[0-9]{0,2}
//   \\},
//   "patronus": "[\\w\\d\\s]{1,16}",
//   "alive": "(Alive|Deceased)",
//   "bogart": "[\\w\\d\\s]{1,16}"
// \\}`;
// const characterGen = (model: InitClient, name: string) =>
//   model
//     .push(
//       `${name} is a character in Harry Potter. Please fill in the following information about this character.\n`
//     )
//     .gen("json_output", { maxTokens: 256, regex: characterRegex });

export const kitchenSink = async (client: InitClient) => {
  const [captured, _, conversation] = await client
    .push(`<s> [INST] What is the sum of 2 + 2? Answer shortly. [/INST] `)
    .gen("expression", {
      maxTokens: 512,
    })
    .push(` </s>`)
    .push("Repeating: ")
    .repeat("expression")
    .run();
  console.log(conversation);
  console.log(captured);

  const [cap2, _2, conversation2] = await toolUse(client, "What is 2 + 2?");

  console.log(conversation2);
  console.log(cap2);
  const [cap22, _22, conversation22] = await toolUseMatching(
    client,
    "What is 2 + 2?"
  );

  console.log(conversation22);
  console.log(cap22);

  const illustrationPrompt = await getIllustrationPrompt(
    client,
    `Question: "What is the person doing?" Answer: "The person is happy"`
  );

  console.log(illustrationPrompt);

  const [cap4, _4, conversation4] = await multiTurnQuestion(
    client,
    "What is 2 + 2?",
    "What is 3 + 3?"
  );
  console.log(conversation4);
  console.log(cap4);

  // const [_5, cap5, conversation5] = await characterGen(
  //   client,
  //   "Harry Potter"
  // ).run({
  //   temperature: 0.1,
  // });

  // console.log(conversation5);
  // console.log(cap5);
};
