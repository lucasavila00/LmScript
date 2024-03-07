import { InitializedModel, SglModel } from "./model.ts";
import { assertIsNever } from "./utils.ts";

const toolUse4 = async (model: InitializedModel, question: string) => {
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

const illustratePerson = (
  model: InitializedModel,
  quote: string,
  title: string
) =>
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

const main = async () => {
  const model = SglModel.build({
    url: `http://localhost:30004`,
    echo: true,
  });

  const [_, captured, conversation] = await model
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

  const [_2, cap2, conversation2] = await toolUse4(model, "What is 2 + 2?");

  console.log(conversation2);
  console.log(cap2);

  const [_3, cap3, conversation3] = await illustratePerson(
    model,
    "The person is happy",
    "What is the person doing?"
  ).run({
    temperature: 0.1,
  });

  console.log(conversation3);
  console.log(cap3);

  // console.log(out.text);
  // console.log(out.captured);
  // console.log(out.metaInfos);

  // const outMut = await illustratePersonMut(
  //   model,
  //   "The person is happy",
  //   "What is the person doing?"
  // );

  // console.log(outMut.text);
  // console.log(outMut.captured);
  // console.log(outMut.metaInfos);

  // const multiTurn = await multiTurnQuestion(
  //   model,
  //   "What is 2 + 2?",
  //   "What is 3 + 3?"
  // );
  // console.log(multiTurn.text);
  // console.log(multiTurn.captured);
  // console.log(multiTurn.metaInfos);

  // const tool1 = await toolUse2(model, "What is 2 + 2?");
  // console.log(tool1.text);
  // console.log(tool1.captured);
  // console.log(tool1.metaInfos);

  // const tool2 = await toolUse(model, "What is 2 + 2?");
  // console.log(tool2.text);
  // console.log(tool2.captured);
  // console.log(tool2.metaInfos);
};

main().catch(console.error);
