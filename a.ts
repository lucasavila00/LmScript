import { createSglModel } from "./model.ts";
import { pipeline } from "./pipeline.ts";
import { InitializedModel } from "./types.ts";

const illustratePerson = (s: InitializedModel, quote: string, title: string) =>
  pipeline(
    s`<s> [INST] Instruct the generation of a pencil drawing of a person to illustrate the following answer to the question below:

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
Time Period: "In the 2020s" [/INST]\n`,
    (s) => s`Camera Angle: "Close-up shot of the face"\n`,
    (s) => s`Scene: "`,
    (s) => s.gen("scene", { stop: ['"', ".", "\n"], maxTokens: 512 }),
    (s) => s`"\n`,
    (s) => s`Subject: "`,
    (s) => s.gen("subject", { stop: ['"', ".", "\n"], maxTokens: 512 }),
    (s) => s`"\n`,
    (s) => s`Subject Emotion: "`,
    (s) => s.gen("emotion", { stop: ['"', ".", "\n"], maxTokens: 512 }),
    (s) => s`"\n`,
    (s) => s`Time Period: "`,
    (s) => s.gen("timePeriod", { stop: ['"', ".", "\n"], maxTokens: 512 }),
    (s) => s`"\n`
  );

const main = async () => {
  const model = createSglModel(`http://localhost:30004`, {
    temperature: 0.1,
    echo: false,
  });

  const out = await illustratePerson(
    model,
    "The person is happy",
    "What is the person doing?"
  );

  console.log(out.text);
  console.log(out.captured);
  console.log(out.metaInfos);
};

main().catch(console.error);
