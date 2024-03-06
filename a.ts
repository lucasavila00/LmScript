import { pipeline } from "./pipeline.ts";
import { InitializedModel, StateFn, gen } from "./types.ts";
import { assertIsNever } from "./utils.ts";

// const illustratePerson = (s: InitializedModel, quote: string, title: string) =>
//   pipeline(
//     s`<s> [INST] Instruct the generation of a pencil drawing of a person to illustrate the following answer to the question below:

// ### Question
// "${title}"

// ### Answer
// "${quote}"

// ### Instructions

// The illustration should be universally readable and *must not* contain any text.

// The illustration *must not* contain any offensive or controversial elements.

// The illustration should contain just a single scene, at one single point in time. There should be no movement, action or cause and effect.

// The illustration *must not* contain crowds or groups of people.

// Be as specific as possible, always specify the sex, race and nationality and time period of the people in the scene.

// If you cannot specify sex, race or nationality, or time period, you do not need to specify it.

// Answer in the following format, with a single short phrase for each section, with no line breaks.

// First, the camera angle of the illustration.

// Second, the scene where the person is, do not include the name of the place, just describe the place. Do not include details about the place. Be short and specific.

// Third, the subject of the illustration, where you should not include the name of the person in the scene, just describe the person features and clothes. Do not describe the action the person is doing, or what the person holds.

// Fourth, the emotion the person is feeling.

// Fifth, the time period of the scene.

// For example:

// #### Example 1
// Camera Angle: "Close-up shot of the face"
// Scene: "A bright library"
// Subject: "A young black woman wearing a bright dress"
// Subject Emotion: "Happy"
// Time Period: "In the 1960s"

// #### Example 2
// Camera Angle: "Close-up shot of the face"
// Scene: "A castle"
// Subject: "Two white medieval french wearing armor"
// Subject Emotion: "Serious"
// Time Period: "In the 1300s"

// #### Example 3
// Camera Angle: "Close-up shot of the face"
// Scene: "A movie theater"
// Subject: "A young black man wearing a dark suit"
// Subject Emotion: "Sad"
// Time Period: "In the 2020s" [/INST]\n`,
//     (s) => s`Camera Angle: "Close-up shot of the face"\n`,
//     (s) => s`Scene: "`,
//     (s) => s.gen("scene", { stop: ['"', ".", "\n"], maxTokens: 512 }),
//     (s) => s`"\n`,
//     (s) => s`Subject: "`,
//     (s) => s.gen("subject", { stop: ['"', ".", "\n"], maxTokens: 512 }),
//     (s) => s`"\n`,
//     (s) => s`Subject Emotion: "`,
//     (s) => s.gen("emotion", { stop: ['"', ".", "\n"], maxTokens: 512 }),
//     (s) => s`"\n`,
//     (s) => s`Time Period: "`,
//     (s) => s.gen("timePeriod", { stop: ['"', ".", "\n"], maxTokens: 512 }),
//     (s) => s`"\n`
//   );

// const illustratePersonMut = async (
//   model: InitializedModel,
//   quote: string,
//   title: string
// ) => {
//   const s = model.mutable();
//   await s`<s> [INST] Instruct the generation of a pencil drawing of a person to illustrate the following answer to the question below:

// ### Question
// "${title}"

// ### Answer
// "${quote}"

// ### Instructions

// The illustration should be universally readable and *must not* contain any text.

// The illustration *must not* contain any offensive or controversial elements.

// The illustration should contain just a single scene, at one single point in time. There should be no movement, action or cause and effect.

// The illustration *must not* contain crowds or groups of people.

// Be as specific as possible, always specify the sex, race and nationality and time period of the people in the scene.

// If you cannot specify sex, race or nationality, or time period, you do not need to specify it.

// Answer in the following format, with a single short phrase for each section, with no line breaks.

// First, the camera angle of the illustration.

// Second, the scene where the person is, do not include the name of the place, just describe the place. Do not include details about the place. Be short and specific.

// Third, the subject of the illustration, where you should not include the name of the person in the scene, just describe the person features and clothes. Do not describe the action the person is doing, or what the person holds.

// Fourth, the emotion the person is feeling.

// Fifth, the time period of the scene.

// For example:

// #### Example 1
// Camera Angle: "Close-up shot of the face"
// Scene: "A bright library"
// Subject: "A young black woman wearing a bright dress"
// Subject Emotion: "Happy"
// Time Period: "In the 1960s"

// #### Example 2
// Camera Angle: "Close-up shot of the face"
// Scene: "A castle"
// Subject: "Two white medieval french wearing armor"
// Subject Emotion: "Serious"
// Time Period: "In the 1300s"

