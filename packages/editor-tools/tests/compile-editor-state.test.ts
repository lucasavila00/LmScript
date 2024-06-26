import { test, expect } from "vitest";
import { SamplingParams } from "../src/types";
import { compileEditorState } from "../src/mod";

const SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.1,
};
test("handles paragraph", async () => {
  const msgs = compileEditorState(
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
              {
                type: "text",
                text: "What is the best subject for the illustration to accompany the following?",
              },
            ],
          },
        ],
      },
    },
    {},
  );
  expect(msgs).toMatchInlineSnapshot(`
    [
      {
        "role": "user",
        "tag": "StartRoleTask",
      },
      {
        "tag": "AddTextTask",
        "text": "What is the best subject for the illustration to accompany the following?",
      },
    ]
  `);
});

test("handles variable override", async () => {
  const msgs = compileEditorState(
    {
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
    },
    {},
  );
  expect(msgs).toMatchInlineSnapshot(`
    [
      {
        "role": "user",
        "tag": "StartRoleTask",
      },
      {
        "tag": "AddTextTask",
        "text": """,
      },
      {
        "tag": "AddTextTask",
        "text": "Question: "What is the person doing?" Answer: "The person is happy"",
      },
      {
        "tag": "AddTextTask",
        "text": """,
      },
    ]
  `);
});
test("handles variable override", async () => {
  const msgs = compileEditorState(
    {
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
    },
    {
      variableOverrides: {
        content: "The new content",
      },
    },
  );
  expect(msgs).toMatchInlineSnapshot(`
    [
      {
        "role": "user",
        "tag": "StartRoleTask",
      },
      {
        "tag": "AddTextTask",
        "text": """,
      },
      {
        "tag": "AddTextTask",
        "text": "The new content",
      },
      {
        "tag": "AddTextTask",
        "text": """,
      },
    ]
  `);
});

test("handles lmGenerator, use names", async () => {
  const msgs = compileEditorState(
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
    {},
  );
  expect(msgs).toMatchInlineSnapshot(`
    [
      {
        "role": "user",
        "tag": "StartRoleTask",
      },
      {
        "tag": "AddTextTask",
        "text": "Explanation:",
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
    ]
  `);
});
test("handles lmGenerator, use uuids", async () => {
  const msgs = compileEditorState(
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
    {
      useGenerationUuids: true,
    },
  );
  expect(msgs).toMatchInlineSnapshot(`
    [
      {
        "role": "user",
        "tag": "StartRoleTask",
      },
      {
        "tag": "AddTextTask",
        "text": "Explanation:",
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
    ]
  `);
});
