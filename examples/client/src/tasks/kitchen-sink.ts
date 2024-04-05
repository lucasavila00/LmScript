import { InitClient } from "@lmscript/client";
import { assertIsNever } from "../utils";
import { getIllustrationPrompt } from "./illustrator-agent";
import createSummary from "../generated/fabric/create_summary";
import xmlGeneration from "./xml-generation";
const toolUse = async (model: InitClient, question: string) => {
  const { captured, state: thread } = await model
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
      calculator: (thread) => thread.push(`The math expression is `).gen("tool_usage"),
      "search engine": (thread) => thread.push(`The key word to search is `).gen("tool_usage"),
    })
    .run();
};

const multiTurnQuestion = (model: InitClient, question1: string, question2: string) =>
  model
    .user(question1)
    .assistant((m) => m.gen("answer1", { maxTokens: 64 }))
    .user(question2)
    .assistant((m) => m.gen("answer2", { maxTokens: 64 }))
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
const characterRegex = `\\{
  "name": "[\\w\\d\\s]{1,16}",
  "house": "(Gryffindor|Slytherin|Ravenclaw|Hufflepuff)",
  "blood status": "(Pure-blood|Half-blood|Muggle-born)"
\\}`;
const characterGen = (model: InitClient, name: string) =>
  model
    .push(
      `${name} is a character in Harry Potter. Please fill in the following information about this character.\n`,
    )
    .gen("json_output", { maxTokens: 256, regex: characterRegex });
export const kitchenSink = async (client: InitClient) => {
  const start10 = Date.now();
  const { rawText: conversation10, captured: captured10 } = await xmlGeneration(client).run({
    temperature: 0.0,
  });
  console.log(conversation10);
  console.log(JSON.stringify(captured10, null, 2));
  const end10 = Date.now();
  console.log(`Time taken: ${end10 - start10}ms`);

  const start5 = Date.now();
  const { rawText: conversation5 } = await characterGen(client, "Harry Potter").run({
    temperature: 0.1,
  });

  console.log(conversation5);
  const end5 = Date.now();
  console.log(`Time taken: ${end5 - start5}ms`);

  const start1 = Date.now();
  const { rawText: conversation7 } = await client
    .user((m) => m.push("Write a markdown list of 5 funny names for a cat."))
    .assistant((m) =>
      m.gen("markdown_list", { regex: `(\\- [\\w\\d ]{1,32}\\n){5}`, maxTokens: 64 }),
    )
    .run({
      temperature: 0.0,
    });

  const end1 = Date.now();
  console.log(conversation7);
  console.log(`Time taken: ${end1 - start1}ms`);

  const start2 = Date.now();
  const { rawText: conversation8 } = await client
    .user((m) => m.push("Write a markdown list of 5 funny names for a cat."))
    .assistant((m) => m.push("-").gen({ maxTokens: 64 }))
    .run({
      temperature: 0.0,
    });

  const end2 = Date.now();

  console.log(conversation8);
  console.log(`Time taken: ${end2 - start2}ms`);

  const { rawText: conversation6 } = await createSummary(client, {
    input:
      "Charles Richardson (c.10 March 1769 - 10 November 1850) was an English Royal Navy officer. He joined HMS Vestal in 1787, where he made an aborted journey to China before serving on the East Indies Station. He transferred to HMS Phoenix and fought in the Battle of Tellicherry. With HMS Circe he combated the Nore mutiny and fought in the Battle of Camperdown, capturing Jan Willem de Winter. He fought in the Battle of Callantsoog and the Vlieter incident, sailed to Egypt, and fought in the battles of Abukir, Mandora, and Alexandria. Commanding HMS Alligator, he was sent to the Leeward Islands Station during the Napoleonic Wars, where he captured three Dutch settlements. He transferred to HMS Topaze in 1821 and sailed to China, where his crew killed two locals in self-defence. The resulting diplomatic incident strained Richardson's health and he was invalided home, where he was appointed Knight Commander of the Order of the Bath and promoted to vice-admiral. He died of influenza in Painsthorpe.",
  }).run({
    temperature: 0.1,
  });

  console.log(conversation6);
  const { rawText: conversation4 } = await multiTurnQuestion(
    client,
    "What is 2 + 2?",
    "What is 3 + 3?",
  );
  console.log(conversation4);

  const { rawText: conversation } = await client
    .push(`<s>[INST] What is the sum of 2 + 2? Answer shortly. [/INST]`)
    .gen("expression", {
      maxTokens: 512,
    })
    .push(`</s>`)
    .push("Repeating: ")
    .repeat("expression")
    .run();
  console.log(conversation);

  const { rawText: conversation2 } = await toolUse(client, "What is 2 + 2?");

  console.log(conversation2);
  const { rawText: conversation22 } = await toolUseMatching(client, "What is 2 + 2?");

  console.log(conversation22);

  const illustrationPrompt = await getIllustrationPrompt(
    client,
    `Question: "What is the person doing?" Answer: "The person is happy"`,
  );

  console.log(illustrationPrompt);
};
