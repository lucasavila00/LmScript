import { test, expect } from "vitest";
import { MessageOfAuthorGetter, printCustomError } from "../src/messages-of-author";
import { applyToSource } from "../src/apply-to-source";
import { SamplingParams, LmEditorState } from "../src/types";
import fs from "node:fs";
import path from "node:path";

const compile = (editorState: LmEditorState): string => {
  const state = new MessageOfAuthorGetter(editorState, false);

  const errors = state.getErrors();
  if (errors.length > 0) {
    throw new Error(errors.map(printCustomError).join("\n"));
  }
  const acc = state.getAcc();
  return applyToSource(acc, editorState.variables);
};

const SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.1,
};

test("empty state", async () => {
  const msgs = compile({
    version: "1",
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [{ type: "authorSelect", attrs: { author: "user" } }],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    "export default (client: InitClient, {}) => client.user(m => m

    )"
  `);
});

test("handles paragraph", async () => {
  const msgs = compile({
    version: "1",
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [
        { type: "authorSelect", attrs: { author: "user" } },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "What is the best subject for the illustration to accompany the following?",
            },
          ],
        },
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    "export default (client: InitClient, {}) => client.user(m => m
       .push("What is the best subject for the illustration to accompany the following?")
    )"
  `);
});

test("handles heading", async () => {
  const msgs = compile({
    version: "1",
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [
        { type: "authorSelect", attrs: { author: "user" } },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Content" }],
        },
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    "export default (client: InitClient, {}) => client.user(m => m
       .push("### Content")
    )"
  `);
});

test("handles variableSelect", async () => {
  const msgs = compile({
    version: "1",
    variables: [
      {
        name: "content",
        value: 'Question: "What is the person doing?" Answer: "The person is happy"',
        uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5",
      },
    ],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [
        { type: "authorSelect", attrs: { author: "user" } },
        {
          type: "paragraph",
          content: [
            { type: "text", text: '"' },
            {
              type: "variableSelect",
              attrs: { uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5" },
            },
            { type: "text", text: '"' },
          ],
        },
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    "export default (client: InitClient, {content = "Question: \\"What is the person doing?\\" Answer: \\"The person is happy\\""}) => client.user(m => m
       .push("\\"")
       .push(content)
       .push("\\"")
    )"
  `);
});

test("handles lmGenerator", async () => {
  const msgs = compile({
    version: "1",
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [
        { type: "authorSelect", attrs: { author: "user" } },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Explanation: " },
            {
              type: "lmGenerator",
              attrs: {
                id: "720ddbc0-12e6-4583-83b6-d0229a60445b",
                choices: [],
                type: "generation",
                max_tokens: 256,
                name: "_explanation",
                stop: ["\n"],
              },
            },
          ],
        },
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    "export default (client: InitClient, {}) => client.user(m => m
       .push("Explanation:")
       .gen("_explanation", {"maxTokens":256,"stop":["\\n"]})
       .push("")
    )"
  `);
});

const generateOneFile = (inFile: string) => {
  const init = JSON.parse(fs.readFileSync(path.join(__dirname, inFile), "utf-8"));

  const outFile = inFile
    .replace(".json", ".ts")
    .replace("assets/gui-files", "examples/client/src/generated");
  // const outFile = "../../../examples/client/src/generated/init.ts"
  const source = compile(init as any);

  const filePath = path.join(__dirname, outFile);
  fs.writeFileSync(
    filePath,
    `import type { InitClient } from "@lmscript/client";
  ${source}`,
  );

  const { execSync } = require("child_process");
  execSync(`npx prettier --write ${filePath}`);
};

const generateOneFolder = (inFolder: string) => {
  const files = fs.readdirSync(path.join(__dirname, inFolder));
  for (const inFile of files) {
    if (inFile.endsWith(".json")) {
      generateOneFile(path.join(inFolder, inFile));
    }

    // if is folder
    if (fs.lstatSync(path.join(__dirname, inFolder, inFile)).isDirectory()) {
      generateOneFolder(path.join(inFolder, inFile));
    }
  }
};
test("auto generated", async () => {
  const inFolder = "../../../assets/gui-files";
  generateOneFolder(inFolder);
});
