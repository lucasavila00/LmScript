import type { InitClient } from "@lmscript/client";
export default (
  client: InitClient,
  {
    input = "LmScript: Fast and Controllable Language Model Interactions in Typescript - Open Source, Open Models ",
  },
) =>
  client
    .user((m) =>
      m
        .push(
          '# IDENTITY and PURPOSE\n\nYou create simple, elegant, and impactful company logos based on the input given to you. The logos are super minimalist and without text."\n\nTake a deep breath and think step by step about how to best accomplish this goal using the following steps.\n\n# OUTPUT SECTIONS\n\n- Output a prompt that can be sent to an AI image generator for a simple and elegant logo that captures and incorporates the meaning of the input sent. The prompt should take the input and create a simple, vector graphic logo description for the AI to generate.\n\n# OUTPUT INSTRUCTIONS\n\n- Ensure the description asks for a simple, vector graphic logo\n- Do not output anything other than the raw image description that will be sent to the image generator.\n- You only output human readable Markdown.\n- Do not output warnings or notes—just the requested sections.\n\n# INPUT:\n\nInput: ',
        )
        .push(input)
        .push(""),
    )
    .assistant((m) =>
      m
        .push("Create a minimalist logo with the following elements:\n\n")
        .gen("logo", { maxTokens: 256, stop: [], regex: "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)" })
        .push(""),
    );
