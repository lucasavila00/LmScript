import { InitClient, SglClient } from "../src/mod.ts";
import {
  GenerationThread,
  SglFetcher,
  TasksOutput,
} from "../src/sgl-fetcher.ts";
import { assertIsNever } from "../src/utils.ts";

const toolUse = async (model: InitClient, question: string) => {
  const [thread, captured] = await model
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

const illustratePerson = (model: InitClient, quote: string, title: string) =>
  model
    .push(
      `<s> [INST] Instruct the generation of a pencil drawing of a person to illustrate the following answer to the question below:

### Question
"${title}"

### Answer
"${quote}"

### Instructions

The illustration should be universally readable and *must not* contain any text.

The illustration *must not* contain any offensive or controversial elements.

The illustration should contain just a single scene, at one single point in time. There should be no movement, action or cause and effect.

The illustration *must not* contain crowds or groups of people.

Be as specific as possible, always specify the sex, race and nationality and time period of the people in the scene.

If you cannot specify sex, race or nationality, or time period, you do not need to specify it.

Answer in the following format, with a single short phrase for each section, with no line breaks.

First, the camera angle of the illustration.

Second, the scene where the person is, do not include the name of the place, just describe the place. Do not include details about the place. Be short and specific.

Third, the subject of the illustration, where you should not include the name of the person in the scene, just describe the person features and clothes. Do not describe the action the person is doing, or what the person holds.

Fourth, the emotion the person is feeling.

Fifth, the time period of the scene.

For example:

#### Example 1
Camera Angle: "Close-up shot of the face"
Scene: "A bright library"
Subject: "A young black woman wearing a bright dress"
Subject Emotion: "Happy"
Time Period: "In the 1960s"

#### Example 2
Camera Angle: "Close-up shot of the face"
Scene: "A castle"
Subject: "Two white medieval french wearing armor"
Subject Emotion: "Serious"
Time Period: "In the 1300s"

#### Example 3
Camera Angle: "Close-up shot of the face"
Scene: "A movie theater"
Subject: "A young black man wearing a dark suit"
Subject Emotion: "Sad"
Time Period: "In the 2020s" [/INST]\n`
    )
    // Force the model to generate a close-up illustration
    .push(`Camera Angle: "Close-up shot of the face"\n`)

    // start scene
    .push(`Scene: "`)
    .gen("scene", { stop: ['"', ".", "\n"], maxTokens: 512 })
    .push(`"\n`)

    // start subject
    .push(`Subject: "`)
    .gen("subject", { stop: ['"', ".", "\n"], maxTokens: 512 })
    .push(`"\n`)

    // start emotion
    .push(`Subject Emotion: "`)
    .gen("emotion", { stop: ['"', ".", "\n"], maxTokens: 512 })
    .push(`"\n`)

    // start time period
    .push(`Time Period: "`)
    .gen("timePeriod", { stop: ['"', ".", "\n"], maxTokens: 512 })
    .push(`"\n`);

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

const main = async (client: InitClient) => {
  const [_, captured, conversation] = await client
    .push(`<s> [INST] What is the sum of 2 + 2? Answer shortly. [/INST] `)
    .gen("expression", {
      stop: ["</s>"],
      maxTokens: 512,
    })
    .push(` </s>`)
    .run({
      temperature: 0.1,
    });
  console.log(conversation);
  console.log(captured.expression);

  const [_2, cap2, conversation2] = await toolUse(client, "What is 2 + 2?");

  console.log(conversation2);
  console.log(cap2);

  const [_3, cap3, conversation3] = await illustratePerson(
    client,
    "The person is happy",
    "What is the person doing?"
  ).run({
    temperature: 0.1,
  });

  console.log(conversation3);
  console.log(cap3);

  const [_4, cap4, conversation4] = await multiTurnQuestion(
    client,
    "What is 2 + 2?",
    "What is 3 + 3?"
  );
  console.log(conversation4);
  console.log(cap4);

  //   const [_5, cap5, conversation5] = await characterGen(
  //     client,
  //     "Harry Potter"
  //   ).run({
  //     temperature: 0.1,
  //   });

  //   console.log(conversation5);
  //   console.log(cap5);
};
class RunpodFetcher implements SglFetcher {
  #url: string;
  #apiToken: string;
  constructor(url: string, apiToken: string) {
    this.#url = url;
    this.#apiToken = apiToken;
  }
  #monitorProgress<T>(_id: string): Promise<T> {
    throw new Error("IN_PROGRESS Not implemented");
  }
  async runThread(data: GenerationThread): Promise<TasksOutput> {
    console.log(
      `[${new Date().toISOString()}] Sending request to Runpod - ${JSON.stringify(
        data
      )}`
    );
    const response = await fetch(this.#url + "/runsync", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.#apiToken}`,
      },
      method: "POST",
      body: JSON.stringify({
        input: {
          endpoint: "generate_thread",
          parameters: data,
        },
      }),
    });
    if (!response.ok) {
      console.error((await response.text()).slice(0, 500));
      throw new Error("HTTP error " + response.status);
    }

    const out = await response.json();
    if (out.status == "COMPLETED") {
      return out.output;
    }
    if (out.status == "IN_PROGRESS") {
      console.log(out);
      return this.#monitorProgress(out.id);
    }
    if (out.status == "IN_QUEUE") {
      console.log(out);
      return this.#monitorProgress(out.id);
    }
    throw new Error("Runpod error: " + JSON.stringify(out));
  }
}
const getEnvVarOrThrow = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} not set`);
  }
  return value;
};
const bench = async () => {
  const promptTokens = 0;
  const completionTokens = 0;
  const model = new SglClient(
    new RunpodFetcher(
      getEnvVarOrThrow("RUNPOD_URL"),
      getEnvVarOrThrow("RUNPOD_TOKEN")
    ),
    {
      template: "llama-2-chat",
    }
  );
  const MAX_JOBS = 1;
  const batch = Array.from({ length: MAX_JOBS }, (_, _i) =>
    main(model).catch((e) => {
      console.error(e);
    })
  );

  const start = Date.now();
  await Promise.all(batch);
  const duration = Date.now() - start;
  console.log(`Duration: ${duration}ms`);
  console.log(`Prompt tokens: ${promptTokens}`);
  console.log(`Completion tokens: ${completionTokens}`);

  const promptTokensPerMinute = (promptTokens / duration) * 60000;
  const completionTokensPerMinute = (completionTokens / duration) * 60000;

  console.log(`Prompt tokens per minute: ${promptTokensPerMinute}`);
  console.log(`Completion tokens per minute: ${completionTokensPerMinute}`);
};

bench().catch(console.error);