// #### Example 3
// Camera Angle: "Close-up shot of the face"
// Scene: "A movie theater"
// Subject: "A young black man wearing a dark suit"
// Subject Emotion: "Sad"
// Time Period: "In the 2020s" [/INST]\n`;
//   await s`Camera Angle: "Close-up shot of the face"\n`;
//   await s`Scene: "`;
//   await s.gen("scene", { stop: ['"', ".", "\n"], maxTokens: 512 });
//   await s`"\n`;
//   await s`Subject: "`;
//   await s.gen("subject", { stop: ['"', ".", "\n"], maxTokens: 512 });
//   await s`"\n`;
//   await s`Subject Emotion: "`;
//   await s.gen("emotion", { stop: ['"', ".", "\n"], maxTokens: 512 });
//   await s`"\n`;
//   await s`Time Period: "`;
//   await s.gen("timePeriod", { stop: ['"', ".", "\n"], maxTokens: 512 });
//   await s`"\n`;

//   return s;
// };
// //   @function
// // def multi_turn_question(s, question_1, question_2):
// //     s += system("You are a helpful assistant.")
// //     s += user(question_1)
// //     s += assistant(gen("answer_1", max_tokens=256))
// //     s += user(question_2)
// //     s += assistant(gen("answer_2", max_tokens=256))
// const multiTurnQuestion = (
//   s: InitializedModel,
//   question1: string,
//   question2: string
// ) =>
//   pipeline(
//     s.system`You are a helpful assistant.`,
//     (s) => s.user`${question1}`,
//     (s) => s.assistant.gen("answer1", { maxTokens: 256 }),
//     (s) => s.user`${question2}`,
//     (s) => s.assistant.gen("answer2", { maxTokens: 256 })
//   );

// //   @sgl.function
// // def tool_use(s, question):
// //     s += "To answer this question: " + question + ". "
// //     s += "I need to use a " + sgl.gen("tool", choices=["calculator", "search engine"]) + ". "

// //     if s["tool"] == "calculator":
// //         s += "The math expression is" + sgl.gen("expression")
// //     elif s["tool"] == "search engine":
// //         s += "The key word to search is" + sgl.gen("word")

// const toolUse2 = async (
//   s: InitializedModel,
//   question: string
// ): Promise<StateFn<{ tool: string; expression?: string; word?: string }>> => {
//   const toolState = await pipeline(
//     s`To answer this question: ${question}. `,
//     (s) => s`I need to use a `,
//     (s) =>
//       s.select("tool", {
//         choices: ["calculator", "search engine"],
//       }),
//     (s) => s`. `
//   );

//   switch (toolState.captured.tool) {
//     case "calculator":
//       return toolState`The math expression is ${gen("expression")}`;
//     case "search engine":
//       return toolState`The key word to search is ${gen("word")}`;
//     default:
//       return assertIsNever(toolState.captured.tool);
//   }
// };

// const toolUse3 = async (model: InitializedModel, question: string) => {
//   const s = model.mutable();
//   await s`To answer this question: ${question}. `;
//   await s`I need to use a `;
//   await s.select("tool", {
//     choices: ["calculator", "search engine"],
//   });
//   await s`. `;

//   switch (s.captured.tool) {
//     case "calculator":
//       return s`The math expression is ${gen("expression")}`;
//     case "search engine":
//       return s`The key word to search is ${gen("word")}`;
//     default:
//       throw new Error("Invalid tool");
//   }
// };

const toolUse4 = async (model: InitializedModel, question: string) => {
  const s = await model.talk`To answer this question: ${question}. `
    .talk`I need to use a `.select("tool", {
    choices: ["calculator", "search engine"],
  }).talk`. `;

  switch (s.captured.tool) {
    case "calculator":
      return s`The math expression is ${gen("expression")}`;
    case "search engine":
      return s`The key word to search is ${gen("word")}`;
    default:
      throw new Error("Invalid tool");
  }
};

const toolUse = (
  s: InitializedModel,
  question: string
): Promise<StateFn<{ tool: string; expression?: string; word?: string }>> =>
  pipeline(
    s`To answer this question: ${question}. `,
    (s) =>
      s`I need to use a ${gen("tool", {
        stop: [".", "\n"],
        maxTokens: 512,
      })}. `,
    (s) => {
      if (s.captured.tool === "calculator") {
        return s`The math expression is ${gen("expression")}`;
      } else if (s.captured.tool === "search engine") {
        return s`The key word to search is ${gen("word")}`;
      } else {
        throw new Error("Invalid tool");
      }
    }
  );
const main = async () => {
  const model = createSglModel(`http://localhost:30004`, {
    temperature: 0.1,
    echo: false,
  });

  // const out = await illustratePerson(
  //   model,
  //   "The person is happy",
  //   "What is the person doing?"
  // );

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
