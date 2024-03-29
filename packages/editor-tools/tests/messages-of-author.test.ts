import { test, expect } from "vitest";
import { CustomError, MessageOfAuthor, MessageOfAuthorGetter } from "../src/messages-of-author";
import { SamplingParams, LmEditorState } from "../src/types";

type TransformSuccess = {
  tag: "success";
  value: MessageOfAuthor[];
};

type TransformError = {
  tag: "error";
  value: CustomError[];
};

type TransformResult = TransformSuccess | TransformError;

const getMessagesOfAuthor = (
  editorState: LmEditorState,
  useGenerationUuids = true,
): TransformResult => {
  const state = new MessageOfAuthorGetter(editorState, useGenerationUuids);

  const errors = state.getErrors();
  if (errors.length > 0) {
    return { tag: "error", value: errors };
  }
  const acc = state.getAcc();
  return { tag: "success", value: acc };
};

const SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.1,
};
test("no author select in first position", async () => {
  const msgs = () =>
    getMessagesOfAuthor({
      version: "1",
      variables: [],
      samplingParams: SAMPLING_PARAMS,
      doc: {
        type: "doc",
        content: [],
      },
    });
  expect(() => msgs()).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected authorSelect at first position]`,
  );
});

test("empty state", async () => {
  const msgs = getMessagesOfAuthor({
    version: "1",
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [{ type: "authorSelect", attrs: { author: "user" } }],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "tasks": [],
        },
      ],
    }
  `);
});

test("handles paragraph", async () => {
  const msgs = getMessagesOfAuthor({
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
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "tasks": [
            {
              "tag": "AddTextTask",
              "text": "What is the best subject for the illustration to accompany the following?",
            },
          ],
        },
      ],
    }
  `);
});

test("handles heading", async () => {
  const msgs = getMessagesOfAuthor({
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
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "tasks": [
            {
              "tag": "AddTextTask",
              "text": "### Content",
            },
          ],
        },
      ],
    }
  `);
});

test("handles variableSelect", async () => {
  const msgs = getMessagesOfAuthor({
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
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "tasks": [
            {
              "tag": "AddTextTask",
              "text": ""Question: "What is the person doing?" Answer: "The person is happy""",
            },
          ],
        },
      ],
    }
  `);
});

test("handles missing variableSelect", async () => {
  const msgs = getMessagesOfAuthor({
    version: "1",
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [
        { type: "authorSelect", attrs: { author: "user" } },
        {
          type: "paragraph",
          content: [{ type: "variableSelect", attrs: { uuid: "content" } }],
        },
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "error",
      "value": [
        {
          "tag": "variable-not-found",
          "variableId": "content",
        },
      ],
    }
  `);
});

test("handles lmGenerator", async () => {
  const msgs = getMessagesOfAuthor({
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
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "tasks": [
            {
              "tag": "AddTextTask",
              "text": "Explanation: ",
            },
            {
              "max_tokens": 256,
              "name": "720ddbc0-12e6-4583-83b6-d0229a60445b",
              "regex": undefined,
              "stop": [
                "
    ",
              ],
              "tag": "GenerateTask",
            },
            {
              "tag": "AddTextTask",
              "text": "",
            },
          ],
        },
      ],
    }
  `);
});

test("handles lmGenerator, use names", async () => {
  const msgs = getMessagesOfAuthor(
    {
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
    },
    false,
  );
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "tasks": [
            {
              "tag": "AddTextTask",
              "text": "Explanation: ",
            },
            {
              "max_tokens": 256,
              "name": "_explanation",
              "regex": undefined,
              "stop": [
                "
    ",
              ],
              "tag": "GenerateTask",
            },
            {
              "tag": "AddTextTask",
              "text": "",
            },
          ],
        },
      ],
    }
  `);
});
