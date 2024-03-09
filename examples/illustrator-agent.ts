import { InitClient } from "../src/mod.ts";
import { assertIsNever } from "../src/utils.ts";

const PERSON_ILLUSTRATOR = "A person." as const;
const OBJECT_ILLUSTRATOR = "An object." as const;
class IllustrationPromptAgent {
  readonly #client: InitClient;
  constructor(client: InitClient) {
    this.#client = client;
  }

  #getIllustrationKind(content: string) {
    return this.#client
      .user((c) =>
        c.push(
          `What is the best subject for the illustration to accompany the following?

### Content
"${content}"

### Instructions

First explain why you're choosing the best subject for the illustration, then choose the best subject for the illustration, either a person or an object.
Answer with just "${PERSON_ILLUSTRATOR}" or "${OBJECT_ILLUSTRATOR}". 

For example:

#### Example 1
Explanation: I'm choosing a person because the scene is about a person.
Illustrate: ${PERSON_ILLUSTRATOR}

#### Example 2
Explanation: I'm choosing an object because the scene is about an object.
Illustrate: ${OBJECT_ILLUSTRATOR}`
        )
      )
      .assistant((c) =>
        c
          .push(`Explanation: `)
          .gen("_explanation", { stop: "\n", maxTokens: 512 })
          .push("\n")
          .push(`Illustrate: `)
          .select("illustrator", {
            choices: [PERSON_ILLUSTRATOR, OBJECT_ILLUSTRATOR],
          })
      );
  }

  #getPersonIllustrationPrompt(content: string) {
    return this.#client
      .user((c) =>
        c.push(
          `Instruct the generation of a pencil drawing of a person to illustrate the following:

### Content
"${content}"

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
Time Period: "In the 2020s"`
        )
      )
      .assistant((c) =>
        c
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
          .push(`"\n`)
      );
  }
  #getObjectIllustrationPrompt(content: string) {
    return this.#client
      .user((c) =>
        c.push(
          `Instruct the generation of a pencil drawing of an object that illustrate the following:

### Content
"${content}"

### Instructions

The illustration should be of an object, not a person.

The illustration should be universally readable and *must not* contain any text.

The illustration *must not* contain any offensive or controversial elements.

Do not include any people in the illustration.

Answer in the following format, with a single short phrase for each section, with no line breaks.

First, the object of the illustration.

Second, the scene where the object is, do not include the name of the place, just describe the place. Do not include details about the place. Be short and specific.

Third, the time period of the scene.

For example:

#### Example 1
Object: "A bright red apple"
Scene: "A bright kitchen"
Time Period: "In the 1940s"

#### Example 2
Object: "A laboratory flask"
Scene: "A laboratory"
Time Period: "In the 2020s" 

#### Example 3
Object: "A big flowing river"
Scene: "A forest"
Time Period: "In the 1500s"`
        )
      )
      .assistant((c) =>
        c
          .push(`Object: `)
          .gen("object", { stop: ['"', ".", "\n"], maxTokens: 512 })
          .push(`\n`)
          .push(`Scene: `)
          .gen("scene", { stop: ['"', ".", "\n"], maxTokens: 512 })
          .push(`\n`)
          .push(`Time Period: `)
          .gen("timePeriod", { stop: ['"', ".", "\n"], maxTokens: 512 })
          .push(`</s>\n`)
      );
  }

  async getIllustrationPrompt(content: string): Promise<string> {
    const [{ illustrator }] = await this.#getIllustrationKind(content).run();
    switch (illustrator) {
      case PERSON_ILLUSTRATOR: {
        const [{ emotion, subject, scene, timePeriod }] =
          await this.#getPersonIllustrationPrompt(content).run();
        return `${emotion} ${subject} in ${scene}. ${timePeriod}. Close-up of the face.`;
      }
      case OBJECT_ILLUSTRATOR: {
        const [{ object, scene, timePeriod }] =
          await this.#getObjectIllustrationPrompt(content).run();
        return `${object} in ${scene}. ${timePeriod}.`;
      }
      default: {
        return assertIsNever(illustrator);
      }
    }
  }
}
export const getIllustrationPrompt = (
  client: InitClient,
  content: string
): Promise<string> =>
  new IllustrationPromptAgent(client).getIllustrationPrompt(content);
